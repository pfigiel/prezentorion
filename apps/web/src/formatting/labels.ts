const locale = 'pl-PL'

const dayMonth = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' })

const fullDate = new Intl.DateTimeFormat(locale, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const money = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 0,
})

/** A calendar date as the API sends it, `2026-12-24`, read as that day wherever the browser is. */
const dateOf = (isoDate: string) => {
  const [year = 0, month = 1, day = 1] = isoDate.split('-').map(Number)

  return new Date(year, month - 1, day)
}

export const dayMonthLabelOf = (isoDate: string) => dayMonth.format(dateOf(isoDate))

export const dateLabelOf = (isoDate: string) => fullDate.format(dateOf(isoDate))

export const moneyLabelOf = (amount: number) => money.format(amount)
