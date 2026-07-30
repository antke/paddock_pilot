const dateKeyPattern = /^(\d{4})-(\d{2})-(\d{2})$/

const parseDateKey = (dateKey: string) => {
  const match = dateKey.match(dateKeyPattern)
  if (!match) return undefined

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
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
  const birthdayHasPassed =
    asOf.getMonth() + 1 > birthDate.month ||
    (asOf.getMonth() + 1 === birthDate.month && asOf.getDate() >= birthDate.day)

  if (!birthdayHasPassed) age -= 1

  return age
}

export const getTodayDateKey = (today = new Date()) =>
  [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')
