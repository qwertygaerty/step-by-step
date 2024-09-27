import type { DBSchema } from 'idb'

interface StepDBSchema extends DBSchema {
  steps: {
    value: {
      count: number
      date: string
    }
    key: string
  }
}

type addStepRequest = { date: string; steps: number }

export type { StepDBSchema, addStepRequest }
