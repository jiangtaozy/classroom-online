/*
 * Created by jemo on 2018.11.14 07:46:11
 * Maintained by jemo from 2018.11.14 to now
 * indexedDb
 */

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject('不支持 indexedDB')
    }
    const request = window.indexedDB.open('classroom', 1)
    request.onerror = (event) => {
      console.error('indexedDBOpenError, event: ', event)
    }
    request.onsuccess = (event) => {
      //console.log('initDB onsuccess is called')
      const db = request.result
      resolve(db)
    }
    request.onupgradeneeded = (event) => {
      //console.log('onupgradeneeded is called')
      const db = event.target.result;
      //console.log('!db.objectStoreNames.contains(user): ', !db.objectStoreNames.contains('user'))
      if (!db.objectStoreNames.contains('user')) {
        //console.log('createObjectStore id called')
        db.createObjectStore('user', {
          keyPath: 'phone',
        })
      }
    }
  })
}

export const add = async (store, data) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const request = db.transaction([store], 'readwrite')
      .objectStore(store)
      .add(data)
    request.onsuccess = (event) => {
      //console.log('写入成功, event: ', event)
      resolve()
    }
    request.onerror = (event) => {
      console.error('写入失败, event: ', event)
      reject(event)
    }
  })
}

export const get = async(store, key) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([store])
    const objectStore = transaction.objectStore(store)
    const request = objectStore.get(key)
    request.onerror = (event) => {
      reject(event)
    }
    request.onsuccess = (event) => {
      resolve(request.result)
    }
  })
}

export const getLastObject = async(store) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    let lastObject
    const transaction = db.transaction([store])
    const objectStore = transaction.objectStore(store)
    objectStore.openCursor().onsuccess = (event) => {
      const cursor = event.target.result
      if(cursor) {
        lastObject = cursor.value
        cursor.continue()
      } else {
        resolve(lastObject)
      }
    }
  })
}

export const upsert = async(store, key, newData) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([store], 'readwrite')
    const objectStore = transaction.objectStore(store)
    const request = objectStore.get(key)
    request.onerror = (event) => {
      reject(event)
    }
    request.onsuccess = (event) => {
      let data = event.target.result
      data = {
        ...data,
        ...newData,
      }
      const requestUpdate = objectStore.put(data)
      requestUpdate.onerror = (event) => {
        reject(event)
      }
      requestUpdate.onsuccess = (event) => {
        //console.log('update event: ', event)
        resolve()
      }
    }
  })
}
