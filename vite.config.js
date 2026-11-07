import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' lets the built site work from any sub-folder, e.g. https://<you>.github.io/shalom-pg/
export default defineConfig({
  base: './',
  plugins: [react()],
})
