import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: [
        'src/pages',
        // {
        //   src: 'src/modules',
        //   path: '',
        //   filePatterns: (filePatterns) => {
        //     debugger
        //     return true
        //   }
        // }
      ]
      /* options */
    }),
    vue(),
    Components({
      dts: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: [
      'date-fns/locale/en-US',
    ],
  },
  build: {
    sourcemap: false,
  },
  server: {
    host: '0.0.0.0',  // This is important for Docker
    port: 5173
  },
})
