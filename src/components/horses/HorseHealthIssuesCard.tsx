import { HealthIssueForm } from '#/components/horses/HealthIssueForm'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { toast } from 'sonner'
import type {
  HealthIssueFormSchema,
  HealthIssueSeverity,
} from 'shared/horses/healthIssueSchema'

type HorseHealthIssuesCardProps = {
  horse: Doc<'horses'>
}

const severityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} satisfies Record<HealthIssueSeverity, string>

const statusLabels = {
  active: 'Active',
  resolved: 'Resolved',
} satisfies Record<Doc<'horseHealthIssues'>['status'], string>

export function HorseHealthIssuesCard({ horse }: HorseHealthIssuesCardProps) {
  const { data: issues } = useSuspenseQuery(
    convexQuery(api.horseHealthIssues.listForHorse, { horseId: horse._id }),
  )
  const { data: permissions } = useSuspenseQuery(
    convexQuery(api.horseHealthIssues.getPermissions, { horseId: horse._id }),
  )
  const addIssue = useMutation(api.horseHealthIssues.add)
  const resolveIssue = useMutation(api.horseHealthIssues.resolve)
  const removeIssue = useMutation(api.horseHealthIssues.remove)
  const [pendingIssueId, setPendingIssueId] = useState<string>()
  const canManage = permissions.canManage

  const onAddIssue = async (data: HealthIssueFormSchema) => {
    try {
      await addIssue({
        horseId: horse._id,
        title: data.title,
        description: data.description,
        severity: data.severity,
      })

      toast.success('Health issue added', {
        description: <p>{data.title} is now visible on this horse profile.</p>,
        position: 'top-right',
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    }
  }

  const onResolveIssue = async (issue: Doc<'horseHealthIssues'>) => {
    try {
      setPendingIssueId(issue._id)
      await resolveIssue({ id: issue._id })
      toast.success('Health issue resolved', {
        description: <p>{issue.title} was marked as resolved.</p>,
        position: 'top-right',
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    } finally {
      setPendingIssueId(undefined)
    }
  }

  const onRemoveIssue = async (issue: Doc<'horseHealthIssues'>) => {
    try {
      setPendingIssueId(issue._id)
      await removeIssue({ id: issue._id })
      toast.success('Health issue removed', {
        description: <p>{issue.title} was removed.</p>,
        position: 'top-right',
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    } finally {
      setPendingIssueId(undefined)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health issues</CardTitle>
        <CardDescription>
          Track active and resolved care notes such as chipped hooves, food
          intolerances, tendon injuries, or medication sensitivities.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        {canManage && <HealthIssueForm onSubmit={onAddIssue} />}

        {canManage && issues.length > 0 && <Separator />}

        <div className="grid gap-4">
          {issues.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No health issues have been added for this horse yet.
            </p>
          ) : (
            issues.map((issue) => (
              <IssueRow
                key={issue._id}
                issue={issue}
                canManage={canManage}
                pending={pendingIssueId === issue._id}
                onResolve={onResolveIssue}
                onRemove={onRemoveIssue}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function IssueRow({
  issue,
  canManage,
  pending,
  onResolve,
  onRemove,
}: {
  issue: Doc<'horseHealthIssues'>
  canManage: boolean
  pending: boolean
  onResolve: (issue: Doc<'horseHealthIssues'>) => Promise<void>
  onRemove: (issue: Doc<'horseHealthIssues'>) => Promise<void>
}) {
  return (
    <div className="grid gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{issue.title}</h3>
            <Badge variant={issue.status === 'active' ? 'default' : 'secondary'}>
              {statusLabels[issue.status]}
            </Badge>
            {issue.severity && (
              <Badge variant="outline">{severityLabels[issue.severity]}</Badge>
            )}
          </div>

          {issue.description && (
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {issue.description}
            </p>
          )}
        </div>

        {canManage && (
          <div className="flex flex-wrap gap-2">
            {issue.status === 'active' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => onResolve(issue)}
              >
                Resolve
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => onRemove(issue)}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
