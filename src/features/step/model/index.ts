import { StepModel } from '@/entities/step/model/stepModel'
import { StepCalculator } from '@/entities/step/model/stepCalculator'


export class SaveStepUseCase {
  private stepRepository = new StepRepository();

  async execute(timestamp: number, steps: number): Promise<void> {
    const step = new StepModel(timestamp, steps);
    await this.stepRepository.saveStep(step);
  }
}


export class GetStepsForWeekUseCase {
  private stepRepository = new StepRepository();

  async execute(weekStartTimestamp: number): Promise<number> {
    const stepLog = await this.stepRepository.getStepsBetween(weekStartTimestamp, weekStartTimestamp + 6 * 24 * 60 * 60);
    const stepCalculator = new StepCalculator(stepLog.steps);
    return stepCalculator.getStepsForWeek(weekStartTimestamp);
  }
}