import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import contentCollections from '@content-collections/vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const shouldEnableDevtoolsEventBus =
  process.env.TANSTACK_DEVTOOLS_EVENT_BUS !== '0'

// Console piping holds one never-ending SSE request open per page. Pages with
// several same-origin iframes (the landing lab gallery) exhaust the browser's
// six-connection limit and stall module loading, so it is opt-in.
const shouldEnableDevtoolsConsolePipe =
  process.env.TANSTACK_DEVTOOLS_CONSOLE_PIPE === '1'

const appPlugins = [
  devtools({
    eventBusConfig: { enabled: shouldEnableDevtoolsEventBus },
    consolePiping: { enabled: shouldEnableDevtoolsConsolePipe },
  }),
  nitro({
    // Keep the server module graph together: splitting Clerk's provider across
    // circular SSR chunks can capture an undefined export during initialization.
    // This does not disable Vite's browser-side route/code splitting.
    inlineDynamicImports: true,
    rollupConfig: { external: [/^@sentry\//] },
  }),
  contentCollections(),
  tailwindcss(),
  tanstackStart(),
  viteReact(),
]

const testPlugins = [tailwindcss(), viteReact()]

const echartsOptimizedDependencies = [
  'echarts/core',
  'echarts/charts',
  'echarts/components',
  'echarts/renderers',
]

const config = defineConfig(({ mode }) => ({
  plugins: mode === 'test' ? testPlugins : appPlugins,
  resolve: {
    tsconfigPaths: true,
  },
  optimizeDeps: {
    include: echartsOptimizedDependencies,
  },
}))

export default config
