import { v } from 'convex/values'
import { currencies } from './currency'

export const localeValidator = v.union(v.literal('en'), v.literal('pl'))

export const currencyValidator = v.union(
  ...currencies.map((currency) => v.literal(currency)),
)
