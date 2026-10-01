import { v } from 'convex/values'

export const localeValidator = v.union(v.literal('en'), v.literal('pl'))
