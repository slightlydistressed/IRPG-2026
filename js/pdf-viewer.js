
import { clamp, uid } from "./utils.js";

export class PdfViewer{
  constructor({ scrollEl, pageReadoutEl, onPageChange }){
    this.scrollEl = scrollEl;
    this.pageReadoutEl = pageReadoutEl;
    this.onPageChange = onPageChange;

    this.pdfjs = null;
    this.pdf = null;

    this.scale = 1;
    this.pageCount = 0;

    this.pageEls = [];
    this.rendered = new Map(); // pageIndex -> { surface, canvas, textLayer, hlLayer, viewport }

    this._io = null;
    this._renderQueue = [];
    this._rendering = new Set();
    this._maxConcurrent = 2;
    this._maxRendered = 12;

    this.currentPageIndex = 0;

    this.highlights = []; // [{id,pageIndex,rects:[{x,y,w,h}], text, createdAt}]
    this._onScroll = this._onScroll.bind(this);
    this._onResize = this._onResize.bind(this);
  }

  async _loadPdfJs(){
    if (this.pdfjs) return this.pdfjs;

    const tryImport = async (p) => {
      try { return await import(p); } catch { return null; }
    };

    // Use import.meta.url to build absolute URLs so that both:
    //   new Worker(workerSrc, {type:"module"})  — resolved against document origin
    //   import(workerSrc)                        — resolved against this module's URL
    // both point to the same correct file under the /IRPG-2026/ subpath.
    const base = import.meta.url;
    const pdfUrl    = new URL("../vendor/pdf.mjs",            base).href;
    const workerUrl = new URL("../vendor/pdf.worker.mjs",     base).href;
    const pdfFbUrl  = new URL("../vendor/pdfjs/pdf.mjs",      base).href;
    const workerFbUrl = new URL("../vendor/pdfjs/pdf.worker.mjs", base).href;

    let pdfjs = await tryImport(pdfUrl);
    let worker = workerUrl;
    if (!pdfjs){
      pdfjs = await tryImport(pdfFbUrl);
      worker = workerFbUrl;
    }
    if (!pdfjs){
      throw new Error("PDF.js could not be loaded. Ensure pdf.mjs and pdf.worker.mjs exist in /vendor (or /vendor/pdfjs).");
    }
    pdfjs.GlobalWorkerOptions.workerSrc = worker;
    this.pdfjs = pdfjs;
    return pdfjs;
  }

  async load(pdfPath){
    const pdfjs = await this._loadPdfJs();

    const task = pdfjs.getDocument({ url: pdfPath, withCredentials: false, disableRange: true, disableStream: true });
    this.pdf = await task.promise;
    this.pageCount = this.pdf.numPages;

    await this._computeFitScale();
    await this._buildShells();

    this.scrollEl.removeEventListener("scroll", this._onScroll);
    this.scrollEl.addEventListener("scroll", this._onScroll, { passive: true });

    window.removeEventListener("resize", this._onResize);
    window.addEventListener("resize", this._onResize, { passive: true });

    this._setupIO();
    this._updateReadout(0);
    this.ensureRender(0);
    this.ensureRender(1);
  }

  async _computeFitScale(){
    const page1 = await this.pdf.getPage(1);
    const base = page1.getViewport({ scale: 1 });

    const padding = 28; // scroll padding left+right
    const maxWidth = 980;
    const available = Math.max(320, Math.min(maxWidth, this.scrollEl.clientWidth - padding));
    const raw = available / base.width;
    this.scale = clamp(raw, 0.65, 2.4);
  }

  async _buildShells(){
    this.scrollEl.innerHTML = "";
    this.pageEls = [];
    this.rendered.clear();

    // Use page 1 for placeholder sizing; IRPG is mostly uniform.
    const p1 = await this.pdf.getPage(1);
    const vp = p1.getViewport({ scale: this.scale });
    const w = Math.floor(vp.width), h = Math.floor(vp.height);

    for (let i = 0; i < this.pageCount; i++){
      const pageEl = document.createElement("div");
      pageEl.className = "pdfPage unrendered";
      pageEl.dataset.pageIndex = String(i);

      const frame = document.createElement("div");
      frame.className = "pageFrame";
      frame.style.width = `${w}px`;
      frame.style.height = `${h}px`;
      pageEl.appendChild(frame);

      const ph = document.createElement("div");
      ph.className = "pagePlaceholder";
      ph.textContent = `Page ${i+1}`;
      frame.appendChild(ph);

      const badge = document.createElement("div");
      badge.className = "pageBadge";
      badge.textContent = `${i+1}`;
      pageEl.appendChild(badge);

      this.scrollEl.appendChild(pageEl);
      this.pageEls.push(pageEl);
    }
  }

