// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { afterEach, expect, it } from 'vitest'
import { AccountQueryCacheBoundary } from './AccountQueryCacheBoundary'

afterEach(cleanup)

it('retains data within an account and clears it before rendering a different account or signed-out state', () => {
  const client = new QueryClient()
  const seen: unknown[] = []
  function Content() {
    seen.push(client.getQueryData(['horses']))
    return <p>Account content</p>
  }
  const show = (identity: string | null | undefined) => (
    <AccountQueryCacheBoundary client={client} identity={identity}>
      <Content />
    </AccountQueryCacheBoundary>
  )
  const { rerender } = render(show('owner'))
  client.setQueryData(['horses'], ['Private horse'])
  rerender(show('owner'))
  expect(seen.at(-1)).toEqual(['Private horse'])
  seen.length = 0
  rerender(show('other-owner'))
  expect(seen).toEqual([undefined])
  client.setQueryData(['horses'], ['Other horse'])
  seen.length = 0
  rerender(show(null))
  expect(seen).toEqual([undefined])
  seen.length = 0
  rerender(show(undefined))
  expect(seen).toHaveLength(0)
  client.clear()
})
