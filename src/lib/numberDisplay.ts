const fileSizeFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
})

const gbpCurrencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'GBP',
})

export function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) {
    return `${fileSizeFormatter.format(size / 1024)} KB`
  }

  return `${fileSizeFormatter.format(size / (1024 * 1024))} MB`
}

export function formatCurrencyAmount(value: number) {
  return gbpCurrencyFormatter.format(value)
}

export function formatCountLabel(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? '' : 's'}`
}