  _setupIO(){
    if (this._io) this._io.disconnect();

    this._io = new IntersectionObserver((entries) => {
      for (const e of entries){
        if (!e.isIntersecting) continue;
        const idx = Number(e.target.dataset.pageIndex);
        if (Number.isFinite(idx)) this.ensureRender(idx);
      }
    }, {
      root: this.scrollEl,
      rootMargin: "1600px 0px",
      threshold: 0.01
    });

    for (const el of this.pageEls) this._io.observe(el);
  }

  _updateReadout(i){
    if (!this.pageReadoutEl) return;
    this.pageReadoutEl.textContent = `Page ${i+1} / ${this.pageCount}`;
  }

  _findCurrentPage(){
    // find the page whose frame intersects the vertical midpoint of the scroll viewport
    const midY = this.scrollEl.getBoundingClientRect().top + (this.scrollEl.clientHeight * 0.33);
    const midX = this.scrollEl.getBoundingClientRect().left + (this.scrollEl.clientWidth * 0.5);
    const el = document.elementFromPoint(midX, midY);
    const pageEl = el?.closest?.(".pdfPage");
    if (!pageEl) return this.currentPageIndex || 0;
    const idx = Number(pageEl.dataset.pageIndex);
    return Number.isFinite(idx) ? idx : 0;
  }

  _onScroll(){
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(() => {
      const idx = this._findCurrentPage();
      if (idx !== this.currentPageIndex){
        this.currentPageIndex = idx;
        this._updateReadout(idx);
        try { this.onPageChange?.(idx); } catch {}
      }
      // opportunistic render near current
      for (let d = -2; d <= 4; d++){
        const p = idx + d;
        if (p >= 0 && p < this.pageCount) this.ensureRender(p);
      }
      this._trimCache(idx);
    });
  }

  _onResize(){
    clearTimeout(this._resizeT);
    this._resizeT = setTimeout(async () => {
      if (!this.pdf) return;
      const prevIdx = this.currentPageIndex;
      await this._computeFitScale();
      await this._buildShells();
      this._setupIO();
      // keep highlights in memory; rerender near current
      this.currentPageIndex = clamp(prevIdx, 0, this.pageCount - 1);
      this.goToPage(this.currentPageIndex);
      for (let d=-2; d<=4; d++){
        const p=this.currentPageIndex+d;
        if (p>=0 && p<this.pageCount) this.ensureRender(p);
      }
    }, 180);
  }

  async goToPage(pageIndex){
    pageIndex = clamp(pageIndex, 0, this.pageCount - 1);
    const el = this.pageEls[pageIndex];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    this.ensureRender(pageIndex);
  }
  async goToHighlight(hlt){
    if (!hlt) return;
    const pageIndex = clamp(Number(hlt.pageIndex)||0, 0, this.pageCount - 1);
    await this.goToPage(pageIndex);
    await this._waitForRender(pageIndex, 2000);
    const entry = this.rendered.get(pageIndex);
    if (!entry) return;
    const r = (hlt.rects && hlt.rects[0]) ? hlt.rects[0] : null;
    if (!r) return;
    const surface = entry.surface;
    const y = r.y * (surface.clientHeight || 1);
    const pageEl = this.pageEls[pageIndex];
    const top = pageEl.offsetTop + y - 100;
    this.scrollEl.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  async _waitForRender(pageIndex, timeoutMs=1500){
    const start = performance.now();
    while (performance.now() - start < timeoutMs){
      if (this.rendered.has(pageIndex)) return true;
      this.ensureRender(pageIndex);
      await new Promise(r => setTimeout(r, 30));
    }
    return this.rendered.has(pageIndex);
  }


  async next(){ await this.goToPage(this.currentPageIndex + 1); }
  async prev(){ await this.goToPage(this.currentPageIndex - 1); }

  setHighlights(highlights){
    this.highlights = Array.isArray(highlights) ? highlights : [];
    // redraw on rendered pages
    for (const [idx] of this.rendered){
      this._drawHighlightsFor(idx);
    }
  }

  async ensureRender(pageIndex){
    pageIndex = Number(pageIndex);
    if (!Number.isFinite(pageIndex) || pageIndex < 0 || pageIndex >= this.pageCount) return;
    if (this.rendered.has(pageIndex)) return;
    if (this._rendering.has(pageIndex)) return;

    this._renderQueue.push(pageIndex);
    this._pumpQueue();
  }

  async _pumpQueue(){
    while (this._renderQueue.length && this._rendering.size < this._maxConcurrent){
      const idx = this._renderQueue.shift();
      if (this.rendered.has(idx) || this._rendering.has(idx)) continue;
      this._rendering.add(idx);
      this._renderPage(idx).catch(()=>{}).finally(() => {
        this._rendering.delete(idx);
        this._pumpQueue();
      });
    }
  }

  async _renderPage(pageIndex){
    const pageEl = this.pageEls[pageIndex];
    if (!pageEl) return;

    const frame = pageEl.querySelector(".pageFrame");
    if (!frame) return;

    // (re)clear frame
    frame.innerHTML = "";

    const page = await this.pdf.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale: this.scale });

