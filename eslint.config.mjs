import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "next.config.js",
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      ".turbo/**",
      "eslint.config.*",
      "next-env.d.ts",
    ],
  },

  tseslint.configs.eslintRecommended,
  ...tseslint.configs.recommended,

  {
    ...js.configs.recommended,
    ...nextPlugin.configs.recommended,

    files: ["**/*.{js,ts,tsx}"],
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
      react: reactPlugin,
      unicorn: eslintPluginUnicorn,
    },
    settings: {
      react: {
        version: "detect",
      },
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

      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      "unicorn/prefer-global-this": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-useless-undefined": "warn",
      "unicorn/filename-case": "error",
    },
  },
];
