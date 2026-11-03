import { useT, useLocale } from '#/i18n/LocaleProvider'
import { CopyIcon } from '@phosphor-icons/react'
import { ConfirmedCheck } from '#/components/motion/StateFeedback'
import { useRef, useState } from 'react'
import { Spinner } from '#/components/ui/spinner'
import { useTransientConfirmation } from '#/lib/useTransientConfirmation'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import {
  DetailReference,
  DetailReferenceField,
  DetailReferenceGroup,
  DetailReferenceList,
} from '#/components/dashboard/DetailReference'
import { Button } from '#/components/ui/button'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { copyTextToClipboard } from '#/lib/clipboard'
import { calculateHorseAge } from 'shared/horses/horseAge'
import { getHorseBreedLabel } from 'shared/i18n/horseBreedLabels'
import { formatPartialDateKey } from '#/lib/dateDisplay'
import type { HorseDetailSectionProps } from './HorseDetail'
import { HorseEditEntry } from './HorseEditEntry'

function HorseIdentifierValue({
  value,
  label,
}: {
  value: string
  label: string
}) {
  const t = useT()

  const [isCopying, setIsCopying] = useState(false)
  const copying = useRef(false)
  const confirmation = useTransientConfirmation(value)

  const copy = async () => {
    if (copying.current) return
    copying.current = true
    confirmation.clear()
    setIsCopying(true)
    try {
      await copyTextToClipboard(value)
      confirmation.confirm()
      showAppSuccessToast({ title: t('horseDetail.copied', { label }) })
    } catch {
      showAppErrorToast({
        title: t('horseDetail.copyFailed', { label: label.toLowerCase() }),
        description: <p>{t('horseDetail.copyHelp')}</p>,
      })
    } finally {
      copying.current = false
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
              data-confirmed={confirmation.confirmed || undefined}
              className="data-[confirmed=true]:text-primary"
              aria-label={t('horseDetail.copy', { label: label.toLowerCase() })}
              aria-busy={isCopying || undefined}
              disabled={isCopying}
              onClick={copy}
            />
          }
        >
          {isCopying ? (
            <Spinner aria-hidden="true" />
          ) : confirmation.confirmed ? (
            <ConfirmedCheck />
          ) : (
            <CopyIcon aria-hidden="true" />
          )}
        </TooltipTrigger>
        <TooltipContent>
          {confirmation.confirmed
            ? t('horseDetail.copied', { label })
            : t('horseDetail.copy', { label: label.toLowerCase() })}
        </TooltipContent>
      </Tooltip>
    </span>
  )
}

