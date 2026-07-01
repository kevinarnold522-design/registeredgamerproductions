import base44 from "@base44/vite-plugin"
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

const buildId =
  process.env.CF_PAGES_COMMIT_SHA ||
  process.env.CF_PAGES_DEPLOYMENT_ID ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  `${Date.now()}`;

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    hmr: { clientPort: 443 },
  },
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    {
      name: 'inject-build-id',
      transformIndexHtml(html) {
        return html.replaceAll('__APP_BUILD_ID__', buildId);
      },
    },
    react(),
    legacy({
      targets: ['defaults', 'iOS >= 12', 'Safari >= 12', 'Chrome >= 64'],
      modernPolyfills: true,
      renderLegacyChunks: true,
    }),
  ],
  // Browser targets that cover the mobile devices users actually have. Older
  // mobile-Safari (< 15) chokes on top-level await and a few newer syntax
  // features, which was contributing to the "PAGE HICCUP" parse failures.
  build: {
    target: ['es2019', 'chrome87', 'safari14', 'firefox78', 'edge88'],
    cssTarget: ['chrome87', 'safari14'],
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'index.html'),
        index: resolve(__dirname, 'src/main.jsx'),
      },
      output: {
        entryFileNames: (chunkInfo) => chunkInfo.name === 'index' ? 'assets/index.js' : 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (name.endsWith('.css')) {
            return name.includes('index') || name === 'style.css'
              ? 'assets/index.css'
              : 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        // Split heavy vendor libs into their own chunks so the initial mobile
        // download is small and one slow chunk doesn't take down the rest.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('@tanstack')) return 'vendor-query';
          if (id.includes('@radix-ui')) return 'vendor-radix';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('/scheduler/')) return 'vendor-react';
          if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react';
          return 'vendor';
        },
      },
    },
  },
  esbuild: {
    target: 'es2019',
  },
});
