import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const MAX_LINE = 80;
const NON_ASCII = /[^\t -~]/u;
const LICENSE = /SPDX-License-Identifier|\bLicen[cs]e\b/u;

const asciiOnly = {
  meta: {
    type: 'problem',
    schema: [],
    messages: { ascii: 'Only printable ASCII characters are allowed.' },
  },
  create(context) {
    return {
      Program() {
        const lines = context.sourceCode.lines;
        lines.forEach((line, index) => {
          const column = line.search(NON_ASCII);
          if (column !== -1) {
            context.report({
              loc: { line: index + 1, column },
              messageId: 'ascii',
            });
          }
        });
      },
    };
  },
};

const isLicenseNote = (sourceCode, comment, index) =>
  index === 0 &&
  sourceCode.getTokenBefore(comment) === null &&
  LICENSE.test(comment.value);

const noComments = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      comment: 'Comments are not allowed. Only a license note on top.',
    },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      Program() {
        sourceCode
          .getAllComments()
          .filter((comment) => comment.type !== 'Shebang')
          .forEach((comment, index) => {
            if (!isLicenseNote(sourceCode, comment, index)) {
              context.report({ node: comment, messageId: 'comment' });
            }
          });
      },
    };
  },
};

const local = {
  rules: { 'ascii-only': asciiOnly, 'no-comments': noComments },
};

export default defineConfig([
  globalIgnores(['node_modules/', 'scratch/', 'dist/', 'coverage/']),
  js.configs.recommended,
  {
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
    plugins: { local },
    rules: {
      'local/ascii-only': 'error',
      'local/no-comments': 'error',
      'complexity': ['error', 10],
      'curly': ['error', 'all'],
      'eqeqeq': ['error', 'always'],
      'max-depth': ['error', 3],
      'max-lines': ['error', 300],
      'max-params': ['error', 3],
      'no-console': 'error',
      'no-else-return': 'error',
      'no-implicit-coercion': 'error',
      'no-nested-ternary': 'error',
      'no-param-reassign': ['error', { props: true }],
      'no-useless-return': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          allowForKnownSafeCalls: [
            {
              from: 'package',
              name: ['describe', 'it', 'suite', 'test'],
              package: 'node:test',
            },
          ],
        },
      ],
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [0, 1],
          enforceConst: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
        },
      ],
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
    },
  },
  {
    files: ['test/**/*.{ts,tsx}'],
    rules: { '@typescript-eslint/no-magic-numbers': 'off' },
  },
  prettier,
  {
    plugins: { '@stylistic': stylistic },
    rules: {
      '@stylistic/max-len': [
        'error',
        {
          code: MAX_LINE,
          tabWidth: 2,
          ignoreUrls: false,
          ignoreStrings: false,
          ignoreTemplateLiterals: false,
          ignoreRegExpLiterals: false,
          ignoreComments: false,
        },
      ],
    },
  },
]);
