import { useT, useLocale } from '#/i18n/LocaleProvider'
import { CopyIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import {
  DetailField,
  DetailGrid,
  DetailNoteBlock,
  DetailPanel,
  DetailPanelGrid,
  DetailStack,
} from '#/components/dashboard/DetailBlocks'
import { DashboardBadgeList } from '#/components/dashboard/DashboardBadgeList'
import { TextLabel } from '#/components/ui/text-label'
import { Button } from '#/components/ui/button'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { copyTextToClipboard } from '#/lib/clipboard'
import { calculateHorseAge } from 'shared/horses/horseAge'
import { HorseAllergyBadge } from './HorseBadges'
import { getHorseBreedLabel } from 'shared/i18n/horseBreedLabels'
import { formatPartialDateKey } from '#/lib/dateDisplay'
import type { HorseDetailSectionProps } from './HorseDetail'

function HorseIdentifierValue({
  value,
  label,
}: {
  value: string
  label: string
}) {
  const t = useT()

  const [isCopying, setIsCopying] = useState(false)

  const copy = async () => {
    if (isCopying) return
    setIsCopying(true)
    try {
      await copyTextToClipboard(value)
      showAppSuccessToast({ title: t('horseDetail.copied', { label }) })
    } catch {
      showAppErrorToast({
        title: t('horseDetail.copyFailed', { label: label.toLowerCase() }),
        description: <p>{t('horseDetail.copyHelp')}</p>,
      })
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <span className="inline-flex max-w-full items-center gap-1">
      <span className="min-w-0 wrap-anywhere select-text">{value}</span>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="subtle"
              size="icon-sm"
              aria-label={t('horseDetail.copy', { label: label.toLowerCase() })}
              aria-busy={isCopying || undefined}
              disabled={isCopying}
              onClick={copy}
            />
          }
        >
          <CopyIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>
          {t('horseDetail.copy', { label: label.toLowerCase() })}
        </TooltipContent>
      </Tooltip>
    </span>
  )
}

export function HorseProfileSection({ horse }: HorseDetailSectionProps) {
  const t = useT()
  const { locale } = useLocale()

  const age = calculateHorseAge(horse.dateOfBirth) ?? horse.age
  const hasRegistrationDetails =
    horse.passportNumber ||
    horse.microchipNumber ||
    horse.insuranceProvider ||
    horse.insurancePolicyNumber
  const hasBreedingDetails = horse.sire || horse.dam || horse.shoeingStatus
  const hasCareNotes = horse.allergies?.length || horse.dewormingNotes
  const ageLabel =
    typeof age === 'number' ? `${age}` : t('horseDetail.notRecorded')

  return (
    <DashboardSection aria-label={t('horseDetail.profileRegion')}>
      <DetailPanelGrid variant="equal">
        <DetailPanel as="h2" title={t('horseDetail.glance')} span="lg2">
          <DetailGrid columns={4} mobileColumns={2} gap="default">
            <DetailField
              indent={false}
              label={t('horseDetail.age')}
              value={ageLabel}
              variant="readable"
            />
            {horse.breed && (
              <DetailField
                indent={false}
                label={t('horseDetail.breed')}
                value={getHorseBreedLabel(horse.breed, locale)}
                variant="readable"
              />
            )}
            {horse.sex && (
              <DetailField
                indent={false}
                label={t('horseDetail.sex')}
                value={t(`horseForm.${horse.sex}`)}
                variant="readable"
              />
            )}
            {horse.height && (
              <DetailField
                indent={false}
                label={t('horseDetail.height')}
                value={horse.height}
                variant="readable"
              />
            )}
            {horse.color && (
              <DetailField
                indent={false}
                label={t('horseDetail.color')}
                value={horse.color}
                variant="readable"
              />
            )}
            {horse.discipline && (
              <DetailField
                indent={false}
                label={t('horseDetail.discipline')}
                value={horse.discipline}
                variant="readable"
              />
            )}
            {horse.dateOfBirth && (
              <DetailField
                indent={false}
                label={t('horseDetail.birthDate')}
                value={formatPartialDateKey(horse.dateOfBirth, locale)}
                variant="readable"
              />
            )}
          </DetailGrid>
        </DetailPanel>

        {hasRegistrationDetails && (
          <DetailPanel as="h2" title={t('horseDetail.identification')}>
            <DetailGrid gap="default">
              {horse.passportNumber && (
                <DetailField
                  indent={false}
                  label={t('horseDetail.passport')}
                  value={
                    <HorseIdentifierValue
                      value={horse.passportNumber}
                      label={t('horseDetail.passport')}
                    />
                  }
                  variant="readable"
                />
              )}
              {horse.microchipNumber && (
                <DetailField
                  indent={false}
                  label={t('horseDetail.microchip')}
                  value={
                    <HorseIdentifierValue
                      value={horse.microchipNumber}
                      label={t('horseDetail.microchipNumber')}
                    />
                  }
                  variant="readable"
                />
              )}
              {horse.insuranceProvider && (
                <DetailField
                  indent={false}
                  label={t('horseDetail.insurance')}
                  value={horse.insuranceProvider}
                  variant="readable"
                />
              )}
              {horse.insurancePolicyNumber && (
                <DetailField
                  indent={false}
                  label={t('horseDetail.policy')}
                  value={horse.insurancePolicyNumber}
                  variant="readable"
                />
              )}
            </DetailGrid>
          </DetailPanel>
        )}

        {hasBreedingDetails && (
          <DetailPanel as="h2" title={t('horseDetail.lineage')}>
            <DetailGrid gap="default">
              {horse.sire && (
                <DetailField
                  indent={false}
                  label={t('horseDetail.sire')}
                  value={horse.sire}
                  variant="readable"
                />
              )}
              {horse.dam && (
                <DetailField
                  indent={false}
                  label={t('horseDetail.dam')}
                  value={horse.dam}
                  variant="readable"
                />
              )}
              {horse.shoeingStatus && (
                <DetailField
                  indent={false}
                  label={t('horseDetail.shoeing')}
                  value={t(`horseForm.${horse.shoeingStatus}`)}
                  variant="readable"
                />
              )}
            </DetailGrid>
          </DetailPanel>
        )}

        {hasCareNotes && (
          <DetailPanel as="h2" title={t('horseDetail.notes')} span="lg2">
            <DetailStack gap="loose">
              {horse.allergies?.length ? (
                <DetailStack gap="compact">
                  <TextLabel
                    size="sm"
                    weight="semibold"
                    className="text-primary"
                  >
                    {t('horseDetail.allergies')}
                  </TextLabel>
                  <DashboardBadgeList>
                    {horse.allergies.map((allergy) => (
                      <HorseAllergyBadge key={allergy} allergy={allergy} />
                    ))}
                  </DashboardBadgeList>
                </DetailStack>
              ) : null}
              {horse.dewormingNotes && (
                <DetailNoteBlock label={t('horseDetail.deworming')}>
                  {horse.dewormingNotes}
                </DetailNoteBlock>
              )}
            </DetailStack>
          </DetailPanel>
        )}
      </DetailPanelGrid>
    </DashboardSection>
  )
}
