const DB_NAME = "irpg_offline_v2";
const DB_VER = 1;

function reqToPromise(req){
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx){
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("Transaction aborted"));
  });
}

export async function dbInit(){
  const openReq = indexedDB.open(DB_NAME, DB_VER);
  openReq.onupgradeneeded = () => {
    const db = openReq.result;
    if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
  };
  const db = await reqToPromise(openReq);
  return db;
}

export async function ensureDefaultProfile(db){
  // Single-profile for now; if you later want multi-user, we can add a profile store.
  return "default";
}

function kvKey(parts){ return parts.join("|"); }

export async function getDocState(db, profileId, docId){
  const tx = db.transaction("kv", "readonly");
  const store = tx.objectStore("kv");
  const key = kvKey(["doc", profileId, docId]);
  const val = await reqToPromise(store.get(key));
  await txDone(tx);
  return val || null;
}

export async function setDocState(db, profileId, docId, patch){
  const current = (await getDocState(db, profileId, docId)) || {};
  const next = { ...current, ...patch };

  const tx = db.transaction("kv", "readwrite");
  const store = tx.objectStore("kv");
  const key = kvKey(["doc", profileId, docId]);
  store.put(next, key);
  await txDone(tx);
  return next;
}

/* Checklist state stored separately */
export async function getChecklistState(db, profileId, docId, checklistId){
  const tx = db.transaction("kv", "readonly");
  const store = tx.objectStore("kv");
  const key = kvKey(["cl", profileId, docId, checklistId]);
  const val = await reqToPromise(store.get(key));
  await txDone(tx);
  return val || {};
}

export async function setChecklistState(db, profileId, docId, checklistId, state){
  const tx = db.transaction("kv", "readwrite");
  const store = tx.objectStore("kv");
  const key = kvKey(["cl", profileId, docId, checklistId]);
  store.put(state, key);
  await txDone(tx);
}

export async function resetChecklistState(db, profileId, docId, checklistId){
  const tx = db.transaction("kv", "readwrite");
  const store = tx.objectStore("kv");
  const key = kvKey(["cl", profileId, docId, checklistId]);
  store.delete(key);
  await txDone(tx);
}

export async function exportAll(db, profileId, docId){
  const docState = await getDocState(db, profileId, docId);
  const dump = {
    version: 1,
    exportedAt: Date.now(),
    profileId,
    docId,
    docState,
    checklists: {}
  };

  // iterate all kv keys for checklist states
  const tx = db.transaction("kv", "readonly");
  const store = tx.objectStore("kv");
  const allKeys = await reqToPromise(store.getAllKeys());
  const allVals = await reqToPromise(store.getAll());
  await txDone(tx);

  for (let i=0; i<allKeys.length; i++){
    const k = String(allKeys[i]);
    if (k.startsWith(`cl|${profileId}|${docId}|`)){
      const checklistId = k.split("|").slice(3).join("|");
      dump.checklists[checklistId] = allVals[i];
    }
  }

  return dump;
}

export async function importAll(db, data){
  if (!data || typeof data !== "object") throw new Error("Bad import file.");
  const { profileId="default", docId, docState, checklists } = data;

  if (!docId) throw new Error("Import missing docId.");

  if (docState){
    const tx = db.transaction("kv", "readwrite");
    tx.objectStore("kv").put(docState, `doc|${profileId}|${docId}`);
    await txDone(tx);
  }

  if (checklists && typeof checklists === "object"){
    const tx = db.transaction("kv", "readwrite");
    const store = tx.objectStore("kv");
    for (const [checklistId, state] of Object.entries(checklists)){
      store.put(state, `cl|${profileId}|${docId}|${checklistId}`);
    }
    await txDone(tx);
  }
}
