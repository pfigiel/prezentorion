const pad = (value: number) => String(value).padStart(2, '0')

/** The calendar day a timestamp falls on where the admin is, as the date helpers expect it. */
export const localDateOf = (timestamp: string) => {
  const date = new Date(timestamp)

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
