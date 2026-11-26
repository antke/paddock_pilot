import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { e2eEnv } from './env'

const root = resolve(import.meta.dirname, '../..')
const bin = join(root, 'node_modules/.bin/convex')

const convex = (args: Array<string>, cwd = root) =>
  execFileSync(bin, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    // Never inherit the dev deployment that .env.local put into process.env.
    env: {
      ...process.env,
      CONVEX_DEPLOYMENT: `dev:${e2eEnv.convexDeployment}`,
    },
  })

/** Runs an internal e2e function on the e2e deployment only. */
export const runInternal = (name: string, args: object = {}) =>
  JSON.parse(
    convex([
      'run',
      '--deployment',
      e2eEnv.convexDeployment,
      name,
      JSON.stringify(args),
    ]) || 'null',
  )

/** Pushes the working tree's functions so tests exercise the current server code. */
export const pushFunctions = () => {
  // `convex dev` rewrites the .env.local it finds, so run it from a scratch
  // directory that links to the code: your own .env.local is never touched.
  const dir = mkdtempSync(join(tmpdir(), 'paddock-e2e-push-'))
  try {
    for (const entry of [
      'convex',
      'shared',
      'package.json',
      'node_modules',
      'tsconfig.json',
    ])
      symlinkSync(join(root, entry), join(dir, entry))
    writeFileSync(
      join(dir, '.env.local'),
      `CONVEX_DEPLOYMENT=dev:${e2eEnv.convexDeployment}\n`,
    )
    convex(
      ['dev', '--once', '--codegen', 'disable', '--typecheck', 'disable'],
      dir,
    )
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}
