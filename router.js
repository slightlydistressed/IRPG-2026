export function parseRoute(){
  // supports: #/page/12
  const h = location.hash || "#/";
  const parts = h.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0] === "page" && parts[1]){
    const pageIndex = Number(parts[1]);
    if (Number.isFinite(pageIndex)) return { type:"page", pageIndex };
  }
  return { type:"none" };
}

export function gotoPage(pageIndex){
  location.hash = `#/page/${pageIndex}`;
}
