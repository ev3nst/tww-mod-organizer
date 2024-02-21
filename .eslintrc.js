/* eslint-env node */
module.exports = {
    env: {
        node: true,
        browser: true,
        es2021: true,
    },
    settings: {
        react: {
            version: 'detect',
        },
        'import/resolver': {
            node: {
                paths: ['./src'],
                extensions: ['.js', '.jsx', '.zip'],
            },
        },
    },
    extends: [
        'eslint:recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:import/recommended',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: ['jsx-a11y', 'react', 'react-hooks', 'import', 'prettier'],
    rules: {
        'react/react-in-jsx-scope': 'off',
        'react/no-unescaped-entities': 'off',
        'react/prop-types': 'off',
        'react/display-name': 'off',
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
        'jsx-a11y/alt-text': 'off',
        'no-empty': ['error', { allowEmptyCatch: true }],
        'import/no-named-as-default': 'off',
    },
    globals: {
        process: true,
    },
};
