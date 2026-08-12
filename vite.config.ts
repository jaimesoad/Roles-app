import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import { powerApps } from '@microsoft/power-apps-vite/plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss(), powerApps()],
  resolve: {
    alias: {
      // Maps '$lib' directly to your 'src/lib' directory
      '$lib': fileURLToPath(new URL('./src/lib', import.meta.url))
    }
  }
})
