import { Database } from '../lib/db'
import type { StepDBSchema, addStepRequest } from './types'
import { DB_NAME, DB_STORE_NAME, DB_STORE_OPTIONS, DB_VERSION, DB_STORE_MODE } from './const'

const db = new Database({ name: DB_NAME, version: DB_VERSION })
const stepsApi = {
  async getSteps() {
    return await db.getStoreObjects(DB_STORE_NAME)
  },
  async addSteps(data: addStepRequest[]) {
    return await db.makeTransaction<addStepRequest>(DB_STORE_NAME, DB_STORE_MODE, data)
  },
  async createStore() {
    return await db.createStore<StepDBSchema>(DB_STORE_NAME, DB_STORE_OPTIONS)
  }
}

stepsApi.createStore().then(async () => {
  await stepsApi.addSteps([{ date: '2024-09-07' + Math.random(), steps: 8000 }])
  await stepsApi.getSteps()
})

export { stepsApi }
