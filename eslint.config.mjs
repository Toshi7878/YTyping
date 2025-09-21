import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "build/**", ".turbo/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // JavaScript基本ルール
      "no-unused-vars": "error",
      "no-undef": "error",
      "no-console": "warn",
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: "error",
      curly: "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "no-alert": "warn",
      "no-empty": "error",
      "no-duplicate-imports": "error",
      "no-useless-return": "error",
      "prefer-arrow-callback": "error",
      "arrow-spacing": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
      // NOTE: Remove plugin-scoped rules unless the plugin is installed and configured.
      // The 'react-hooks/exhaustive-deps' rule requires 'eslint-plugin-react-hooks'.
      // Keeping it here without the plugin causes the editor ESLint to fail to load.
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports", // import type を必須にする
          disallowTypeAnnotations: false,
        },
      ],
      "no-undef": "error",

      // Common stylistic rules (same as JS section)
      // "no-console": "warn",
      "no-debugger": "error",
      // "prefer-const": "error",
      // "no-var": "error",
      // eqeqeq: "error",
      curly: "off",
      // "no-eval": "error",
      // "no-implied-eval": "error",
      // "no-new-func": "error",
      // "no-script-url": "error",
      // "no-alert": "warn",
      // "no-empty": "error",
      // "no-duplicate-imports": "error",
      // "no-useless-return": "error",
      // "prefer-arrow-callback": "error",
      // "arrow-spacing": "error",
      // "object-shorthand": "error",
      // "prefer-template": "error",

      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "use-breakpoint",
              message:
                "use-breakpointパッケージからのインポートは禁止されています。代わりに@/lib/useBreakPointを使用してください。",
            },
          ],
        },
      ],
    },
  },
];
