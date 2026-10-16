import { createFileRoute, notFound } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import type { Doc } from 'convex/_generated/dataModel'
import { AppMotionProvider } from '#/components/motion/appMotion'
import { MotionList } from '#/components/motion/MotionList'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { CareRemindersCard } from '#/components/reminders/CareRemindersCard'
import { FormSection, InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import { FileUploadField } from '#/components/forms/FileUploadField'
import { Button } from '#/components/ui/button'
import { Field, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { Checkbox } from '#/components/ui/checkbox'
import { Switch } from '#/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '#/components/ui/tabs'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '#/components/ui/dialog'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '#/components/ui/tooltip'
import { StableEventsCalendar } from '#/components/stables/StableEventsCalendar'
import ThemeToggle from '#/components/ThemeToggle'

export const Route = createFileRoute('/page-lab/motion')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound()
  },
  component: MotionFixture,
})
const care = {
  _id: 'motion-care',
  _creationTime: 1,
  title: 'Juniper’s evening care',
  category: 'other',
  status: 'pending',
  dueDate: '2026-10-16',
  priority: 'medium',
  createdBy: 'sample-owner',
  createdAt: 1,
  updatedAt: 1,
} as Doc<'careReminders'>
const appointment = {
  _id: 'motion-event',
  _creationTime: 1,
  title: 'Farrier visit',
  type: 'hoof_trimming',
  date: '2026-10-16',
  time: '10:00',
  status: 'planned',
  horseIds: [],
  createdAt: 1,
  updatedAt: 1,
} as unknown as Doc<'events'>

function MotionFixture() {
  const [reminders, setReminders] = useState([care])
  const [operation, setOperation] = useState(false)
  const gate = useRef<{
    resolve: () => void
    reject: (reason: Error) => void
  } | null>(null)
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string>()
  const [draft, setDraft] = useState('Evening notes')
  const [files, setFiles] = useState<FileList | null>(null)
  const [records, setRecords] = useState(['Juniper', 'Willow', 'Bramble'])
  const [choice, setChoice] = useState('day')
  const hold = () =>
    new Promise<void>((resolve, reject) => {
      gate.current = { resolve, reject }
      setOperation(true)
    })
  const settle = (success: boolean) => {
    const current = gate.current
    gate.current = null
    setOperation(false)
    if (success) current?.resolve()
    else current?.reject(new Error('Sample failure'))
  }
  return (
    <AppMotionProvider>
      <main data-motion-fixture className="mx-auto max-w-5xl p-4 sm:p-8">
        <DashboardPage>
          <DashboardPageHeader
            title="Interaction verification"
            description="Local fixture · No live records change. Resolve or reject the held sample request to inspect feedback."
            actions={<ThemeToggle />}
          />
          <div className="flex flex-wrap gap-2 py-3">
            <Button disabled={!operation} onClick={() => settle(true)}>
              Confirm sample request
            </Button>
            <Button
              variant="destructive"
              disabled={!operation}
              onClick={() => settle(false)}
            >
              Reject sample request
            </Button>
            <Button
              variant="outline"
              disabled={operation}
              onClick={() => setReminders([care])}
            >
              Restore care sample
            </Button>
          </div>
          <CareRemindersCard
            title="Care completion"
            reminders={reminders.map((reminder) => ({
              reminder,
              canManage: true,
            }))}
            outstandingCount={
              reminders.filter((item) => item.status === 'pending').length
            }
            canAddReminder={false}
            emptyMessage="No outstanding care in this sample."
            onAdd={async () => {}}
            onComplete={async () => {
              await hold()
              setReminders([])
            }}
            onDismiss={async () => {
              await hold()
              setReminders([])
            }}
            onRemove={async () => {
              await hold()
              setReminders([])
            }}
          />
          <DashboardSectionCard title="Forms and controls">
            <InlineForm
              onSubmit={async (event) => {
                event.preventDefault()
                if (pending) return
                setPending(true)
                setSaved(false)
                setError(undefined)
                try {
                  await hold()
                  setSaved(true)
                } catch {
                  setError(
                    'Sample save failed. Your notes are retained; try again.',
                  )
                } finally {
                  setPending(false)
                }
              }}
            >
              <Field>
                <FieldLabel htmlFor="motion-draft">Notes</FieldLabel>
                <Input
                  id="motion-draft"
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value)
                    setSaved(false)
                  }}
                />
              </Field>
              <FormSection
                title="Additional details"
                summary="Draft stays available"
              >
                <Field>
                  <FieldLabel htmlFor="motion-extra">
                    Additional notes
                  </FieldLabel>
                  <Input
                    id="motion-extra"
                    defaultValue="Retain this on collapse"
                  />
                </Field>
                <FileUploadField
                  label="Sample document"
                  files={files}
                  onFilesChange={setFiles}
                />
              </FormSection>
              <FormSubmissionError message={error} />
              <FormSubmitActions
                isSubmitting={pending}
                confirmed={saved}
                confirmedLabel="Saved"
                submitLabel="Save sample"
                submittingLabel="Saving sample…"
              />
            </InlineForm>
            <ChoiceButtonGroup
              aria-label="Period"
              layout="segmented"
              value={choice}
              onValueChange={setChoice}
              options={[
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
              ]}
            />
            <div className="flex gap-6">
              <Checkbox aria-label="Care selected" />
              <Switch aria-label="Sample preference" />
            </div>
            <Tabs defaultValue="one">
              <TabsList variant="line">
                <TabsTrigger value="one">Profile</TabsTrigger>
                <TabsTrigger value="two">Care</TabsTrigger>
              </TabsList>
              <TabsContent value="one">Sample profile</TabsContent>
              <TabsContent value="two">Sample care</TabsContent>
            </Tabs>
            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger render={<Button variant="outline" />}>
                  Open sample dialog
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Sample dialog</DialogTitle>
                  <DialogDescription>
                    Focus returns to its trigger when closed.
                  </DialogDescription>
                  <Field>
                    <FieldLabel htmlFor="motion-dialog-note">
                      Dialog note
                    </FieldLabel>
                    <Input id="motion-dialog-note" />
                  </Field>
                </DialogContent>
              </Dialog>
              <Tooltip>
                <TooltipTrigger render={<Button variant="ghost" />}>
                  Sample help
                </TooltipTrigger>
                <TooltipContent>
                  Context stays attached to this control.
                </TooltipContent>
              </Tooltip>
            </div>
          </DashboardSectionCard>
          <DashboardSectionCard
            title="Collection changes"
            actions={
              <div className="flex gap-2">
                <Button
                  onClick={() => setRecords((items) => [...items].reverse())}
                >
                  Reverse order
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRecords(['Juniper', 'Willow', 'Bramble'])}
                >
                  Restore records
                </Button>
              </div>
            }
          >
            <MotionList
              items={records}
              getKey={(item) => item}
              empty={<p>Sample collection is empty.</p>}
              renderItem={(item) => (
                <div className="app-record flex items-center justify-between gap-4">
                  <span>{item}</span>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setRecords((items) =>
                        items.filter((value) => value !== item),
                      )
                    }
                  >
                    Remove {item}
                  </Button>
                </div>
              )}
            />
          </DashboardSectionCard>
          <StableEventsCalendar
            events={[appointment]}
            initialMonth={new Date(2026, 9, 1)}
          />
        </DashboardPage>
      </main>
    </AppMotionProvider>
  )
}
