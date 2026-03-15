const DB_NAME = "archivault-db";
const STORE_NAME = "handles";
const KEY = "obsidian-dir";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadHandle() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function saveHandle(handle) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(handle, KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearHandle() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getSavedFolderName() {
  const handle = await loadHandle();
  return handle ? handle.name : null;
}

export async function getOrPickDirectory() {
  const saved = await loadHandle();
  if (saved) {
    try {
      const perm = await saved.queryPermission({ mode: "readwrite" });
      if (perm === "granted") return saved;
      const req = await saved.requestPermission({ mode: "readwrite" });
      if (req === "granted") return saved;
    } catch {
      // handle is stale, fall through to picker
    }
  }
  const handle = await window.showDirectoryPicker({ mode: "readwrite" });
  await saveHandle(handle);
  return handle;
}

export async function writeMarkdownFile(dirHandle, filename, content) {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}
