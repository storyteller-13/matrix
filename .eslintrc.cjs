/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  extends: ["eslint:recommended"],
  globals: {
    BaseApp: "readonly",
    WindowManager: "readonly",
    WindowManagerClass: "readonly",
    NotesStorage: "readonly",
    TodoStorage: "readonly",
    MusicPlayerStorage: "readonly",
    YT: "readonly",
    PanelClass: "readonly",
    Env: "readonly",
    I18n: "readonly",
    I18nClass: "readonly",
  },
  rules: {
    "no-empty": ["error", { allowEmptyCatch: true }],
    "no-undef": "warn",
    "no-constant-condition": "warn",
  },
  overrides: [
    {
      files: ["tests/**/*.js", "**/*.test.js"],
      env: { node: true },
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
        vi: "readonly",
      },
    },
  ],
  ignorePatterns: ["node_modules/", "coverage/", "dist/", ".vitest/"],
};
