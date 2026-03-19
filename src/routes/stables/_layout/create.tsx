import { Button } from '#/components/ui/button'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

export const Route = createFileRoute('/stables/_layout/create')({
  component: RouteComponent,
})

const formSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must have at least 3 characters.')
    .max(50, 'Name cannot be longer than 50 characters.')
    .regex(/^[a-zA-Z0-9 ]+$/, `Name can't contain special characters`),
  location: z
    .string()
    .min(3, 'Location must have at least 3 characters.')
    .max(50, 'Location cannot be longer than 50 characters.')
    .regex(/^[a-zA-Z0-9 ]+$/, `Location can't contain special characters`),
  description: z.string().max(256, 'Please use a shorter description'),
})

function RouteComponent() {
  const addStable = useMutation(api.stables.add)
  const nav = useNavigate()

  type StableFormSchema = z.infer<typeof formSchema>

  const form = useForm<StableFormSchema>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      location: '',
      description: '',
    },
  })

  const onSubmit = async (data: StableFormSchema) => {
    try {
      const newStableId = await addStable({
        name: data.name,
        location: data.location,
        description: data.description,
      })

      toast('Working on it!', {
        description: <p>{data.name} is now being created.</p>,
        position: 'top-right',
      })

      form.reset()
      nav({ to: '/stables/$stableId', params: { stableId: newStableId } })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    }
  }

  return (
    <div className="max-w-md p-4">
      <form id="stable-form" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Stable Name</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  type="text"
                  aria-invalid={fieldState.invalid}
                  placeholder="Wild Unicorn Ranch"
                  autoComplete="off"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="location"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Address</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  type="text"
                  aria-invalid={fieldState.invalid}
                  placeholder="Sunshine Street 123"
                  autoComplete="off"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>

                <Textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Share something about the stable"
                  autoComplete="off"
                  className="min-h-m"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="flex gap-4 w-full align-middle justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>

            <Button type="submit">Create Stable</Button>
          </div>
        </div>
      </form>
    </div>
  )
}
