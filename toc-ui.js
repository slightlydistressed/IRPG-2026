export function findTocNode(nodes, id){
  for (const n of nodes || []){
    if (n.id === id) return n;
    const found = findTocNode(n.children, id);
    if (found) return found;
  }
  return null;
}

export function renderToc({ rootEl, toc, searchInput, bookmarks, onToggleBookmark, onSelect }){
  let activeId = null;
  let bm = bookmarks || new Set();
  let query = "";

  function makeRow(node, depth){
    const row = document.createElement("div");
    row.className = "row";
    if (node.id === activeId) row.classList.add("active");
    row.style.marginLeft = `${depth * 12}px`;

    const main = document.createElement("button");
    main.className = "rowMain";
    main.type = "button";
    main.innerHTML = `
      <div class="rowTitle">${escapeHtml(node.title || "Untitled")}</div>
      <div class="rowSub">${node.pageLabel ? `Page ${escapeHtml(String(node.pageLabel))}` : ""}</div>
    `;
    main.addEventListener("click", () => onSelect?.(node));

    const meta = document.createElement("div");
    meta.className = "rowRight";

    const page = document.createElement("div");
    page.className = "rowMeta";
    page.textContent = node.pageLabel ? String(node.pageLabel) : "";

    const b = document.createElement("button");
    b.className = "bmBtn";
    b.type = "button";
    b.dataset.on = bm.has(node.id) ? "true" : "false";
    b.title = bm.has(node.id) ? "Remove bookmark" : "Add bookmark";
    b.innerHTML = "🔖";
    b.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      onToggleBookmark?.(node);
    });

    const chev = document.createElement("div");
    chev.className = "chev";
    chev.textContent = "›";

    meta.appendChild(page);
    meta.appendChild(b);
    meta.appendChild(chev);

    row.appendChild(main);
    row.appendChild(meta);

    return row;
  }

  function matches(node){
    if (!query) return true;
    return String(node.title || "").toLowerCase().includes(query);
  }

  function render(){
    rootEl.innerHTML = "";
    const walk = (nodes, depth) => {
      for (const n of nodes || []){
        const ok = matches(n) || hasMatchChild(n);
        if (!ok) continue;
        rootEl.appendChild(makeRow(n, depth));
        if (n.children?.length) walk(n.children, depth + 1);
      }
    };
    const hasMatchChild = (node) => (node.children || []).some(c => matches(c) || hasMatchChild(c));
    walk(toc || [], 0);
  }

  searchInput?.addEventListener("input", () => {
    query = String(searchInput.value || "").trim().toLowerCase();
    render();
  });

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, (m)=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  render();

  return {
    setActive(id){
      activeId = id;
      render();
    },
    setBookmarks(set){
      bm = set;
      render();
    }
  };
}