export function HorseProfileSection({
  horse,
  stableId,
  canManageHorse = false,
}: HorseDetailSectionProps) {
  const t = useT()
  const { locale } = useLocale()

  const age = calculateHorseAge(horse.dateOfBirth) ?? horse.age
  const hasRegistrationDetails =
    horse.passportNumber ||
    horse.microchipNumber ||
    horse.insuranceProvider ||
    horse.insurancePolicyNumber
  const hasParentage = horse.sire || horse.dam
  const notRecorded = t('horseDetail.notRecorded')
  const allergies = horse.allergies ?? []
  const birthDate = horse.dateOfBirth
    ? formatPartialDateKey(horse.dateOfBirth, locale)
    : undefined

  return (
    <DashboardSection aria-label={t('horseDetail.profileRegion')}>
      <DetailReference>
        <DetailReferenceGroup
          layout="stacked"
          title={t('horseDetail.horseDetails')}
          edit={
            canManageHorse && (
              <HorseEditEntry
                appearance="icon"
                horseId={horse._id}
                stableId={stableId}
                section="profile"
                label={t('horseDetail.editProfile')}
              />
            )
          }
        >
          <DetailReferenceList mobileColumns={2} wideColumns={3}>
            {/* The hero already shows the name; the registered name only
                adds information when a nickname is used day to day. */}
            {horse.nickname && (
              <>
                <DetailReferenceField
                  label={t('horseDetail.fullName')}
                  value={horse.name}
                />
                <DetailReferenceField
                  label={t('horseForm.nickname')}
                  value={horse.nickname}
                />
              </>
            )}
            <DetailReferenceField
              label={t('horseDetail.age')}
              value={
                age !== undefined && age !== null ? (
                  <>
                    {age}
                    {birthDate && (
                      <span className="block text-sm font-normal leading-5 text-muted-foreground">
                        {t('horseDetail.bornOn', { date: birthDate })}
                      </span>
                    )}
                  </>
                ) : (
                  birthDate
                )
              }
              missingValue={notRecorded}
            />
            <DetailReferenceField
              label={t('horseDetail.sex')}
              value={horse.sex ? t(`horseForm.${horse.sex}`) : undefined}
            />
            <DetailReferenceField
              label={t('horseDetail.breed')}
              value={
                horse.breed
                  ? getHorseBreedLabel(horse.breed, locale)
                  : undefined
              }
            />
            <DetailReferenceField
              label={t('horseDetail.color')}
              value={horse.color}
            />
            <DetailReferenceField
              label={t('horseDetail.height')}
              value={horse.height}
            />
            <DetailReferenceField
              label={t('horseDetail.discipline')}
              value={horse.discipline}
            />
          </DetailReferenceList>
          {hasParentage && (
            <DetailReferenceList
              title={t('horseDetail.parentage')}
              mobileColumns={2}
              wideColumns={3}
            >
              <DetailReferenceField
                label={t('horseDetail.sire')}
                value={horse.sire}
              />
              <DetailReferenceField
                label={t('horseDetail.dam')}
                value={horse.dam}
              />
            </DetailReferenceList>
          )}
        </DetailReferenceGroup>

        <DetailReferenceGroup
          layout="stacked"
          title={t('horseDetail.careInformation')}
          edit={
            canManageHorse && (
              <HorseEditEntry
                appearance="icon"
                horseId={horse._id}
                stableId={stableId}
                section="care"
                label={t('horseDetail.editCareInformation')}
              />
            )
          }
        >
          <DetailReferenceList mobileColumns={2} wideColumns={3}>
            <DetailReferenceField
              label={t('horseDetail.allergies')}
              value={
                allergies.length > 1 ? (
                  <ul className="grid list-disc gap-1 pl-5">
                    {allergies.map((allergy, index) => (
                      <li key={`${index}-${allergy}`}>{allergy}</li>
                    ))}
                  </ul>
                ) : (
                  allergies[0]
                )
              }
              missingValue={notRecorded}
            />
            <DetailReferenceField
              label={t('horseDetail.shoeing')}
              value={
                horse.shoeingStatus
                  ? t(`horseForm.${horse.shoeingStatus}`)
                  : undefined
              }
            />
            <DetailReferenceField
              label={t('horseDetail.deworming')}
              value={horse.dewormingNotes}
              fullWidth
              multiline
            />
          </DetailReferenceList>
        </DetailReferenceGroup>

        {(hasRegistrationDetails || canManageHorse) && (
          <DetailReferenceGroup
            layout="stacked"
            title={t('horseDetail.identificationAndInsurance')}
            edit={
              canManageHorse && (
                <HorseEditEntry
                  appearance="icon"
                  horseId={horse._id}
                  stableId={stableId}
                  section="identification"
                  label={t('horseDetail.editIdentification')}
                />
              )
            }
          >
            {hasRegistrationDetails ? (
              <DetailReferenceList wideColumns={3}>
                {horse.passportNumber && (
                  <DetailReferenceField
                    label={t('horseDetail.passport')}
                    value={
                      <HorseIdentifierValue
                        value={horse.passportNumber}
                        label={t('horseDetail.passport')}
                      />
                    }
                  />
                )}
                {horse.microchipNumber && (
                  <DetailReferenceField
                    label={t('horseDetail.microchip')}
                    value={
                      <HorseIdentifierValue
                        value={horse.microchipNumber}
                        label={t('horseDetail.microchipNumber')}
                      />
                    }
                  />
                )}
                <DetailReferenceField
                  label={t('horseDetail.insurer')}
                  value={horse.insuranceProvider}
                />
                <DetailReferenceField
                  label={t('horseDetail.policy')}
                  value={horse.insurancePolicyNumber}
                />
              </DetailReferenceList>
            ) : (
              <DetailReferenceList wideColumns={3}>
                <DetailReferenceField
                  label={t('horseDetail.passport')}
                  missingValue={notRecorded}
                />
                <DetailReferenceField
                  label={t('horseDetail.insurer')}
                  missingValue={notRecorded}
                />
              </DetailReferenceList>
            )}
          </DetailReferenceGroup>
        )}
      </DetailReference>
    </DashboardSection>
  )
}
