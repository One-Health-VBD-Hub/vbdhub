import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import pluginQuery from '@tanstack/eslint-plugin-query';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = defineConfig([
  // Next.js + React + TS rules
  ...nextVitals,
  ...nextTs,

  // TanStack Query rules (flat config)
  ...pluginQuery.configs['flat/recommended'],

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts'
  ]),

  // Prettier integration - keep LAST
  // replaces `plugin:prettier/recommended`
  eslintPluginPrettierRecommended
]);

export default eslintConfig;
