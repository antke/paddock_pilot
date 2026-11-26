import type { WebSocketRoute } from '@playwright/test'
import { expect, test } from '../support/fixtures'

test('@mobile losing the connection shows an offline notice that clears on reconnect', async ({
  as,
  seed,
}) => {
  const member = await as('member')
  // setOffline doesn't drop an already-open WebSocket, so cut Convex's socket too.
  let offline = false
  const sockets: Array<WebSocketRoute> = []
  await member.routeWebSocket(/convex\.cloud/, (socket) => {
    if (offline) return socket.close()
    socket.connectToServer()
    sockets.push(socket)
  })
  await member.goto(`/stables/${seed.stables.hilltop}/horses`)
  await expect(member.getByText('Clover').first()).toBeVisible()

  offline = true
  await member.context().setOffline(true)
  for (const socket of sockets.splice(0)) await socket.close()
  await expect(member.getByText('You’re offline')).toBeVisible({
    timeout: 30_000,
  })
  offline = false
  await member.context().setOffline(false)
  await expect(member.getByText('You’re offline')).toBeHidden({
    timeout: 30_000,
  })
})

test('@mobile a Polish-speaking member gets the app in Polish', async ({
  as,
  seed,
}) => {
  const piotr = await as('polish')
  await piotr.goto(`/stables/${seed.stables.hilltop}/horses`)
  await expect(piotr.locator('html')).toHaveAttribute('lang', 'pl')
  await expect(
    piotr.getByRole('heading', { name: /Konie/, level: 1 }),
  ).toBeVisible()
  await expect(piotr.getByText('Clover').first()).toBeVisible()
})
