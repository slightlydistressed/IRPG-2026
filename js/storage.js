
const KEY = "irpg_state_v11";

export function loadState(){
  try{
    const raw = localStorage.getItem(KEY);
    if (!raw) return { theme: "dark", bookmarks: [], highlights: [], checklistValues: {} };
    const s = JSON.parse(raw);
    return {
      theme: s.theme === "light" ? "light" : "dark",
      bookmarks: Array.isArray(s.bookmarks) ? s.bookmarks : [],
      highlights: Array.isArray(s.highlights) ? s.highlights : [],
      checklistValues: (s.checklistValues && typeof s.checklistValues === "object") ? s.checklistValues : {}
    };
  }catch{
    return { theme: "dark", bookmarks: [], highlights: [], checklistValues: {} };
  }
}

export function saveState(state){
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function exportState(state){
  return JSON.stringify(state, null, 2);
}

export function importState(jsonText){
  const s = JSON.parse(jsonText);
  // minimal validation
  const out = {
    theme: s.theme === "light" ? "light" : "dark",
    bookmarks: Array.isArray(s.bookmarks) ? s.bookmarks : [],
    highlights: Array.isArray(s.highlights) ? s.highlights : [],
    checklistValues: (s.checklistValues && typeof s.checklistValues === "object") ? s.checklistValues : {}
  };
  return out;
}
