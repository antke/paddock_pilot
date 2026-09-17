import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'

// CI/Vercel supplies its own environment. Local checks can reuse .env.local;
// loadEnvFile preserves values already supplied by the calling environment.
const localEnv = new URL('../.env.local', import.meta.url)
if (existsSync(localEnv)) loadEnvFile(localEnv)
process.env.CLERK_TELEMETRY_DISABLED = '1'

const timeout = setTimeout(() => {
  console.error('Production smoke test timed out after 30 seconds.')
  process.exit(1)
}, 30_000)

try {
  const entry = new URL(
    '../.vercel/output/functions/__server.func/index.mjs',
    import.meta.url,
  )
  assert.ok(
    existsSync(entry),
    'Missing Vercel build. Run pnpm build:smoke to build and test it.',
  )
  const { default: handler } = await import(entry.href)
  assert.equal(
    typeof handler.fetch,
    'function',
    'Expected a Vercel fetch handler',
  )

  // No cookies, sign-in, backend mutations, or real invitation tokens. Calling
  // the emitted handler exercises the actual production SSR module graph.
  for (const path of ['/', '/sign-in', '/sign-up', '/pricing', '/']) {
    const response = await handler.fetch(
      // A programmatic request avoids Clerk's browser-cookie handshake redirect
      // for development keys. It still passes through Clerk middleware and SSR.
      new Request(`http://localhost:3000${path}`),
    )
    assert.equal(
      response.status,
      200,
      `${path} returned HTTP ${response.status}`,
    )
    assert.match(response.headers.get('content-type') ?? '', /text\/html/)
    const html = await response.text()
    assert.match(html, /<html[\s>]/i, `${path} did not return an HTML document`)
    assert.match(html, /<\/html>/i, `${path} returned an incomplete document`)
    assert.match(
      html,
      /<script[^>]*type="module"/i,
      `${path} omitted application scripts`,
    )
    assert.doesNotMatch(
      html,
      /Element type is invalid|Error in renderToReadableStream/,
    )
    console.log(`PASS ${path}: HTTP 200, complete server-rendered document`)
  }
  console.log('Production SSR smoke test passed (anonymous requests).')
  clearTimeout(timeout)
  // The imported application may retain SDK timers; this is a one-shot CLI.
  process.exit(0)
} catch (error) {
  clearTimeout(timeout)
  console.error('Production SSR smoke test failed:', error)
  process.exit(1)
}
