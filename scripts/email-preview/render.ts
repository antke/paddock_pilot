import { createEmailContent } from '../../convex/libs/email/templates'
import { emailPreviewFixtures, previewAppUrl } from './fixtures'

export const previews = (['en', 'pl'] as const).flatMap((locale) =>
  emailPreviewFixtures.map((fixture) => ({
    id: `${locale}-${fixture.id}`,
    label: `${locale.toUpperCase()} · ${fixture.label}`,
    ...createEmailContent(fixture.template, previewAppUrl, locale),
  })),
)
