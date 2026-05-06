import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: './tsconfig.json',
      insertTypesEntry: true
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        bin:   resolve(__dirname, 'src/bin.ts')
      },
      name: 'expreszoMcpServer',
      formats: ['es' as const]
    },
    rollupOptions: {
      external: [
        '@pro-fa/expreszo',
        /^@pro-fa\/expreszo\/.*/,
        'zod',
        /^@modelcontextprotocol\/sdk(\/.*)?$/,
        'vscode-languageserver-textdocument',
        'vscode-languageserver-types'
      ],
      output: {
        exports: 'named' as const,
        preserveModules: false,
        inlineDynamicImports: false,
        entryFileNames: '[name].mjs',
        chunkFileNames: 'chunks/[name]-[hash].mjs',
        banner: (chunk) => (chunk.fileName === 'bin.mjs' ? '#!/usr/bin/env node' : '')
      }
    },
    minify: false
  },
  esbuild: {
    minifyIdentifiers: false,
    keepNames: true,
    target: 'es2020'
  }
});
