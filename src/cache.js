/* @flow */
/* eslint no-restricted-globals: ["off"] */

export default function instantiateCachedURL(dbVersion: number, url: string, importObject: ImportObject): Promise<WebAssembly$Instance> {
  const dbName = 'wasm-cache';
  const storeName = 'engine';

  function instantiateWithFallback(): Promise<ResultObject> {
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
      const request = self.indexedDB.open(dbName, dbVersion);
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

  function storeInDatabase(db, results): Promise<WebAssembly$Instance> {
    return new Promise(((resolve) => {
      console.log(results);
      const store = db.transaction([storeName], 'readwrite').objectStore(storeName);
      const request = store.put(results.module, url);
      request.onerror = (err) => {
        console.log(`Failed to store in wasm cache: ${err}`);
        resolve(results.instance);
      };
      request.onsuccess = () => {
        console.log(`Successfully stored ${url} in wasm cache`);
        resolve(results.instance);
      };
    }));
  }

  return openDatabase().then(db => lookupInDatabase(db).then((module) => {
    console.log(`Found ${url} in wasm cache`);
    return WebAssembly.instantiate(module, importObject);
  }, (errMsg) => {
    console.log(`Compiling from scratch: ${errMsg}`);
    return instantiateWithFallback().then((results) => {
      console.log('Instantiate done -> storing');
      return storeInDatabase(db, results);
    }).then((instance) => {
      console.log('Storing Done');
      return instance;
    });
  }), (errMsg) => {
    console.log(`Opening database failed. Just compile and do store: ${errMsg}`);
    return instantiateWithFallback().then(results => results.instance);
  });
}
