import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// `claude-code` only exists inside Claude Code, so tests run against a stub.
// The mod's tsconfig.json extends .claude-plugin/types/, which is gitignored and
// absent in CI, so transform with a standalone one.
export default defineConfig({
  tsconfig: './tsconfig.vitest.json',
  // Vite 8 transforms with oxc; use the classic runtime so JSX compiles to global h(...).
  oxc: { jsx: { runtime: 'classic', pragma: 'h', pragmaFrag: 'Fragment' } },
  resolve: {
    alias: { 'claude-code': fileURLToPath(new URL('./tests/claude-code.stub.ts', import.meta.url)) },
  },
  test: { include: ['tests/**/*.test.{ts,tsx}'], setupFiles: ['tests/setup.ts'] },
})
