import { $, toast, loadJson, downloadBlob } from "./utils.js";
import { parseRoute, gotoPage } from "./router.js";
import { dbInit, ensureDefaultProfile, getDocState, setDocState, exportAll, importAll } from "./db.js";
import { PdfViewer } from "./pdf-viewer.js";
import { renderToc, findTocNode } from "./toc-ui.js";
import { ChecklistUI } from "./checklist-ui.js";

function escapeHtml(s){
  return String(s||"").replace(/[&<>"']/g, (m)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

const UI = {
  appTitle: $("#appTitle"),
  appSubtitle: $("#appSubtitle"),

  btnToc: $("#btnToc"),
  btnCloseToc: $("#btnCloseToc"),
  tocPanel: $("#tocPanel"),

  tabContents: $("#tabContents"),
  tabBookmarks: $("#tabBookmarks"),
  tabHighlights: $("#tabHighlights"),
  tocView: $("#tocView"),
  bookmarksView: $("#bookmarksView"),
  highlightsView: $("#highlightsView"),
  highlightsList: $("#highlightsList"),

  tocTree: $("#tocTree"),
  tocSearch: $("#tocSearch"),

  bookmarksList: $("#bookmarksList"),
  bookmarksSearch: $("#bookmarksSearch"),

  btnPrev: $("#btnPrev"),
  btnNext: $("#btnNext"),
  pageReadout: $("#pageReadout"),
  pdfScroll: $("#pdfScroll"),

  btnChecklist: $("#btnChecklist"),
  checklistPanel: $("#checklistPanel"),
  btnCloseChecklist: $("#btnCloseChecklist"),

  checklistHint: $("#checklistHint"),
  checklistSearch: $("#checklistSearch"),
  checklistCatalog: $("#checklistCatalog"),
  checklistFormWrap: $("#checklistFormWrap"),
  checklistForm: $("#checklistForm"),
  checklistTitle: $("#checklistTitle"),
  btnChecklistBack: $("#btnChecklistBack"),

  btnResetChecklist: $("#btnResetChecklist"),
  btnExportChecklistWord: $("#btnExportChecklistWord"),
  btnExportChecklistJson: $("#btnExportChecklistJson"),
  fileImportChecklistJson: $("#fileImportChecklistJson"),

  btnTheme: $("#btnTheme"),
  btnFocus: $("#btnFocus"),

  viewAuto: $("#viewAuto"),
  viewMobile: $("#viewMobile"),
  viewDesktop: $("#viewDesktop"),

  btnExportAll: $("#btnExportAll"),
  fileImportAll: $("#fileImportAll"),
};

let db, profileId;
let documents, docManifest;
let pdfViewer, tocController, checklistUI;

let bookmarks = new Set();
let highlights = [];
let activeTocId = null;

function setTheme(theme){
  document.documentElement.dataset.theme = theme;
  UI.btnTheme.textContent = theme === "light" ? "Light" : "Dark";
}

function syncTopbarHeight(){
  const topbar = document.querySelector(".topbar");
  const height = topbar?.offsetHeight || 56;
  document.documentElement.style.setProperty("--topbar-height", `${height}px`);
}

function setViewMode(mode){
  document.documentElement.dataset.viewmode = mode;
  UI.viewAuto.classList.toggle("active", mode === "auto");
  UI.viewMobile.classList.toggle("active", mode === "mobile");
  UI.viewDesktop.classList.toggle("active", mode === "desktop");
}

function toggleDrawer(el, open){
  if (!el) return;
  if (open) el.classList.add("open");
  else el.classList.remove("open");
}

function isDrawerMode(){
  const vm = document.documentElement.dataset.viewmode || "auto";
  if (vm === "mobile") return true;
  if (vm === "desktop") return false;
  return window.matchMedia("(max-width: 980px)").matches;
}

async function registerServiceWorker(){
  if (!("serviceWorker" in navigator)) return;
  try { await navigator.serviceWorker.register("./sw.js"); } catch {}
}

function showLeftTab(which){
  UI.tocView.classList.toggle("hidden", which !== "contents");
  UI.bookmarksView.classList.toggle("hidden", which !== "bookmarks");
  UI.highlightsView.classList.toggle("hidden", which !== "highlights");

  UI.tabContents.classList.toggle("active", which === "contents");
  UI.tabBookmarks.classList.toggle("active", which === "bookmarks");
  UI.tabHighlights.classList.toggle("active", which === "highlights");
}

async function persistBookmarks(){
  await setDocState(db, profileId, docManifest.docId, { bookmarks: Array.from(bookmarks) });
}

function renderBookmarksList(){
  const q = String(UI.bookmarksSearch.value || "").trim().toLowerCase();
  UI.bookmarksList.innerHTML = "";

  const ids = Array.from(bookmarks);
  if (!ids.length){
    const empty = document.createElement("div");
    empty.className = "emptyNote";
    empty.textContent = "No bookmarks yet. Tap 🔖 in Contents to save one.";
    UI.bookmarksList.appendChild(empty);
    return;
  }

  const ordered = [];
  (function walk(nodes){
    for (const n of nodes || []){
      if (bookmarks.has(n.id)) ordered.push(n);
      if (n.children?.length) walk(n.children);
    }
  })(docManifest.toc || []);

  for (const node of ordered){
    const title = String(node.title || "");
    if (q && !title.toLowerCase().includes(q)) continue;

    const row = document.createElement("div");
    row.className = "row";

    const main = document.createElement("button");
    main.className = "rowMain";
    main.type = "button";
    main.innerHTML = `
      <div class="rowTitle">${escapeHtml(title)}</div>
      <div class="rowSub">${node.pageLabel ? `Page ${escapeHtml(String(node.pageLabel))}` : ""}</div>
    `;
    main.addEventListener("click", async () => {
      if (isDrawerMode()) toggleDrawer(UI.tocPanel, false);
      await handleTocSelect(node);
    });

    const right = document.createElement("div");
    right.className = "rowRight";

    const bmBtn = document.createElement("button");
    bmBtn.className = "bmBtn";
    bmBtn.type = "button";
    bmBtn.dataset.on = "true";
    bmBtn.textContent = "🔖";
    bmBtn.title = "Remove bookmark";
    bmBtn.addEventListener("click", async (e) => {
      e.preventDefault(); e.stopPropagation();
      bookmarks.delete(node.id);
      await persistBookmarks();
      tocController?.setBookmarks(bookmarks);
      renderBookmarksList();
      toast("Bookmark removed.");
    });

    const chev = document.createElement("div");
    chev.className = "chev";
    chev.textContent = "›";

    right.appendChild(bmBtn);
    right.appendChild(chev);

    row.appendChild(main);
    row.appendChild(right);
    UI.bookmarksList.appendChild(row);
  }
}

async function toggleBookmark(node){
  if (bookmarks.has(node.id)) bookmarks.delete(node.id);
  else bookmarks.add(node.id);

  await persistBookmarks();
  tocController?.setBookmarks(bookmarks);
  renderBookmarksList();
  toast(bookmarks.has(node.id) ? "Bookmarked." : "Bookmark removed.");
}

function pageIndexFromPageLabel(pageLabel){
  if (!pageLabel) return null;

  let raw = String(pageLabel).trim();
  raw = raw.replace(/^pages?\s+/i, "").trim();
  raw = raw.split(/[–-]/)[0].trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();
  const map = docManifest?.pageLabelMap;

  if (map?.roman && Object.prototype.hasOwnProperty.call(map.roman, lower)){
    const idx = Number(map.roman[lower]);
    return Number.isFinite(idx) ? idx : null;
  }

  const n = Number(raw);
  if (Number.isInteger(n)){
    const off = Number(map?.numericOffset);
    if (Number.isFinite(off)) return n + off;
    return n - 1;
  }

  return null;
}

async function handleTocSelect(node){
  activeTocId = node.id;
  tocController?.setActive(node.id);

  // Jump to page
  let target = null;
  if (Number.isFinite(node.pdfPageIndex)) target = node.pdfPageIndex;
  if (target === null && Number.isFinite(node.pdfPage)) target = Number(node.pdfPage) - 1;
  if (target === null && node.pageLabel) target = pageIndexFromPageLabel(node.pageLabel);

  if (target !== null){
    gotoPage(target);
    await pdfViewer.goToPage(target);
    await setDocState(db, profileId, docManifest.docId, { lastPdfPageIndex: target, lastTocId: node.id });
  } else {
    await setDocState(db, profileId, docManifest.docId, { lastTocId: node.id });
  }

  // If TOC node references a checklistId, open that checklist
  if (node.checklistId){
    toggleDrawer(UI.checklistPanel, true);
    checklistUI?.openChecklist(node.checklistId).catch(()=>{});
  }
}

async function route(){
  const r = parseRoute();
  if (r.type === "page"){
    await pdfViewer.goToPage(r.pageIndex);
  }
}

async function boot(){
  await registerServiceWorker();

  db = await dbInit();
  profileId = await ensureDefaultProfile(db);

  documents = await loadJson("./data/documents.json");
  const doc = documents[0];
  docManifest = await loadJson(doc.manifestPath);

  UI.appTitle.textContent = docManifest.title || "IRPG Offline";
  UI.appSubtitle.textContent = docManifest.docVersion ? `Version ${docManifest.docVersion}` : "Version local";

  const st = await getDocState(db, profileId, docManifest.docId);
  setTheme(st?.theme || "dark");
  setViewMode(st?.viewMode || "auto");
  document.body.classList.toggle("focus", !!st?.focus);

  bookmarks = new Set(Array.isArray(st?.bookmarks) ? st.bookmarks : []);
  highlights = Array.isArray(st?.highlights) ? st.highlights : [];
  syncTopbarHeight();
  window.addEventListener("resize", syncTopbarHeight, { passive: true });

  // PDF
  pdfViewer = new PdfViewer({
    scrollEl: UI.pdfScroll,
    pageReadoutEl: UI.pageReadout,
    onPageChange: async (pageIndex) => {
      await setDocState(db, profileId, docManifest.docId, { lastPdfPageIndex: pageIndex, lastOpenedAt: Date.now() });
    }
  });

  await pdfViewer.load(docManifest.pdf?.path || "pdf/pms461.pdf");

  // Highlights
  pdfViewer.setHighlights?.(highlights);
  renderHighlightsList();

  const onSel = async () => {
    const h = pdfViewer.captureSelectionHighlight?.();
    if (!h) return;
    highlights.push(h);
    await persistHighlights();
    pdfViewer.setHighlights?.(highlights);
    renderHighlightsList();
    toast("Highlighted.");
  };
  UI.pdfScroll?.addEventListener("mouseup", () => setTimeout(onSel, 0));

  // If manifest provides tocPath (group format), load and convert to tree
  if (docManifest.tocPath){
    try {
      const tocData = await loadJson(docManifest.tocPath);
      if (tocData?.groups){
        docManifest.toc = (tocData.groups || []).map(g => ({
          id: "sec-" + slugify(g.title),
          title: g.title,
          pageLabel: "",
          children: (g.items||[]).map(it => ({
            id: slugify(g.title) + "-" + slugify(it.title) + "-" + it.pdfPage,
            title: it.title,
            pageLabel: it.pageLabel || "",
            pdfPageIndex: Number(it.pdfPage) - 1,
            pdfPage: Number(it.pdfPage)
          }))
        }));
        docManifest.pageLabelMap = docManifest.pageLabelMap || {"roman": {"v": 7, "vi": 8, "vii": 9, "viii": 10, "ix": 11, "x": 12, "xii": 14, "xiii": 15}, "numericOffset": 14};
      }
    } catch(e) {}
  }

  // TOC
  tocController = renderToc({
    rootEl: UI.tocTree,
    toc: docManifest.toc || [],
    searchInput: UI.tocSearch,
    bookmarks,
    onToggleBookmark: toggleBookmark,
    onSelect: async (node) => {
      if (isDrawerMode()) toggleDrawer(UI.tocPanel, false);
      await handleTocSelect(node);
    }
  });

  // Checklist UI
  checklistUI = new ChecklistUI({
    db, profileId, docId: docManifest.docId,
    catalogEl: UI.checklistCatalog,
    formWrapEl: UI.checklistFormWrap,
    formEl: UI.checklistForm,
    titleEl: UI.checklistTitle,
    searchInput: UI.checklistSearch,
    backBtn: UI.btnChecklistBack,
    hintEl: UI.checklistHint
  });

  await checklistUI.loadIndex("data/docs/irpg/checklists/index.json");

  // Left panel tabs
  UI.tabContents.addEventListener("click", () => showLeftTab("contents"));
  UI.tabBookmarks.addEventListener("click", () => { showLeftTab("bookmarks"); renderBookmarksList(); });
  UI.tabHighlights.addEventListener("click", () => showLeftTab("highlights"));

  UI.bookmarksSearch.addEventListener("input", renderBookmarksList);

  // Buttons
  UI.btnPrev.addEventListener("click", () => pdfViewer.prev());
  UI.btnNext.addEventListener("click", () => pdfViewer.next());

  UI.btnToc.addEventListener("click", () => toggleDrawer(UI.tocPanel, true));
  UI.btnCloseToc.addEventListener("click", () => toggleDrawer(UI.tocPanel, false));

  UI.btnChecklist.addEventListener("click", () => toggleDrawer(UI.checklistPanel, true));
  UI.btnCloseChecklist.addEventListener("click", () => toggleDrawer(UI.checklistPanel, false));

  UI.checklistSearch.addEventListener("input", () => checklistUI.renderCatalog());

  UI.btnResetChecklist.addEventListener("click", () => checklistUI.resetCurrent());
  UI.btnExportChecklistWord.addEventListener("click", () => checklistUI.exportCurrentWord());
  UI.btnExportChecklistJson.addEventListener("click", () => checklistUI.exportCurrentJson());
  UI.fileImportChecklistJson.addEventListener("change", async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { await checklistUI.importCurrentJson(f); }
    catch (err) { alert(err.message || String(err)); }
    finally { UI.fileImportChecklistJson.value = ""; }
  });

  UI.btnTheme.addEventListener("click", async () => {
    const cur = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const next = cur === "light" ? "dark" : "light";
    setTheme(next);
    await setDocState(db, profileId, docManifest.docId, { theme: next });
  });

  UI.btnFocus.addEventListener("click", async () => {
    document.body.classList.toggle("focus");
    const on = document.body.classList.contains("focus");
    await setDocState(db, profileId, docManifest.docId, { focus: on });
  });

  // View mode
  UI.viewAuto.addEventListener("click", async () => { setViewMode("auto"); await setDocState(db, profileId, docManifest.docId, { viewMode:"auto" }); });
  UI.viewMobile.addEventListener("click", async () => { setViewMode("mobile"); await setDocState(db, profileId, docManifest.docId, { viewMode:"mobile" }); });
  UI.viewDesktop.addEventListener("click", async () => { setViewMode("desktop"); await setDocState(db, profileId, docManifest.docId, { viewMode:"desktop" }); });

  // Export/Import all
  UI.btnExportAll.addEventListener("click", async () => {
    const dump = await exportAll(db, profileId, docManifest.docId);
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type:"application/json" });
    downloadBlob(blob, `irpg-export-${docManifest.docId}-${Date.now()}.json`);
    toast("Exported.");
  });

  UI.fileImportAll.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAll(db, data);
      toast("Imported. Reloading…");
      setTimeout(() => location.reload(), 600);
    } catch (err) {
      alert(`Import failed: ${err.message || err}`);
    } finally {
      UI.fileImportAll.value = "";
    }
  });

  // routing
  window.addEventListener("hashchange", () => route());
  await route();

  // restore last page if no hash
  if (!location.hash || location.hash === "#/" || location.hash === "#"){
    const last = await getDocState(db, profileId, docManifest.docId);
    const pageIndex = Number.isFinite(last?.lastPdfPageIndex) ? last.lastPdfPageIndex : 0;
    gotoPage(pageIndex);
    await pdfViewer.goToPage(pageIndex);
  }

  showLeftTab("contents");
}

