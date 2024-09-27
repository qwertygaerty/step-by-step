import type { StepModel } from '@/entities/step/model/stepModel'

export class StepCalculator {
  constructor(private readonly steps: StepModel[]) {}

  getStepsForDay(dayTimestamp: number): number {
    const startOfDay = new Date(dayTimestamp * 1000).setHours(0, 0, 0, 0)
    const endOfDay = new Date(dayTimestamp * 1000).setHours(23, 59, 59, 999)
    return this.calculateStepsBetween(startOfDay / 1000, endOfDay / 1000)
  }

  getStepsForWeek(weekStartTimestamp: number): number {
    const startOfWeek = new Date(weekStartTimestamp * 1000).setHours(0, 0, 0, 0)
    const endOfWeek = startOfWeek + 6 * 24 * 60 * 60 * 1000
    return this.calculateStepsBetween(startOfWeek / 1000, endOfWeek / 1000)
  }

  getStepsForYear(yearStartTimestamp: number): number {
    const startOfYear = new Date(new Date(yearStartTimestamp * 1000).getFullYear(), 0, 1).getTime()
    const endOfYear = new Date(new Date(yearStartTimestamp * 1000).getFullYear(), 11, 31).setHours(
      23,
      59,
      59,
      999
    )
    return this.calculateStepsBetween(startOfYear / 1000, endOfYear / 1000)
  }

  private calculateStepsBetween(startTimestamp: number, endTimestamp: number): number {
    return this.steps
      .filter((step) => step.timestamp >= startTimestamp && step.timestamp <= endTimestamp)
      .reduce((total, step) => total + step.steps, 0)
  }
}
