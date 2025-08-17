import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_API_PROXY_TARGET

  return {
    plugins: [react()],
    server: {
      proxy: proxyTarget
        ? {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
              // keep cookie credentials working through proxy
              configure: (proxy) => {
                // no-op: use default http-proxy behavior
              },
            },
          }
        : undefined,
    },
  }
})
