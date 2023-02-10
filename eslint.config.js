
/*
export default [{
  root: true,
  extends: "eslint:recommended",
  rules: {

    semi:
  }
}];
*/

import jsdoc from "eslint-plugin-jsdoc";
export default [
  {
    ignores: ["*.config.js"],
    plugins: {
      jsdoc: jsdoc
    },
    rules: {
      indent: ["error", 4],
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "linebreak-style": ["error", "unix"],
      "jsdoc/require-description": "warn",
    },
    linterOptions: {
      noInlineConfig: true
    },
    languageOptions: {
      sourceType: "module",
      ecmaVersion: 6
    }
  }
];