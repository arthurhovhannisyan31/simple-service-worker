/** @import * as eslint from "eslint" */

import globals from "globals";

import eslint from "@eslint/js";

import importPlugin from "eslint-plugin-import";
import stylistic from "@stylistic/eslint-plugin";
// eslint-disable-next-line import/no-unresolved
import tsParser from "@typescript-eslint/parser";
// eslint-disable-next-line import/no-unresolved
import tseslint from "typescript-eslint";

/** @type {eslint.Config} */
const languageOptionsConfig = {
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    globals: {
      ...globals.serviceworker,
      ...globals.browser,
      ...globals.node
    },
    parserOptions: {
      project: true,
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
      parser: tsParser,
    }
  },
};

/** @type {eslint.Config[]} */
const jsConfigs = [{
  files: ["**/*.*js"],
  plugins: {
    "@stylistic": stylistic
  },
  extends: [
    eslint.configs.recommended,
    tseslint.configs.disableTypeChecked
  ],
  rules: {
    "@stylistic/indent": ["error", 2]
  }
}, {
  files: ["**/*config.js"],
  rules: {
    "@typescript-eslint/no-var-requires": 0,
    quotes: ["error", "double"],
    "import/no-unresolved": 0
  }
}];

/** @type {eslint.Config[]} */
const tsConfigs = [{
  files: ["**/*.{ts, tsx}"],
  plugins: {
    "@stylistic": stylistic
  },
  extends: [
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
  ],
  languageOptions: {
    parser: tsParser
  },
  rules: {
    /* Common rules */
    quotes: ["error", "double"],
    "consistent-return": "warn",
    "default-case": 0,
    "no-undef": "off",
    "max-len": ["warn", { code: 120 }],
    /* Stylistic rules */
    "@stylistic/indent": ["error", 2],
    "@stylistic/arrow-parens": ["error", "always"],
    "@stylistic/brace-style": ["error", "1tbs"],
    "@stylistic/multiline-ternary": ["error", "always-multiline"],
    /* Typescript rules */
    "@typescript-eslint/no-empty-object-type": "warn",
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/no-unsafe-member-access": "warn",
    "@typescript-eslint/no-unsafe-enum-comparison": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-misused-promises": "warn",
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "@typescript-eslint/require-await": "warn",
    "@typescript-eslint/await-thenable": "warn",
    "@typescript-eslint/prefer-promise-reject-errors": "warn",
    "@typescript-eslint/no-unsafe-argument": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-unsafe-return": "warn",
    "@typescript-eslint/explicit-function-return-type": ["warn", {
      allowExpressions: true,
    }],
    "@typescript-eslint/consistent-type-exports": [
      "warn", { fixMixedExportsWithInlineTypeSpecifier: true },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        disallowTypeAnnotations: false,
        fixStyle: "inline-type-imports",
      },
    ],
  }
}, {
  files: ["**/*.d.ts"],
  rules: {
    "no-unused-vars": 0,
    "@typescript-eslint/triple-slash-reference": 0
  }
}
];

/** @type {eslint.Config} */
const stylisticConfig = stylistic.configs.customize({
  indent: 2,
  quotes: "double",
  semi: true,
  jsx: true,
  blockSpacing: true,
  commaDangle: "only-multiline",
  quoteProps: "as-needed",
  braceStyle: "1tbs"
});

/** @type {eslint.Config[]} */
export const importsConfigs = [
  {
    ignores: [
      "dist/**/*",
    ]
  },
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.errors,
  importPlugin.flatConfigs.warnings,
  {
    settings: {
      "import/extensions": [
        ".js",
        ".mjs",
        ".ts",
        ".tsx"
      ],
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": "eslint-import-resolver-typescript",
    },
    files: ["**/*.{js,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      },
    },
    rules: {
      "import/no-named-as-default": "warn",
      "import/prefer-default-export": 0,
      "import/no-extraneous-dependencies": "warn",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "type",
            "object",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          warnOnUnassignedImports: true,
        },
      ],
    }
  }];

export default tseslint.config(
  languageOptionsConfig,
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  tseslint.configs.stylistic,
  stylisticConfig,
  ...importsConfigs,
  ...jsConfigs,
  ...tsConfigs,
);
