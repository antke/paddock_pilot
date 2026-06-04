import { ConvexError, v } from 'convex/values'
import { internalAction } from './_generated/server'

const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) => {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL ?? 'Paddock Pilot <onboarding@resend.dev>'

  if (!apiKey) throw new ConvexError('Missing RESEND_API_KEY')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  })

  if (!response.ok) {
    throw new ConvexError('Failed to send email')
  }
}

export const sendStableInvitation = internalAction({
  args: {
    email: v.string(),
    stableName: v.string(),
    token: v.string(),
  },
  handler: async (_ctx, args) => {
    const appUrl = process.env.APP_URL
    if (!appUrl) throw new ConvexError('Missing APP_URL')

    const inviteUrl = `${appUrl.replace(/\/$/, '')}/invitations/${args.token}`

    await sendEmail({
      to: args.email,
      subject: `You're invited to ${args.stableName} on Paddock Pilot`,
      html: `<p>You have been invited to join ${args.stableName} on Paddock Pilot.</p><p><a href="${inviteUrl}">Accept invitation</a></p>`,
    })
  },
})

export const sendEventHorseInvitation = internalAction({
  args: {
    email: v.string(),
    eventTitle: v.string(),
    horseNames: v.array(v.string()),
  },
  handler: async (_ctx, args) => {
    const horseList = args.horseNames.map((horseName) => `<li>${horseName}</li>`)

    await sendEmail({
      to: args.email,
      subject: `Horse invitation for ${args.eventTitle}`,
      html: `<p>Your horses have been invited to ${args.eventTitle}.</p><ul>${horseList.join('')}</ul><p>Sign in to Paddock Pilot to approve or decline.</p>`,
    })
  },
})
