import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';
import typescriptEslintParser from '@typescript-eslint/parser';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import prettierEslintPlugin from 'eslint-plugin-prettier';

export default defineConfig([
  // Ignore patterns
  globalIgnores([
    '.github/*',
    'docs/*',
    'node_modules/*',
    'eslint.config.js',
    'package.json',
    'tsconfig.json',
    "!src/**/*.ts",
    "!test/**/*.ts"
  ]),
  {
    // Specify the language options
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
      // Specify the parser
      parser: typescriptEslintParser,
      // Specify parser options
      parserOptions: {
        project: './tsconfig.json', // Path to your tsconfig.json
      },
    },
    // Specify plugins
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      prettier: prettierEslintPlugin,
    },
    // Specify the rules
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      // Other rules
      'object-curly-spacing': [2, 'always'],
      'array-bracket-spacing': [2, 'never'],
      'comma-spacing': [2, { before: false, after: true }],
      'comma-dangle': [
        2,
        {
          arrays: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never',
          imports: 'always-multiline',
          objects: 'always-multiline',
        },
      ],
      'no-unused-vars': [
        1,
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]);
