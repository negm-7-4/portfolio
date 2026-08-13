import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

/**
 * Flat ESLint config.
 *
 * Three things this project specifically needs it to catch:
 *   • hook dependency mistakes — this codebase is dense with rAF loops,
 *     observers and subscriptions where a stale closure is a real bug;
 *   • accessibility regressions — the site is heavily custom-controlled, so
 *     `jsx-a11y` is doing load-bearing work, not decoration;
 *   • unused code — dead components had accumulated silently before this.
 */
export default [
  {
    ignores: ["dist/**", "node_modules/**", "studio/**", "coverage/**", "public/sw.js"],
  },

  js.configs.recommended,

  /* TypeScript is being adopted from the logic layer outward: lib, config and
     data are .ts today, the .jsx components follow as they are touched. These
     are the type-aware-free recommended rules, which is all a mixed codebase
     can meaningfully enforce until the migration finishes. */
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["src/**/*.{ts,tsx}", "scripts/**/*.ts"],
  })),

  /* ── Browser source ── */
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: { react: { version: "detect" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,

      // The new JSX transform makes these obsolete.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],

      // Console noise ships to visitors; the signature module is the one
      // deliberate exception and it guards on import.meta.env.
      "no-console": ["warn", { allow: ["warn", "error"] }],

      /* A scrollable box has to be focusable or keyboard users cannot scroll
         it (WCAG 2.1.1). The rule only whitelists `tabpanel` by default. */
      "jsx-a11y/no-noninteractive-tabindex": [
        "error",
        { tags: [], roles: ["tabpanel", "region"], allowExpressionValues: true },
      ],

      /* ── React Compiler rules: warn, don't block ──────────────────────
         eslint-plugin-react-hooks v6 ships the compiler's purity and
         immutability analysis. It is genuinely useful and worth reading,
         but this project is not compiled with it, and much of the codebase
         is deliberately imperative animation (rAF loops writing to refs,
         motion values mutated outside render). Treating every one of those
         as a build-breaking error would mean rewriting working, tested
         animation code to satisfy a compiler that is not in the pipeline.
         They stay visible as warnings so new code trends the right way. */
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",

      eqeqeq: ["error", "smart"],
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  /* ── React-Three-Fiber ────────────────────────────────────────────────
     `useFrame` mutating meshes, materials and uniforms in place IS the R3F
     API — sixty times a second, by design. The compiler's immutability
     rules have no model for that, so they are off in the 3D layer only. */
  {
    files: ["src/components/three/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },

  /* ── Serverless functions (Node, not browser) ── */
  {
    files: ["api/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      "no-console": "off", // server logs are the only observability here
    },
  },

  /* ── Build tooling + tests ── */
  {
    files: ["*.config.js", "scripts/**/*.{js,mjs}", "**/*.test.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: { "no-console": "off" },
  },

  /* The base rule cannot see TS constructs (types, enums, overloads) and
     misreports them; the TS-aware version replaces it in typed files. */
  {
    files: ["src/**/*.{ts,tsx}", "scripts/**/*.ts"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },

  prettier,
];
