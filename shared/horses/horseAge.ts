const dateKeyPattern = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/

const parseDateKey = (dateKey: string) => {
  const match = dateKey.match(dateKeyPattern)
  if (!match) return undefined

  const year = Number(match[1])
  const month = match[2] ? Number(match[2]) : undefined
  const day = match[3] ? Number(match[3]) : undefined

  if (year < 1900 || month === 0 || (month !== undefined && month > 12)) {
    return undefined
  }
  if (day !== undefined) {
    if (month === undefined) return undefined
    const date = new Date(year, month - 1, day)

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return undefined
    }
  }

  return { day, month, year }
}

export const calculateHorseAge = (
  dateOfBirth: string | undefined,
  asOf = new Date(),
) => {
  const birthDate = dateOfBirth ? parseDateKey(dateOfBirth) : undefined
  if (!birthDate) return undefined

  let age = asOf.getFullYear() - birthDate.year
  if (birthDate.month === undefined) return age

  const birthdayHasPassed =
    asOf.getMonth() + 1 > birthDate.month ||
    (asOf.getMonth() + 1 === birthDate.month &&
      (birthDate.day === undefined || asOf.getDate() >= birthDate.day))

  if (!birthdayHasPassed) age -= 1

  return age
}

export const getTodayDateKey = (today = new Date()) =>
  [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

export const composeHorseBirthDate = (input: {
  year?: string
  month?: string
  day?: string
}) => {
  const year = input.year?.trim()
  const month = input.month?.trim()
  const day = input.day?.trim()
  if (!year) return undefined

  return [
    year.padStart(4, '0'),
    ...(month ? [month.padStart(2, '0')] : []),
    ...(day ? [day.padStart(2, '0')] : []),
  ].join('-')
}

export const splitHorseBirthDate = (dateOfBirth?: string) => {
  const [year = '', month = '', day = ''] = dateOfBirth?.split('-') ?? []
  return { year, month, day }
}
