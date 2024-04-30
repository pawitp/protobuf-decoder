import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    sourcemap: true
  },
  plugins: [react()],
  test: {
    environment: 'jsdom'
  }
})
