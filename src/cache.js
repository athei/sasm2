export default function instantiateCachedURL(dbVersion, url, importObject) {
  const dbName = 'wasm-cache';
  const storeName = 'engine';

  function instantiateWithFallback() {
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      console.log('Instantiate Streaming');
      return WebAssembly.instantiateStreaming(fetch(url), importObject);
    }

    console.log('Instantiate Fallback');
    return fetch(url).then(response => response.arrayBuffer()).then((bytes) => {
      console.log('Fetch done!');
      return WebAssembly.instantiate(bytes, importObject);
    });
  }

  function openDatabase() {
    return new Promise(((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onerror = reject.bind(null, 'Error opening wasm cache database');
      request.onsuccess = () => { resolve(request.result); };
      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (db.objectStoreNames.contains(storeName)) {
          console.log(`Clearing out version ${event.oldVersion} wasm cache`);
          db.deleteObjectStore(storeName);
        }
        console.log(`Creating version ${event.newVersion} wasm cache`);
        db.createObjectStore(storeName);
      };
    }));
  }

  function lookupInDatabase(db) {
    return new Promise(((resolve, reject) => {
      const store = db.transaction([storeName]).objectStore(storeName);
      const request = store.get(url);
      request.onerror = reject.bind(null, `Error getting wasm module ${url}`);
      request.onsuccess = () => {
        if (request.result) resolve(request.result);
        else reject(new Error(`Module ${url} was not found in wasm cache`));
      };
    }));
  }

  function storeInDatabase(db, results) {
    return new Promise(((resolve) => {
      console.log(`Storing... ${results}`);
      const store = db.transaction([storeName], 'readwrite').objectStore(storeName);
      const request = store.put(results.module, url);
      request.onerror = (err) => {
        console.log(`Failed to store in wasm cache: ${err}`);
        resolve(results);
      };
      request.onsuccess = () => {
        console.log(`Successfully stored ${url} in wasm cache`);
        resolve(results);
      };
    }));
  }

  return openDatabase().then(db => lookupInDatabase(db).then((module) => {
    console.log(`Found ${url} in wasm cache`);
    return WebAssembly.instantiate(module, importObject);
  }, (errMsg) => {
    console.log(`Compiling from scratch: ${errMsg}`);
    return instantiateWithFallback(url, importObject).then((results) => {
      console.log('Instantiate done -> storing');
      return storeInDatabase(db, results);
    }).then((results) => {
      console.log('Storing Done');
      return results;
    });
  }), (errMsg) => {
    console.log(`Opening database failed. Just compile and do store: ${errMsg}`);
    return instantiateWithFallback(url, importObject);
  });
}
