import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/index.ts',
        'src/bin.ts',
        '**/*.d.ts'
      ],
      // Baseline thresholds reflect what 'tools.ts' currently covers — many
      // MCP tool handlers don't yet have happy-path tests. Raise to 80 once
      // the missing handler coverage is filled in.
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 80,
        lines: 70
      }
    }
  }
});