    // Text layer needs a "dontFlip" viewport to align with canvas in many browsers.
    const textViewport = viewport.clone ? viewport.clone({ dontFlip: true }) : viewport;

    frame.style.width = `${Math.floor(viewport.width)}px`;
    frame.style.height = `${Math.floor(viewport.height)}px`;

    const surface = document.createElement("div");
    surface.className = "pageSurface";
    // PDF.js text-layer uses CSS vars for positioning (Firefox especially).
    // Without these, text spans can collapse to the top-left, breaking selection/highlights.
    const __scaleFactor = String(this.scale);
    const __rotation = String(viewport.rotation || 0);
    const __userUnit = String(viewport.userUnit || 1);
    surface.style.setProperty("--scale-factor", __scaleFactor);
    surface.style.setProperty("--page-rotation", __rotation);
    surface.style.setProperty("--user-unit", __userUnit);
    surface.style.width = `${Math.floor(viewport.width)}px`;
    surface.style.height = `${Math.floor(viewport.height)}px`;
    frame.appendChild(surface);

    const outputScale = (window.devicePixelRatio || 1);

    const canvas = document.createElement("canvas");
    canvas.className = "pdfCanvas";
    // Render at device pixel ratio for crisp pages, while keeping CSS size in viewport units.
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";
    surface.appendChild(canvas);

    const ctx = canvas.getContext("2d", { alpha: false });
    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
    await page.render({ canvasContext: ctx, viewport, transform }).promise;

    // highlight overlay (drawn above canvas, below the selection layer)
    const hlLayer = document.createElement("div");
    hlLayer.className = "highlightLayer";
    hlLayer.style.setProperty("--scale-factor", __scaleFactor);
    hlLayer.style.setProperty("--page-rotation", __rotation);
    hlLayer.style.setProperty("--user-unit", __userUnit);
    surface.appendChild(hlLayer);

    // Text layer (invisible but selectable)
    const textLayer = document.createElement("div");
    textLayer.className = "textLayer";
    // Ensure textLayer inherits the scale vars even if moved in DOM.
    textLayer.style.setProperty("--scale-factor", __scaleFactor);
    textLayer.style.setProperty("--page-rotation", __rotation);
    textLayer.style.setProperty("--user-unit", __userUnit);
    surface.appendChild(textLayer);

    const textContentSource = page.streamTextContent
      ? page.streamTextContent({ includeMarkedContent: true, disableNormalization: true })
      : await page.getTextContent({ includeMarkedContent: true, disableNormalization: true });

    const tl = new this.pdfjs.TextLayer({ textContentSource, container: textLayer, viewport: textViewport });
    await tl.render();

    pageEl.classList.remove("unrendered");
    this.rendered.set(pageIndex, { surface, canvas, textLayer, hlLayer, viewport });

