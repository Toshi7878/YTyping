import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "build/**", ".turbo/**", "eslint.config.*"],
  },

  tseslint.configs.eslintRecommended,
  ...tseslint.configs.recommended,

  {
    ...js.configs.recommended,
    ...nextPlugin.configs.recommended,

    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        PageProps: "readonly",
        YT: "readonly",
      },
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      import: importPlugin,
      "@next/next": nextPlugin,
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
        { prefer: "type-imports", disallowTypeAnnotations: false },
      ],
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
