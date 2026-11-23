import type { FormEvent, ReactNode } from 'react'

type Props = {
  className?: string
  noValidate?: boolean
  children: ReactNode
  onSubmit: () => void
}

const revealFirstInvalid = (form: HTMLFormElement) => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  form
    .querySelector('[aria-invalid="true"]')
    ?.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'instant' : 'smooth' })
}

/** Brings the first field left invalid into view after every submit, so an error is never off-screen. */
export const Form = ({ className, noValidate, children, onSubmit }: Props) => {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    onSubmit()
    // The errors this submit reveals are on the page by the next frame.
    requestAnimationFrame(() => revealFirstInvalid(form))
  }

  return (
    <form className={className} noValidate={noValidate} onSubmit={submit}>
      {children}
    </form>
  )
}
