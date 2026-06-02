/* ============================================================
   db.js — IndexedDB sarmalayıcı (tamamen cihazda depolama)
   Tablolar: books, recipes, settings
   ============================================================ */
let DB = null;

function openDB(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open('OkurDefteri', 1);
    req.onupgradeneeded = e=>{
      const db = e.target.result;
      if(!db.objectStoreNames.contains('books'))    db.createObjectStore('books',   {keyPath:'id'});
      if(!db.objectStoreNames.contains('recipes'))  db.createObjectStore('recipes', {keyPath:'id'});
      if(!db.objectStoreNames.contains('settings')) db.createObjectStore('settings',{keyPath:'key'});
    };
    req.onsuccess = e=>{ DB = e.target.result; resolve(); };
    req.onerror   = e=>reject(e);
  });
}
function _store(name, mode){ return DB.transaction(name, mode).objectStore(name); }

function dbGet(store, key){
  return new Promise(res=>{ const q=_store(store,'readonly').get(key); q.onsuccess=()=>res(q.result); q.onerror=()=>res(null); });
}
function dbAll(store){
  return new Promise(res=>{ const q=_store(store,'readonly').getAll(); q.onsuccess=()=>res(q.result||[]); q.onerror=()=>res([]); });
}
function dbPut(store, val){
  return new Promise(res=>{ const q=_store(store,'readwrite').put(val); q.onsuccess=()=>res(true); q.onerror=()=>res(false); });
}
function dbDel(store, key){
  return new Promise(res=>{ const q=_store(store,'readwrite').delete(key); q.onsuccess=()=>res(true); q.onerror=()=>res(false); });
}
function dbClear(store){
  return new Promise(res=>{ const q=_store(store,'readwrite').clear(); q.onsuccess=()=>res(true); q.onerror=()=>res(false); });
}
