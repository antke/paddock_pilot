import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import contentCollections from '@content-collections/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const appPlugins = [
  devtools(),
  nitro({ rollupConfig: { external: [/^@sentry\//] } }),
  contentCollections(),
  tsconfigPaths({ projects: ['./tsconfig.json'] }),
  tailwindcss(),
  tanstackStart(),
  viteReact(),
]

const testPlugins = [
  tsconfigPaths({ projects: ['./tsconfig.json'] }),
  tailwindcss(),
  viteReact(),
]

const config = defineConfig(({ mode }) => ({
  plugins: mode === 'test' ? testPlugins : appPlugins,
}))

export default config
