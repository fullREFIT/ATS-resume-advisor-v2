import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "_reference/**",
    "docs/**",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // localStorage hydration on mount requires setState in useEffect.
      // The lint rule is overly conservative for this well-established pattern.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
