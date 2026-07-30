type TextDisplayPart = string | number | null | undefined | false

export function formatMetaText(parts: Array<TextDisplayPart>) {
  return parts.filter(isDisplayPart).join(' · ')
}

export function formatLineText(parts: Array<TextDisplayPart>) {
  return parts.filter(isDisplayPart).join('\n')
}

export function formatCommaList(parts: Array<TextDisplayPart>) {
  return parts.filter(isDisplayPart).join(', ')
}

export function formatConjunctionList(parts: Array<TextDisplayPart>) {
  const displayParts = parts.filter(isDisplayPart)

  if (displayParts.length <= 2) return displayParts.join(' and ')

  return `${displayParts.slice(0, -1).join(', ')}, and ${displayParts.at(-1)}`
}

function isDisplayPart(part: TextDisplayPart): part is string | number {
  return part !== null && part !== undefined && part !== false && part !== ''
}