boot().catch((err) => {
  console.error(err);
  alert(err?.message || "Failed to start.");
});

async function persistHighlights(){
  await setDocState(db, profileId, docManifest.docId, { highlights });
}

function renderHighlightsList(){
  const list = UI.highlightsList;
  if (!list) return;
  list.innerHTML = "";
  if (!highlights?.length){
    const empty = document.createElement("div");
    empty.className = "emptyNote";
    empty.textContent = "No highlights yet. Drag-select text in the PDF to highlight.";
    list.appendChild(empty);
    return;
  }

  const sorted = [...highlights].sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));
  for (const h of sorted){
    const row = document.createElement("div");
    row.className = "row";

    const main = document.createElement("button");
    main.className = "rowMain";
    main.type="button";
    main.innerHTML = `<div class="rowTitle">PDF ${Number(h.pageIndex)+1}</div><div class="rowSub">${escapeHtml((h.text||"").slice(0,140))}</div>`;
    main.addEventListener("click", async () => {
      showLeftTab("highlights");
      await pdfViewer?.goToHighlight?.(h);
    });

    const meta = document.createElement("div");
    meta.className="rowRight";

    const del = document.createElement("button");
    del.className="bmBtn";
    del.type="button";
    del.title="Delete highlight";
    del.innerHTML="🗑️";
    del.addEventListener("click", async (e)=>{
      e.preventDefault(); e.stopPropagation();
      highlights = highlights.filter(x => x.id !== h.id);
      await persistHighlights();
      pdfViewer?.setHighlights?.(highlights);
      renderHighlightsList();
    });

    meta.appendChild(del);
    row.appendChild(main);
    row.appendChild(meta);
    list.appendChild(row);
  }
}

function slugify(str){
  return String(str||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") || "x";
}
