import { buttonVariants } from '#/components/ui/button'
import { Link } from '@tanstack/react-router'
import { LandingAppPreview } from './LandingAppPreview'
import { landingCareItems } from './landingContent'

export function PublicLandingPage() {
  return (
    <div className="grid gap-16 py-10 md:py-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-6">
          <div className="grid max-w-2xl gap-4">
            <p className="text-sm font-medium text-muted-foreground">
              Horse care, stable schedules, and provider notes
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Manage horse care without notebook, whiteboard, and text-message
              chaos.
            </h1>
            <p className="text-muted-foreground md:text-lg">
              Paddock Pilot gives owners and stable admins one shared place for
              horse records, nutrition notes, health issues, and upcoming care
              appointments.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/sign-up/$" className={buttonVariants()}>
              Create account
            </Link>
            <Link
              to="/sign-in/$"
              className={buttonVariants({ variant: 'outline' })}
            >
              Sign in
            </Link>
          </div>
        </div>

        <LandingAppPreview />
      </section>

      <section className="grid gap-8 rounded-3xl border bg-muted/30 p-6 md:p-10 lg:grid-cols-[0.8fr_1fr]">
        <div className="grid content-start gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            Built for regular horse owners
          </p>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Keep the care details close to the schedule.
          </h2>
          <p className="text-muted-foreground">
            When a vet, farrier, dentist, or stable admin needs context, the
            important notes are already connected to the horse and the shared
            stable calendar.
          </p>
        </div>

        <div className="grid gap-4">
          {landingCareItems.map((item) => (
            <div key={item} className="rounded-2xl border bg-background p-4">
              <p className="font-medium">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid justify-items-center gap-4 rounded-3xl bg-primary p-8 text-center text-primary-foreground md:p-12">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">
          Start replacing scattered care notes today.
        </h2>
        <p className="max-w-xl text-primary-foreground/80">
          Create an account, add a stable, and begin building clear horse care
          profiles for your yard.
        </p>
        <Link
          to="/sign-up/$"
          className={buttonVariants({ variant: 'secondary' })}
        >
          Get started
        </Link>
      </section>
    </div>
  )
}
