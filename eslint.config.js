import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/', 'coverage/', 'dist/', '.vitest/'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        BaseApp: 'readonly',
        WindowManager: 'readonly',
        WindowManagerClass: 'readonly',
        NotesStorage: 'readonly',
        TodoStorage: 'readonly',
        MusicPlayerStorage: 'readonly',
        YT: 'readonly',
        PanelClass: 'readonly',
        Env: 'readonly',
        I18n: 'readonly',
        I18nClass: 'readonly',
      },
    },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-undef': 'warn',
      'no-constant-condition': 'warn',
      // ESLint 9 started flagging unused catch bindings; keep the 8.x behaviour.
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
    },
  },
  {
    files: ['tests/**/*.js', '**/*.test.js'],
    languageOptions: {
      globals: { ...globals.vitest },
    },
  },
];
