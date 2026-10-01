import { emailEN } from './email.en'
import { emailPL } from './email.pl'
import type { Locale } from './locale'

export const emailCopy = { en: emailEN, pl: emailPL }
export const getEmailCopy = (locale: Locale = 'en') => emailCopy[locale]
