import { HorseDocumentsCard } from '../documents/HorseDocumentsCard'
import type { HorseDetailSectionProps } from './HorseDetail'

export function HorseDocumentsSection({ horse }: HorseDetailSectionProps) {
  return <HorseDocumentsCard horse={horse} />
}
