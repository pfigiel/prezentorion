import '@tanstack/react-query'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** Set where the screen explains every failure itself, so no toast repeats it. */
      showsOwnError?: boolean
    }
  }
}
