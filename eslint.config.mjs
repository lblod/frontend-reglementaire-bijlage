"use strict";

import { defineConfig, globalIgnores } from "eslint/config";

import babelParser from "@babel/eslint-parser";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import emberEslint from "eslint-plugin-ember/recommended";
import eslintPluginPrettierRecommended from "eslint-config-prettier";
// import emberParser from "ember-eslint-parser";

import nodePlugin from "eslint-plugin-n";
import eslintPluginQunitRecommended from "eslint-plugin-qunit/configs/recommended";

const parserOptions = {
  esm: {
    js: {
      ecmaFeatures: { modules: true },
      ecmaVersion: "latest",
    },
    ts: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
};
const config = defineConfig(
  js.configs.recommended,
  tseslint.configs.recommended,
  emberEslint.configs.base,
  emberEslint.configs.gjs,
  emberEslint.configs.gts,
  eslintPluginPrettierRecommended,
  eslintPluginQunitRecommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          // your babel options
          presets: ["@babel/preset-env"],

          plugins: [
            [
              "module:decorator-transforms",
              { runtime: { import: "decorator-transforms/runtime" } },
            ],
          ],
        },
      },
    },
  },
  {
    files: ["**/*.{js,gjs}"],
    languageOptions: {
      parserOptions: parserOptions.esm.js,
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ["**/*.{ts,gts}"],
    languageOptions: {
      parser: emberEslint.parser,
      parserOptions: parserOptions.esm.ts,
      globals: {
        ...globals.browser,
      },
    },
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      emberEslint.configs.gts,
    ],

    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: [
      "./.eslintrc.js",
      "./.prettierrc.js",
      "./.stylelintrc.js",
      "./.template-lintrc.js",
      "./ember-cli-build.js",
      "./testem.js",
      "./blueprints/*/index.js",
      "./config/**/*.js",
      "./lib/*/index.js",
      "./server/**/*.js",
    ],
    plugins: { node: nodePlugin },

    rules: { "@typescript-eslint/no-require-imports": "off" },
    languageOptions: {
      globals: {
        ...Object.fromEntries(
          Object.entries(globals.browser).map(([key]) => [key, "off"]),
        ),
        ...globals.node,
      },
    },
  },
  globalIgnores([
    "blueprints/*/files/",
    "declarations/",
    "dist/",
    "coverage/",
    "!**/.*",
    "**/.*/",
    ".node_modules.ember-try/",
  ]),
);
export default config;
