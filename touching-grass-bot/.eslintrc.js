module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: 'standard',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    // Allow console for logging
    'no-console': 'off',
    // Allow unused vars in test files
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // Disable camelcase for database field names (snake_case)
    'camelcase': 'off'
  }
}