    this._drawHighlightsFor(pageIndex);
    this._trimCache(this.currentPageIndex);
  }

  _trimCache(centerIdx){
    // Keep rendered pages within a radius and cap total.
    const keep = new Set();
    for (let d=-3; d<=6; d++){
      const p = centerIdx + d;
      if (p>=0 && p<this.pageCount) keep.add(p);
    }

    // Remove far pages first
    for (const [idx] of Array.from(this.rendered.entries())){
      if (keep.has(idx)) continue;
      if (this.rendered.size <= this._maxRendered) break;
      this._unrender(idx);
    }

    // Hard cap, LRU-ish by distance
    if (this.rendered.size > this._maxRendered){
      const items = Array.from(this.rendered.keys()).map(i => ({ i, dist: Math.abs(i - centerIdx) }));
      items.sort((a,b) => b.dist - a.dist);
      for (const it of items){
        if (this.rendered.size <= this._maxRendered) break;
        if (keep.has(it.i)) continue;
        this._unrender(it.i);
      }
    }
  }

  _unrender(pageIndex){
    const pageEl = this.pageEls[pageIndex];
    const frame = pageEl?.querySelector?.(".pageFrame");
    if (!pageEl || !frame) return;
    frame.innerHTML = "";
    const ph = document.createElement("div");
    ph.className = "pagePlaceholder";
    ph.textContent = `Page ${pageIndex+1}`;
    frame.appendChild(ph);
    pageEl.classList.add("unrendered");
    this.rendered.delete(pageIndex);
  }

  _drawHighlightsFor(pageIndex){
    const entry = this.rendered.get(pageIndex);
    if (!entry) return;
    const { hlLayer, surface } = entry;
    hlLayer.innerHTML = "";
    const w = surface.clientWidth || 1;
    const h = surface.clientHeight || 1;

    const hs = this.highlights.filter(x => x.pageIndex === pageIndex);
    for (const hlt of hs){
      for (const r of (hlt.rects || [])){
        const div = document.createElement("div");
        div.className = "hlRect";
        // rects stored normalized 0..1
        div.style.left = `${Math.max(0, r.x) * w}px`;
        div.style.top = `${Math.max(0, r.y) * h}px`;
        div.style.width = `${Math.max(0, r.w) * w}px`;
        div.style.height = `${Math.max(0, r.h) * h}px`;
        hlLayer.appendChild(div);
      }
    }
  }

  // Kindle-like: call this on mouseup/touchend
  captureSelectionHighlight(){
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0) return null;
    const text = (sel.toString() || "").trim();
    if (!text) return null;

    const range = sel.getRangeAt(0);
    const node = range.commonAncestorContainer.nodeType === 1
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;

    const pageEl = node?.closest?.(".pdfPage");
    if (!pageEl) return null;

    const pageIndex = Number(pageEl.dataset.pageIndex);
    if (!Number.isFinite(pageIndex)) return null;

    const rendered = this.rendered.get(pageIndex);
    if (!rendered) return null;

    const surface = rendered.surface;
    const srect = surface.getBoundingClientRect();
    if (!srect.width || !srect.height) return null;

    const rects = [];

    // Prefer collecting rects from text spans inside the textLayer for accuracy.
    // This avoids synthetic/collapsed rects that browsers sometimes include in range.getClientRects().
    const textLayer = surface.querySelector(".textLayer");
    if (textLayer) {
      // Walk all spans that fall within the selection range
      const spans = textLayer.querySelectorAll("span");
      for (const span of spans) {
        if (!range.intersectsNode(span)) continue;
        const cr = span.getBoundingClientRect();
        if (cr.width < 2 || cr.height < 2) continue;
        // Intersect with surface bounds
        const left   = Math.max(cr.left,   srect.left);
        const right  = Math.min(cr.right,  srect.right);
        const top    = Math.max(cr.top,    srect.top);
        const bottom = Math.min(cr.bottom, srect.bottom);
        if (right - left < 2 || bottom - top < 2) continue;
        rects.push({
          x: (left  - srect.left) / srect.width,
          y: (top   - srect.top)  / srect.height,
          w: (right  - left)      / srect.width,
          h: (bottom - top)       / srect.height
        });
      }
    }

    // Fallback: use range.getClientRects() if no span rects were found
    if (!rects.length) {
      for (const cr of Array.from(range.getClientRects())){
        if (cr.width < 2 || cr.height < 2) continue;
        const left   = Math.max(cr.left,   srect.left);
        const right  = Math.min(cr.right,  srect.right);
        const top    = Math.max(cr.top,    srect.top);
        const bottom = Math.min(cr.bottom, srect.bottom);
        if (right - left < 2 || bottom - top < 2) continue;
        rects.push({
          x: (left  - srect.left) / srect.width,
          y: (top   - srect.top)  / srect.height,
          w: (right  - left)      / srect.width,
          h: (bottom - top)       / srect.height
        });
      }
    }

    if (!rects.length) return null;

    // clear selection for a "Kindle" feel
    try { sel.removeAllRanges(); } catch {}

    return {
      id: uid("hl"),
      pageIndex,
      rects,
      text: text.slice(0, 320),
      createdAt: Date.now()
    };
  }
}
