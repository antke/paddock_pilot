import { EventFormFields } from '#/components/forms/event/EventFormFields'
import {
  eventFormSchema,
  type EventFormInput,
  type EventFormSchema,
} from '#/components/forms/event/eventFormSchema'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { convexQuery } from '@convex-dev/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/events/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()
  const nav = useNavigate()
  const addEvent = useMutation(api.events.add)

  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: stableId as Id<'stables'> }),
  )

  const form = useForm<EventFormInput, unknown, EventFormSchema>({
    resolver: zodResolver(eventFormSchema),
    mode: 'onTouched',
    defaultValues: {
      stableId,
      horseIds: [],
      date: '',
      time: '',
      type: 'training',
      title: '',
      description: '',
      location: '',
      recurring: false,
    },
  })

  const onSubmit = async (data: EventFormSchema) => {
    try {
      const newEventId = await addEvent({
        stableId: stableId as Id<'stables'>,
        horseIds: data.horseIds as Array<Id<'horses'>>,
        date: data.date,
        time: data.time,
        type: data.type,
        title: data.title,
        description: data.description,
        location: data.location,
        recurrence: data.recurring ? data.recurrence : undefined,
      })

      toast.success('Event created', {
        description: <p>{data.title} is ready.</p>,
        position: 'top-right',
      })

      nav({
        to: '/stables/$stableId/events/$eventId',
        params: { stableId, eventId: newEventId },
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    }
  }

  return (
    <form id="event-form" onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Add event</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <EventFormFields
            control={form.control}
            setValue={form.setValue}
            horses={horses}
            disabled={form.formState.isSubmitting}
          />
        </CardContent>

        <CardFooter className="gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={form.formState.isSubmitting}
            onClick={() => form.reset()}
          >
            Reset
          </Button>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
