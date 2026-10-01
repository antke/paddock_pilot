import type { HorseBreed } from '../horses/horseBreeds'
import type { Locale } from './locale'

// Stored values stay unchanged. Regional names reviewed against PZHK's breed programs:
// https://www.pzhk.pl/hodowla/programy-hodowlane/
export const polishHorseBreedLabels = {
  'Akhal-Teke': 'Achal-tekiński',
  'American Paint Horse': 'American Paint Horse',
  'American Quarter Horse': 'American Quarter Horse',
  Andalusian: 'Andaluzyjski',
  Appaloosa: 'Appaloosa',
  'Arab cross': 'Mieszaniec arabski',
  Arabian: 'Czysta krew arabska',
  Ardennes: 'Ardeński',
  'Australian Stock Horse': 'Australian Stock Horse',
  'Belgian Draft': 'Belgijski koń zimnokrwisty',
  'Black Forest Horse': 'Szwarcwaldzki',
  Breton: 'Bretoński',
  'Cleveland Bay': 'Cleveland Bay',
  Clydesdale: 'Clydesdale',
  Cob: 'Cob',
  Connemara: 'Connemara',
  Criollo: 'Criollo',
  Crossbred: 'Mieszaniec',
  'Dales Pony': 'Kuc dales',
  'Dartmoor Pony': 'Kuc dartmoor',
  'Dutch Warmblood': 'Holenderski koń półkrwi (KWPN)',
  'Eriskay Pony': 'Kuc eriskay',
  Exmoor: 'Exmoor',
  'Fell Pony': 'Kuc fell',
  'Fjord Horse': 'Fiordzki',
  Friesian: 'Fryzyjski',
  'Friesian cross': 'Mieszaniec fryzyjski',
  'Gypsy Cob': 'Gypsy Cob',
  'Hackney Horse': 'Hackney',
  'Hackney Pony': 'Kuc hackney',
  Haflinger: 'Haflinger',
  Hanoverian: 'Hanowerski',
  Highland: 'Highland',
  Holsteiner: 'Holsztyński',
  'Hucul Horse': 'Huculski',
  'Icelandic Horse': 'Islandzki',
  'Irish Cob': 'Irish Cob',
  'Irish Draught': 'Irlandzki koń pociągowy',
  'Irish Sport Horse': 'Irlandzki koń sportowy',
  'Kentucky Mountain Saddle Horse': 'Kentucky Mountain Saddle Horse',
  Lipizzaner: 'Lipicański',
  Lusitano: 'Lusitano',
  'Malopolska Horse': 'Małopolski',
  'Miniature Horse': 'Koń miniaturowy',
  'Missouri Fox Trotter': 'Missouri Fox Trotter',
  Morgan: 'Morgan',
  Mustang: 'Mustang',
  'Native cross': 'Mieszaniec ras rodzimych',
  'New Forest': 'New Forest',
  Oldenburg: 'Oldenburski',
  'Orlov Trotter': 'Kłusak orłowski',
  'Paso Fino': 'Paso Fino',
  Percheron: 'Perszeron',
  'Polish Ardennes': 'Arden polski',
  'Polish Coldblood': 'Polski koń zimnokrwisty',
  'Polish Konik': 'Konik polski',
  'Polish Pony': 'Kuc polski',
  'Polish Sport Horse': 'Polski koń sportowy',
  'Polish Warmblood': 'Polski koń półkrwi',
  Pottok: 'Pottok',
  'Rocky Mountain Horse': 'Rocky Mountain Horse',
  'Selle Français': 'Selle Français',
  'Shetland Pony': 'Kuc szetlandzki',
  Shire: 'Shire',
  'Silesian Horse': 'Śląski',
  'Sport Horse': 'Koń sportowy',
  Standardbred: 'Kłusak amerykański (Standardbred)',
  'Suffolk Punch': 'Suffolk Punch',
  'Tennessee Walking Horse': 'Tennessee Walking Horse',
  Thoroughbred: 'Pełna krew angielska',
  Trakehner: 'Trakeński',
  Warmblood: 'Koń gorącokrwisty',
  'Welsh Cob': 'Welsh Cob',
  'Welsh Pony': 'Kuc walijski',
  'Welsh Section A': 'Kuc walijski — sekcja A',
  'Welsh Section B': 'Kuc walijski — sekcja B',
  'Welsh Section C': 'Kuc walijski — sekcja C',
  'Welsh Section D': 'Welsh Cob — sekcja D',
  Westphalian: 'Westfalski',
  'Wielkopolska Horse': 'Wielkopolski',
  Zangersheide: 'Zangersheide',
  Other: 'Inna',
} satisfies Record<HorseBreed, string>

export function getHorseBreedLabel(breed: string, locale: Locale = 'en') {
  return locale === 'pl' && Object.hasOwn(polishHorseBreedLabels, breed)
    ? polishHorseBreedLabels[breed as HorseBreed]
    : breed
}

export function normalizeBreedSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ł/gi, 'l')
    .toLocaleLowerCase('en-GB')
    .trim()
}

export function matchesBreedSearch(breed: string, query: string) {
  const search = normalizeBreedSearch(query)
  return [breed, getHorseBreedLabel(breed, 'pl')].some((label) =>
    normalizeBreedSearch(label).includes(search),
  )
}
