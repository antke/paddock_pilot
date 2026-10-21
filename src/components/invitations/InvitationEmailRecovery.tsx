import { useId, useRef, useState } from 'react'
import { useClerk, useUser } from '@clerk/tanstack-react-start'
import { useAction } from 'convex/react'
import { api } from 'convex/_generated/api'
import { useT } from '#/i18n/LocaleProvider'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { Button } from '#/components/ui/button'
import { Field, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'

export function InvitationEmailRecovery() {
  const { user, isLoaded } = useUser()
  const clerk = useClerk()
  const syncCurrentUser = useAction(api.users.syncCurrentUser)
  const email = user?.primaryEmailAddress ?? user?.emailAddresses[0]

  return (
    <InvitationEmailRecoveryView
      key={`${user?.id}:${email?.id}`}
      email={email?.emailAddress}
      loading={!isLoaded || !user}
      needsVerification={Boolean(
        email && email.verification.status !== 'verified',
      )}
      onSend={async () => {
        if (!email) throw new Error('No account email')
        await email.prepareVerification({ strategy: 'email_code' })
      }}
      onVerify={async (code) => {
        if (!email) throw new Error('No account email')
        const result = await email.attemptVerification({ code })
        if (result.verification.status !== 'verified') {
          throw new Error('Email verification incomplete')
        }
      }}
      onRefresh={async () => {
        if (!user) throw new Error('No account')
        await user.reload()
        // Read verified addresses on the server; never trust browser-supplied email.
        await syncCurrentUser({})
      }}
      onManage={() => clerk.openUserProfile()}
    />
  )
}

type Props = {
  email?: string
  loading?: boolean
  needsVerification: boolean
  onSend: () => Promise<void>
  onVerify: (code: string) => Promise<void>
  onRefresh: () => Promise<void>
  onManage: () => void
}

/** Query-free recovery form, also used by the local invitation preview. */
export function InvitationEmailRecoveryView({
  email,
  loading = false,
  needsVerification,
  onSend,
  onVerify,
  onRefresh,
  onManage,
}: Props) {
  const t = useT()
  const id = useId()
  const [code, setCode] = useState('')
  const [verified, setVerified] = useState(false)
  const [pending, setPending] = useState<'send' | 'verify' | 'refresh'>()
  const [error, setError] = useState<'send' | 'verify' | 'refresh'>()
  const [message, setMessage] = useState<'sent' | 'refreshed'>()
  const guard = useRef(false)
  const input = useRef<HTMLInputElement>(null)
  const showCode = needsVerification && !verified
  const busy = loading || pending !== undefined

  const run = async (operation: 'send' | 'verify' | 'refresh') => {
    if (guard.current || loading) return
    guard.current = true
    setPending(operation)
    setError(undefined)
    setMessage(undefined)
    let stage = operation
    try {
      if (operation === 'send') {
        await onSend()
        setCode('')
        setMessage('sent')
        input.current?.focus()
      } else {
        if (operation === 'verify') {
          await onVerify(code.trim())
          setVerified(true)
          stage = 'refresh'
          setPending('refresh')
        }
        await onRefresh()
        setMessage('refreshed')
      }
    } catch {
      setError(stage)
    } finally {
      guard.current = false
      setPending(undefined)
    }
  }

  return (
    <DashboardSectionCard
      title={t(
        showCode
          ? 'invitationFlow.verifyEmailTitle'
          : 'invitationFlow.emailUnavailable',
      )}
      description={t(
        showCode
          ? 'invitationFlow.verifyEmailHelp'
          : 'invitationFlow.emailRefreshHelp',
      )}
      descriptionSize="sm"
      contentGap="compact"
    >
      {showCode && (
        <form
          className="grid min-w-0 gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (code.trim()) void run('verify')
          }}
        >
          <p className="break-words text-sm">{email}</p>
          <Field>
            <FieldLabel htmlFor={id}>
              {t('invitationFlow.verificationCode')}
            </FieldLabel>
            <Input
              ref={input}
              id={id}
              name="verificationCode"
              autoComplete="one-time-code"
              inputMode="numeric"
              required
              value={code}
              readOnly={busy}
              aria-invalid={error === 'verify' || undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(event) => setCode(event.target.value)}
            />
          </Field>
          <DashboardActions align="start">
            <Button type="submit" disabled={busy || !code.trim()}>
              {t(
                pending === 'verify'
                  ? 'invitationFlow.verifyingEmail'
                  : 'invitationFlow.verifyEmail',
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => void run('send')}
            >
              {t(
                pending === 'send'
                  ? 'invitationFlow.sendingCode'
                  : 'invitationFlow.sendNewCode',
              )}
            </Button>
          </DashboardActions>
        </form>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {t(
            error === 'verify'
              ? 'invitationFlow.verifyEmailFailed'
              : error === 'send'
                ? 'invitationFlow.sendCodeFailed'
                : 'invitationFlow.refreshAccountFailed',
          )}
        </p>
      )}
      <p role="status" className="text-sm text-muted-foreground">
        {pending === 'refresh'
          ? t('invitationFlow.refreshingAccount')
          : message === 'sent'
            ? t('invitationFlow.codeSent')
            : message === 'refreshed'
              ? t('invitationFlow.accountRefreshed')
              : ''}
      </p>
      <DashboardActions align="start">
        <Button
          type="button"
          variant={showCode ? 'ghost' : 'default'}
          disabled={busy}
          onClick={() => void run('refresh')}
        >
          {t(
            pending === 'refresh'
              ? 'invitationFlow.refreshingAccount'
              : 'invitationFlow.refreshAccount',
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onManage}
        >
          {t('invitationFlow.manageAccount')}
        </Button>
      </DashboardActions>
    </DashboardSectionCard>
  )
}
