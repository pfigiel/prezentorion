type Gift = {
  repeatable: boolean
  purchasedBy: 'me' | 'other' | null
}

/** Still there to buy: nobody bought it yet, or it is repeatable and someone else did. */
export const isOnOffer = ({ repeatable, purchasedBy }: Gift) =>
  purchasedBy === null || (repeatable && purchasedBy === 'other')
