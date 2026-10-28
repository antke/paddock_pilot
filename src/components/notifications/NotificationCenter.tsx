import { formatEventTime } from '#/components/events/eventDisplay'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useState } from 'react'
import { useMutation, useConvexAuth } from 'convex/react'
import { BellIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import type { FunctionReturnType } from 'convex/server'
import { api } from 'convex/_generated/api'
import { Button, buttonVariants } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '#/components/ui/dialog'
import { useLocale } from '#/i18n/LocaleProvider'
import { useNotificationCopy } from './notificationCopy'

type Item = FunctionReturnType<typeof api.notifications.list>[number]

export function NotificationCenter() {
  const { isAuthenticated } = useConvexAuth()
  const {
    data: items,
    error: loadError,
    refetch,
  } = useQuery(
    convexQuery(api.notifications.list, isAuthenticated ? {} : 'skip'),
  )
  const markRead = useMutation(api.notifications.markRead)
  const approve = useMutation(api.events.approveHorseInvitation)
  const decline = useMutation(api.events.declineHorseInvitation)
  return (
    <NotificationCenterView
      loadError={Boolean(loadError)}
      onRetry={() => {
        void refetch()
      }}
      onRespond={async (eventHorseId, accept) => {
        await (accept ? approve : decline)({ eventHorseId })
      }}
      items={items}
      onRead={async (keys) => {
        for (let offset = 0; offset < keys.length; offset += 500)
          await markRead({ keys: keys.slice(offset, offset + 500) })
      }}
    />
  )
}

export function NotificationCenterView({
  items,
  onRead,
  onRespond,
  loadError = false,
  onRetry,
}: {
  loadError?: boolean
  onRetry?: () => void
  items?: Item[]
  onRead: (keys: string[]) => Promise<void>
  onRespond?: (
    id: NonNullable<Item['eventHorseId']>,
    accept: boolean,
  ) => Promise<void>
}) {
  const c = useNotificationCopy()
  const { locale } = useLocale()
  const [open, setOpen] = useState(false)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const [actionError, setActionError] = useState(false)
  const [actionStatus, setActionStatus] = useState<string>()
  const unread = items?.filter((item) => !item.read) ?? []
  const visible = unreadOnly ? unread : items
  async function read(keys: string[]) {
    if (busy) return
    setBusy(true)
    setError(false)
    try {
      await onRead(keys)
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }
  async function respond(
    id: NonNullable<Item['eventHorseId']>,
    accept: boolean,
  ) {
    if (busy || !onRespond) return
    setBusy(true)
    setActionError(false)
    setActionStatus(undefined)
    try {
      await onRespond(id, accept)
      setActionStatus(accept ? c.accepted : c.declined)
    } catch {
      setActionError(true)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative shrink-0"
        aria-label={`${c.title}${unread.length ? ` · ${unread.length} ${c.unread.toLowerCase()}` : ''}`}
        onClick={() => setOpen(true)}
      >
        <BellIcon aria-hidden="true" />
        {unread.length > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground"
          >
            {unread.length > 99 ? '99+' : unread.length}
          </span>
        )}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85dvh] overflow-y-auto">
          <DialogTitle className="pr-8">{c.title}</DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={!unreadOnly ? 'secondary' : 'ghost'}
              aria-pressed={!unreadOnly}
              onClick={() => setUnreadOnly(false)}
            >
              {c.all}
            </Button>
            <Button
              variant={unreadOnly ? 'secondary' : 'ghost'}
              aria-pressed={unreadOnly}
              onClick={() => setUnreadOnly(true)}
            >
              {c.unread} ({unread.length})
            </Button>
            {unread.length > 0 && (
              <Button
                variant="link"
                disabled={busy}
                className="h-auto whitespace-normal text-left"
                onClick={() => void read(unread.map((item) => item.key))}
              >
                {c.markAll}
              </Button>
            )}
          </div>
          {actionStatus && <p role="status">{actionStatus}</p>}
          {actionError && (
            <p role="alert" className="text-destructive">
              {c.actionFailed}
            </p>
          )}
          {error && (
            <p role="alert" className="text-destructive">
              {c.failed}
            </p>
          )}
          {loadError ? (
            <div role="alert">
              <p>{c.loadFailed}</p>
              <Button variant="outline" onClick={onRetry}>
                {c.retry}
              </Button>
            </div>
          ) : (
            !items && <p role="status">{c.loading}</p>
          )}
          {visible?.length === 0 && (
            <div className="py-8">
              <p className="font-semibold">{c.empty}</p>
              <p className="text-muted-foreground">{c.emptyHint}</p>
            </div>
          )}
          {[true, false].map((actionRequired) => {
            const group =
              visible?.filter(
                (item) => item.actionRequired === actionRequired,
              ) ?? []
            if (!group.length) return null
            return (
              <section
                key={String(actionRequired)}
                aria-label={actionRequired ? c.decisions : c.updates}
              >
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {actionRequired ? c.decisions : c.updates}
                </h3>
                <ul className="divide-y divide-border">
                  {group.map((item) => (
                    <li key={item.key} className="grid gap-2 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            {c.kinds[item.kind] ?? c.updates}
                          </p>
                          <p className="break-words font-semibold">
                            {item.name}
                          </p>
                        </div>
                        {!item.read && (
                          <span className="shrink-0 text-xs font-semibold text-primary">
                            {c.new}
                          </span>
                        )}
                      </div>
                      {item.context && (
                        <p className="text-sm text-muted-foreground">
                          {item.context === 'viewer'
                            ? c.viewer
                            : item.context === 'editor'
                              ? c.editor
                              : item.context}
                        </p>
                      )}
                      {item.eventDate && (
                        <p className="text-sm">
                          {c.scheduled}:{' '}
                          {new Intl.DateTimeFormat(locale, {
                            dateStyle: 'medium',
                          }).format(new Date(`${item.eventDate}T12:00:00`))}
                          {item.eventTime
                            ? ` · ${formatEventTime(item.eventTime, locale)}`
                            : ''}
                        </p>
                      )}
                      <time
                        className="text-xs text-muted-foreground"
                        dateTime={new Date(item.createdAt).toISOString()}
                      >
                        {new Intl.DateTimeFormat(locale, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(item.createdAt)}
                      </time>
                      <div className="flex flex-wrap gap-2">
                        {item.eventHorseId && onRespond && (
                          <>
                            <Button
                              size="sm"
                              disabled={busy}
                              onClick={() =>
                                void respond(item.eventHorseId!, true)
                              }
                            >
                              {c.approve}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() =>
                                void respond(item.eventHorseId!, false)
                              }
                            >
                              {c.decline}
                            </Button>
                          </>
                        )}
                        {item.href && !item.eventHorseId && (
                          <Link
                            to={item.href}
                            className={buttonVariants({
                              variant: 'outline',
                              size: 'sm',
                            })}
                            onClick={() => {
                              setOpen(false)
                              if (!item.read) void read([item.key])
                            }}
                          >
                            {item.kind.includes('invitation') ||
                            item.kind.startsWith('horse_')
                              ? c.review
                              : c.open}
                          </Link>
                        )}
                        {!item.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={busy}
                            onClick={() => void read([item.key])}
                          >
                            {c.markRead}
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </DialogContent>
      </Dialog>
    </>
  )
}
