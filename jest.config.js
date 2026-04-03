'use strict'

module.exports = {
    projects: [
        {
            displayName: 'cjs',
            testMatch: ['<rootDir>/test/**/*.spec.js'],
            testEnvironment: 'node',
        },
        {
            displayName: 'esm',
            testMatch: ['<rootDir>/test/**/*.spec.mjs'],
            testEnvironment: 'node',
            transform: {},
        },
    ],
}
