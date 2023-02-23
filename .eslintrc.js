module.exports = {
  parser: "@typescript-eslint/parser", //定义ESLint的解析器
  env: {
    node: true,
    jest: true,
    browser: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:prettier/recommended",
  ],
  plugins: ["@typescript-eslint", "react", "prettier", "spellcheck"],
  rules: {
    "prettier/prettier": ["error"],
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "jsx-a11y/anchor-is-valid": "off",
    "spellcheck/spell-checker": [
      process.env.NODE_ENV === "development" ? "warn" : "off",
    ],
  },
  settings: {
    //自动发现React的版本，从而进行规范react代码
    react: {
      pragma: "React",
      version: "detect",
    },
  },
  ignorePatterns: ["build", "node_modules"],
  globals: {
    React: true,
    JSX: true,
  },
};
``;
