import nextPlugin from "@next/eslint-plugin-next";
import importPlugin from "eslint-plugin-import";
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
        PageProps: "readonly",
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
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
        },
      ],
      "no-undef": "error",

      // "no-console": "warn",
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: "error",
      curly: "off",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      // "no-alert": "warn",
      "no-empty": "error",
      "import/no-duplicates": ["error", { considerQueryString: true }],
      "no-useless-return": "error",
      "prefer-arrow-callback": "error",
      "arrow-spacing": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
      "import/newline-after-import": ["error", { count: 1 }],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],

      "@typescript-eslint/no-explicit-any": "warn",

      "@next/next/no-img-element": "error",
      "@next/next/no-html-link-for-pages": "error",

      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "no-return-await": "error",
      "prefer-destructuring": ["error", { array: false, object: true }],
      "prefer-rest-params": "error",
      "prefer-spread": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "as", objectLiteralTypeAssertions: "allow" },
      ],
      "import/no-useless-path-segments": "error",
      "prefer-object-spread": "error",
      "no-constant-condition": ["error", { checkLoops: false }],
      "no-useless-concat": "error",
      // "react/self-closing-comp": "error",
      // "react-hooks/exhaustive-deps": "error",
      // "no-nested-ternary": "warn",

      "@typescript-eslint/prefer-optional-chain": "error",
      "import/first": "error",
      "import/no-mutable-exports": "error",

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
