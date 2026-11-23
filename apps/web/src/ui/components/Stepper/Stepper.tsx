import { Stepper as MantineStepper } from '@mantine/core'
import classes from './Stepper.module.css'

export type Props = {
  steps: string[]
  active: number
  /** The furthest step that can be selected; those past it are still ahead. */
  reached: number
  onSelect: (step: number) => void
}

export const Stepper = ({ steps, active, reached, onSelect }: Props) => (
  <MantineStepper
    active={active}
    classNames={{
      root: classes.root,
      steps: classes.steps,
      step: classes.step,
      stepIcon: classes.icon,
      stepCompletedIcon: classes.completedIcon,
      stepBody: classes.body,
      stepLabel: classes.label,
      separator: classes.separator,
    }}
    onStepClick={onSelect}
  >
    {steps.map((label, step) => (
      <MantineStepper.Step key={label} label={label} allowStepSelect={step <= reached} />
    ))}
  </MantineStepper>
)
