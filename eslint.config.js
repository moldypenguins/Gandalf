


export default [
  {
    ignores: ["*.config.js"],
    plugins: {},
    rules: {
      indent: ["error", 4],
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "linebreak-style": ["error", "unix"]
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