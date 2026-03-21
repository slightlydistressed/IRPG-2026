import { toast, downloadBlob, loadJson } from "./utils.js";
import { getChecklistState, setChecklistState, resetChecklistState } from "./db.js";

export class ChecklistUI{
  constructor({ db, profileId, docId, catalogEl, formWrapEl, formEl, titleEl, searchInput, backBtn, hintEl }){
    this.db = db;
    this.profileId = profileId;
    this.docId = docId;

    this.catalogEl = catalogEl;
    this.formWrapEl = formWrapEl;
    this.formEl = formEl;
    this.titleEl = titleEl;
    this.searchInput = searchInput;
    this.backBtn = backBtn;
    this.hintEl = hintEl;

    this.index = null;
    this.items = [];
    this.current = null;        // checklist manifest item
    this.currentDef = null;     // loaded checklist JSON
    this.state = {};            // answers
    this._saveTimer = null;
  }

  async loadIndex(indexPath){
    this.index = await loadJson(indexPath);
    this.items = Array.isArray(this.index?.items) ? this.index.items : [];
    this.renderCatalog();
  }

  renderCatalog(){
    const q = String(this.searchInput?.value || "").trim().toLowerCase();
    this.catalogEl.innerHTML = "";

    const groups = Array.isArray(this.index?.groups) ? this.index.groups : [];
    const groupTitle = new Map(groups.map(g => [g.id, g.title]));

    const byGroup = new Map();
    for (const item of this.items){
      const t = String(item.title || "");
      if (q && !t.toLowerCase().includes(q)) continue;
      const g = item.group || "other";
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g).push(item);
    }

    for (const [groupId, list] of byGroup.entries()){
      const head = document.createElement("div");
      head.className = "smallmuted";
      head.style.padding = "6px 4px 2px 6px";
      head.style.fontWeight = "900";
      head.textContent = groupTitle.get(groupId) || groupId;
      this.catalogEl.appendChild(head);

      for (const item of list){
        const row = document.createElement("div");
        row.className = "row";

        const main = document.createElement("button");
        main.className = "rowMain";
        main.type = "button";
        main.innerHTML = `
          <div class="rowTitle">${escapeHtml(item.title)}</div>
          <div class="rowSub">${escapeHtml(groupTitle.get(item.group) || item.group || "")}</div>
        `;
        main.addEventListener("click", () => this.openChecklist(item.id));

        const right = document.createElement("div");
        right.className = "rowRight";

        const chev = document.createElement("div");
        chev.className = "chev";
        chev.textContent = "›";

        right.appendChild(chev);
        row.appendChild(main);
        row.appendChild(right);

        this.catalogEl.appendChild(row);
      }
    }

    if (!this.catalogEl.children.length){
      const empty = document.createElement("div");
      empty.className = "emptyNote";
      empty.textContent = "No checklists match your search.";
      this.catalogEl.appendChild(empty);
    }

