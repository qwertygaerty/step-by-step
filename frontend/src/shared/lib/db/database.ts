import type { DBInfo, DBOptions, DBPDatabase } from './types'
import { type DBSchema, type IDBPTransaction, openDB, type StoreNames } from 'idb'

export default class Database {
  private dbInfo: DBInfo

  constructor(dbInfo: DBInfo) {
    this.dbInfo = dbInfo
    if (!this.checkIsIndexedDBSupport()) return
    this.checkFreeMemory()
  }

  public async checkFreeMemory() {
    if (navigator.storage && navigator.storage.estimate) {
      const quota = await navigator.storage.estimate()
      if (!quota.usage || !quota.quota) return
      await this.checkIsPersisted()
    }
  }

  async checkIsPersisted() {
    if (navigator.storage) {
      return await navigator.storage.persisted()
    }
  }

  public checkIsIndexedDBSupport() {
    if (!('indexedDB' in window)) {
      console.error("This browser doesn't support IndexedDB")
      return false
    }

    return true
  }

  async useDb(options?: DBOptions) {
    return await openDB(this.dbInfo.name, this.dbInfo.version, options)
  }

  async getStoreObjects(storeName: string) {
    const db = await this.useDb()
    return await db.getAll(storeName as never)
  }

  async createStore<T extends DBSchema | unknown>(
    storeName: StoreNames<T>,
    options?: IDBObjectStoreParameters
  ) {
    return await this.useDb({
      upgrade(db) {
        if (!db.objectStoreNames.contains(storeName as never)) {
          db.createObjectStore(storeName as never, options)
        }
      }
    })
  }

  async addStoreObject<T>(tx: IDBPTransaction<DBSchema, [never], IDBTransactionMode>, data: T[]) {
    const res: Promise<IDBValidKey>[] = []
    data.forEach((itemData) => {
      if (!tx || !tx.store || !tx.store.put) return
      res.push(tx.store.put(itemData))
    })

    return res
  }

  async makeTransaction<T>(storeName: string, mode: IDBTransactionMode | undefined, data: T[]) {
    const db = await this.useDb()
    const tx = db.transaction(storeName as never, mode)
    const res = await this.addStoreObject(tx, data)
    res.push(tx.done as unknown as Promise<IDBValidKey>)
    await Promise.all(res)
  }
}
