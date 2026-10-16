import { useT } from '#/i18n/LocaleProvider'

export function useCurrentLandingCapabilities() {
  const t = useT()
  return [
    {
      id: 'history',
      title: t('landingDirections.historyTitle'),
      description: t('landingDirections.historyDescription'),
    },
    {
      id: 'plans',
      title: t('landingDirections.plansTitle'),
      description: t('landingDirections.plansDescription'),
    },
    {
      id: 'care',
      title: t('landingDirections.careTitle'),
      description: t('landingDirections.careDescription'),
    },
    {
      id: 'people',
      title: t('landingDirections.peopleTitle'),
      description: t('landingDirections.peopleDescription'),
    },
  ]
}
