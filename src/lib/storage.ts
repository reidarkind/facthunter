import type { SavedFact } from '../types'

const DB_NAME = 'facthunter'
const STORE = 'facts'
const RECORD_ID = 'all'

type FactsRecord = { id: string; facts: SavedFact[] }

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'))
  })
}

export async function loadFacts(): Promise<SavedFact[]> {
  const db = await openDb()
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const request = tx.objectStore(STORE).get(RECORD_ID)
      request.onsuccess = () => {
        const record = request.result as FactsRecord | undefined
        resolve(record?.facts ?? [])
      }
      request.onerror = () =>
        reject(request.error ?? new Error('IndexedDB read failed'))
    })
  } finally {
    db.close()
  }
}

export async function saveFacts(facts: SavedFact[]): Promise<void> {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const record: FactsRecord = { id: RECORD_ID, facts }
      const request = tx.objectStore(STORE).put(record, RECORD_ID)
      request.onsuccess = () => resolve()
      request.onerror = () =>
        reject(request.error ?? new Error('IndexedDB write failed'))
    })
  } finally {
    db.close()
  }
}
