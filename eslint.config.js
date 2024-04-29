'use strict'

const globals = require('globals')
const jestPlugin = require('eslint-plugin-jest')
const prettierConfig = require('eslint-config-prettier/prettier')

module.exports = {
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.commonjs,
            ...globals.es2021,
            ...globals.node,
            ...globals.jest
        },
        parserOptions: {
            ecmaVersion: 'latest'
        }
    },
    plugins: {
        jest: jestPlugin
    },
    rules: {
        indent: [
            'error',
            4,
            {SwitchCase: 1}
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        quotes: [
            'error',
            'single',
            {avoidEscape: true}
        ],
        semi: [
            'error',
            'never'
        ],
        'jest/no-identical-title': 'error',
        ...prettierConfig.rules
    }
}
