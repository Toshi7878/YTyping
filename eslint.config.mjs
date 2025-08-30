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
      "react-hooks/exhaustive-deps": "off",
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
      // TypeScript基本ルール
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/prefer-as-const": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/no-duplicate-enum-values": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/prefer-function-type": "off",

      // Next.js Linkコンポーネントのインポートを禁止
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
