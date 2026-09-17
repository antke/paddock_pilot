import { createEmailContent } from '../../convex/libs/email/templates'
import { emailPreviewFixtures, previewAppUrl } from './fixtures'

export const previews = emailPreviewFixtures.map((fixture) => ({
  id: fixture.id,
  label: fixture.label,
  ...createEmailContent(fixture.template, previewAppUrl),
}))
