module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    // Disabling the "google" style guide to avoid strict formatting
    //"google",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    // You can disable the specific rules that are causing too many errors.
    "object-curly-spacing": "off",
    "max-len": "off",
    "quotes": "off",
    "no-trailing-spaces": "off",
    "comma-dangle": "off",
    "indent": "off",
    "no-unused-vars": "warn", // Turn unused vars to warnings to avoid breaking
    "no-tabs": "off",
    "arrow-parens": "off",
  },
};
