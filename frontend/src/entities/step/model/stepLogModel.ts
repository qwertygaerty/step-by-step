import type { StepModel } from '@/entities/step/model/stepModel'

export class StepLogModel {
  constructor(readonly steps: StepModel[]) {}

  addStep(step: StepModel): void {
    const existingStep = this.steps.find((s) => this.isSameDay(s.timestamp, step.timestamp))
    if (existingStep) {
      throw new Error('Step for this date already exists')
    }
    this.steps.push(step)
  }

  private isSameDay(timestamp1: number, timestamp2: number): boolean {
    const day1 = new Date(timestamp1 * 1000).setHours(0, 0, 0, 0)
    const day2 = new Date(timestamp2 * 1000).setHours(0, 0, 0, 0)
    return day1 === day2
  }
}
