'use client'

import type { ProgressPhotoEntry } from '@/types'

const DB_NAME = 'ConsistencyPhotoDB'
const STORE_NAME = 'progress_photos'
const DB_VERSION = 1

let dbInstance: IDBDatabase | null = null

async function initPhotoDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(request.result)
    }

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Create store with 'id' as keyPath, and index by 'date'
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('date', 'date', { unique: false })
      }
    }
  })
}

export async function saveProgressPhoto(photo: ProgressPhotoEntry): Promise<void> {
  if (typeof window === 'undefined') return
  const db = await initPhotoDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(photo) // put handles insert or update

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getAllProgressPhotos(): Promise<ProgressPhotoEntry[]> {
  if (typeof window === 'undefined') return []
  const db = await initPhotoDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      // Sort descending by date
      const data = request.result as ProgressPhotoEntry[]
      data.sort((a, b) => b.date.localeCompare(a.date))
      resolve(data)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function deleteProgressPhoto(id: string): Promise<void> {
  if (typeof window === 'undefined') return
  const db = await initPhotoDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