    function escapeHtml(s){
      return String(s||"").replace(/[&<>"']/g, (m)=>({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
      }[m]));
    }
  }

  async openChecklist(checklistId){
    const item = this.items.find(x => x.id === checklistId);
    if (!item) return;

    this.current = item;
    this.currentDef = await loadJson(item.path);

    this.state = await getChecklistState(this.db, this.profileId, this.docId, checklistId);

    this.titleEl.textContent = this.currentDef.title || item.title || checklistId;
    this.hintEl.textContent = "";

    this.formWrapEl.classList.remove("hidden");
    this.catalogEl.classList.add("hidden");

    this.backBtn?.addEventListener("click", () => this.backToCatalog(), { once:true });

    this.renderForm();
  }

  backToCatalog(){
    this.current = null;
    this.currentDef = null;
    this.state = {};

    this.formWrapEl.classList.add("hidden");
    this.catalogEl.classList.remove("hidden");
    this.titleEl.textContent = "—";
    this.hintEl.textContent = "Select a checklist to begin.";
  }

  renderForm(){
    this.formEl.innerHTML = "";
    const sections = Array.isArray(this.currentDef?.sections) ? this.currentDef.sections : [];
    const fields = Array.isArray(this.currentDef?.fields) ? this.currentDef.fields : [];

    if (sections.length){
      for (const section of sections){
        const title = String(section?.title || "").trim();
        if (title){
          const sectionHead = document.createElement("div");
          sectionHead.className = "formSectionTitle";
          sectionHead.textContent = title;
          this.formEl.appendChild(sectionHead);
        }

        for (const field of (Array.isArray(section?.fields) ? section.fields : [])){
          this.formEl.appendChild(this.createField(field));
        }
      }
      return;
    }

    for (const field of fields){
      this.formEl.appendChild(this.createField(field));
    }
  }

  createField(f){
    const wrap = document.createElement("div");
    wrap.className = "field";

    const head = document.createElement("div");
    head.className = "fieldHead";

    const label = document.createElement("div");
    label.className = "fieldLabel";
    label.textContent = f.label || f.id;

    head.appendChild(label);

    const inp = document.createElement(f.type === "input" ? "input" : "textarea");
    inp.className = "fieldInput";
    inp.value = this.state?.[f.id] || "";
    inp.placeholder = f.placeholder || "";
    if (inp.tagName === "INPUT") inp.type = "text";

    if (f.set){
      const btn = document.createElement("button");
      btn.className = "setBtn";
      btn.type = "button";
      btn.textContent = "Set";
      btn.addEventListener("click", async () => {
        try {
          const v = await this._computeSetValue(f.set);
          this.state[f.id] = v;
          inp.value = v;
          this.queueSave();
          toast("Set.");
        } catch (e) {
          alert(e.message || String(e));
        }
      });
      head.appendChild(btn);
    }

    inp.addEventListener("input", () => {
      this.state[f.id] = inp.value;
      this.queueSave();
    });

    wrap.appendChild(head);
    wrap.appendChild(inp);
    return wrap;
  }

  queueSave(){
    if (!this.current) return;
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(async () => {
      await setChecklistState(this.db, this.profileId, this.docId, this.current.id, this.state);
    }, 180);
  }

  async resetCurrent(){
    if (!this.current) return;
    if (!confirm("Reset this checklist? This clears saved answers on this device.")) return;
    await resetChecklistState(this.db, this.profileId, this.docId, this.current.id);
    this.state = {};
    this.renderForm();
    toast("Checklist reset.");
  }

  exportCurrentJson(){
    if (!this.current) return;
    const out = {
      version: 1,
      checklistId: this.current.id,
      title: this.currentDef?.title || this.current.title,
      exportedAt: Date.now(),
      answers: this.state || {}
    };
    const blob = new Blob([JSON.stringify(out, null, 2)], { type:"application/json" });
    downloadBlob(blob, `irpg-checklist-${this.current.id}.json`);
  }

  async importCurrentJson(file){
    if (!this.current) throw new Error("Pick a checklist first.");
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data || typeof data !== "object") throw new Error("Bad JSON.");
    const answers = data.answers || {};
    this.state = { ...answers };
    await setChecklistState(this.db, this.profileId, this.docId, this.current.id, this.state);
    this.renderForm();
    toast("Imported.");
  }

  exportCurrentWord(){
    if (!this.current) return;

    const title = this.currentDef?.title || this.current.title || this.current.id;
    const fields = this.getAllFields();

    // Simple HTML Word document (.doc) – opens in Word reliably
    const lines = fields.map(f => {
      const q = escapeHtml(f.label || f.id);
      const aRaw = String(this.state?.[f.id] || "");
      const a = escapeHtml(aRaw).replace(/\n/g, "<br/>");
      return `
        <div class="block">
          <div class="q">${q}</div>
          <div class="a">${a || "&nbsp;"}</div>
        </div>
      `;
    }).join("\n");

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body{ font-family: Calibri, Arial, sans-serif; margin: 28px; }
            h1{ font-size: 20pt; margin: 0 0 14px 0; }
            .block{ margin: 0 0 14px 0; }
            .q{ font-weight: 700; margin: 0 0 6px 0; }
            .a{ border: 1px solid #ccc; padding: 10px; min-height: 24px; border-radius: 6px; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(title)}</h1>
          ${lines}
        </body>
      </html>
    `.trim();

    const blob = new Blob([html], { type:"application/msword" });
    downloadBlob(blob, `IRPG-${slug(title)}.doc`);

    function slug(s){
      return String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"").slice(0,60) || "checklist";
    }
    function escapeHtml(s){
      return String(s||"").replace(/[&<>"']/g, (m)=>({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
      }[m]));
    }
  }

  async _computeSetValue(kind){
    if (kind === "date"){
      return new Date().toLocaleDateString();
    }
    if (kind === "time"){
      return new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
    }
    if (kind === "gps"){
      if (!navigator.geolocation) throw new Error("Geolocation not available on this device/browser.");
      return await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            resolve(`${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${Math.round(accuracy)}m)`);
          },
          (err) => reject(new Error(err.message || "Failed to get location.")),
          { enableHighAccuracy:true, timeout: 10000, maximumAge: 0 }
        );
      });
    }
    return "";
  }

  getAllFields(){
    if (Array.isArray(this.currentDef?.fields)) return this.currentDef.fields;
    if (Array.isArray(this.currentDef?.sections)){
      return this.currentDef.sections.flatMap((section) =>
        Array.isArray(section?.fields) ? section.fields : []
      );
    }
    return [];
  }
}
