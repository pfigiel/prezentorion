const levels = ['1', '2', '3'] as const

/** The catalog key segment for a priority, clamped to the three levels the database allows. */
export const priorityLevelOf = (priority: number) =>
  levels[Math.min(Math.max(priority, 1), levels.length) - 1] ?? '2'
