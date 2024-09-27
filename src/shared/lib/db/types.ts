import type { DBSchema, OpenDBCallbacks, IDBPDatabase } from 'idb'

type DBOptions = OpenDBCallbacks<DBSchema>

type DBPDatabase<T extends DBSchema | unknown = unknown> = IDBPDatabase<T>

type DBInfo = {name: string; version: number}

export type { DBOptions, DBPDatabase, DBInfo }
