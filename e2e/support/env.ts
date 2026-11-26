import { existsSync } from 'node:fs'

// .env.e2e.local wins over .env.local; loadEnvFile never overrides a set variable.
for (const file of ['.env.e2e.local', '.env.local'])
  if (existsSync(file)) process.loadEnvFile(file)

const required = (name: string) => {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing ${name}. See e2e/README.md.`)
  return value
}

export const e2eEnv = {
  port: 9191,
  get baseURL() {
    return `http://localhost:${this.port}`
  },
  convexDeployment: required('E2E_CONVEX_DEPLOYMENT'),
  convexUrl: required('E2E_CONVEX_URL'),
  get convexSiteUrl() {
    return this.convexUrl.replace(/\.convex\.cloud\/?$/, '.convex.site')
  },
  clerkPublishableKey: required('VITE_CLERK_PUBLISHABLE_KEY'),
  clerkSecretKey: required('CLERK_SECRET_KEY'),
}

// Never touch production: the suite wipes its whole deployment on every run.
if (!e2eEnv.clerkSecretKey.startsWith('sk_test_'))
  throw new Error('E2E needs a Clerk development instance (sk_test_ key).')
if (!e2eEnv.clerkPublishableKey.startsWith('pk_test_'))
  throw new Error('E2E needs a Clerk development instance (pk_test_ key).')
if (
  process.env.VITE_CONVEX_URL?.replace(/\/$/, '') ===
  e2eEnv.convexUrl.replace(/\/$/, '')
)
  throw new Error(
    'E2E_CONVEX_URL must be a dedicated deployment, not your dev one.',
  )
