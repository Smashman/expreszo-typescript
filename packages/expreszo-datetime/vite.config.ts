import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

const buildTarget = process.env.BUILD_TARGET || 'esm';

export default defineConfig(() => {
  switch (buildTarget) {
    case 'umd':
      // UMD bundle for the playground / CDN consumers — Luxon is bundled
      // INLINE so the script tag is fully self-contained. The npm install
      // path keeps Luxon external (see the `esm` case below).
      return {
        build: {
          outDir: 'dist',
          emptyOutDir: false,
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'exprEvalDateTime',
            formats: ['umd' as const],
            fileName: () => 'bundle.js'
          },
          rollupOptions: {
            // @pro-fa/expreszo is type-only here — datetime's runtime code
            // doesn't import any *value* from it — so leaving it external
            // keeps it out of the UMD bundle without breaking anything.
            external: [
              '@pro-fa/expreszo',
              /^@pro-fa\/expreszo\/.*/
            ],
            output: {
              exports: 'named' as const
            }
          },
          minify: false
        },
        esbuild: {
          minifyIdentifiers: false,
          keepNames: true,
          target: 'es2020'
        }
      };

    case 'umd-min':
      return {
        build: {
          outDir: 'dist',
          emptyOutDir: false,
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'exprEvalDateTime',
            formats: ['umd' as const],
            fileName: () => 'bundle.min.js'
          },
          rollupOptions: {
            external: [
              '@pro-fa/expreszo',
              /^@pro-fa\/expreszo\/.*/
            ],
            output: {
              exports: 'named' as const
            }
          },
          minify: 'terser' as const,
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              unsafe_undefined: false
            },
            mangle: {
              reserved: ['undefined']
            },
            format: {
              preserve_annotations: true
            }
          }
        },
        esbuild: {
          minifyIdentifiers: false,
          keepNames: true,
          target: 'es2020'
        }
      };

    case 'esm':
    default:
      // ESM build for npm — keeps Luxon external so consumers' bundlers
      // resolve it once at the application boundary.
      return {
        plugins: [
          dts({
            tsconfigPath: './tsconfig.json',
            insertTypesEntry: true
          })
        ],
        build: {
          outDir: 'dist',
          emptyOutDir: buildTarget === 'esm',
          lib: {
            entry: { index: resolve(__dirname, 'src/index.ts') },
            name: 'expreszoDatetime',
            formats: ['es' as const]
          },
          rollupOptions: {
            external: [
              '@pro-fa/expreszo',
              /^@pro-fa\/expreszo\/.*/,
              'luxon'
            ],
            output: {
              exports: 'named' as const,
              preserveModules: false,
              inlineDynamicImports: false,
              entryFileNames: '[name].mjs',
              chunkFileNames: 'chunks/[name]-[hash].mjs'
            }
          },
          minify: false
        },
        esbuild: {
          minifyIdentifiers: false,
          keepNames: true,
          target: 'es2020'
        }
      };
  }
});
