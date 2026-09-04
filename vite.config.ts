import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import contentCollections from '@content-collections/vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const shouldEnableDevtoolsEventBus =
  process.env.TANSTACK_DEVTOOLS_EVENT_BUS !== '0'

const appPlugins = [
  devtools({ eventBusConfig: { enabled: shouldEnableDevtoolsEventBus } }),
  nitro({ rollupConfig: { external: [/^@sentry\//] } }),
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
