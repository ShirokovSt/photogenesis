import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `vite build --mode single` packs the whole game into one index.html
export default defineConfig(({ mode }) => {
  const single = mode === 'single'
  return {
    base: './',
    // An explicit IPv4 address: on some machines "localhost" resolves to IPv6 ::1, which browsers can't reach
    server: { host: '127.0.0.1', port: 5173, strictPort: true },
    plugins: single ? [viteSingleFile()] : [],
    build: { outDir: single ? 'dist-single' : 'dist' },
  }
})
