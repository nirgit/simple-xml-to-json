'use strict'

const commonjs = require('@rollup/plugin-commonjs')
const replace = require('@rollup/plugin-replace')
const terser = require('@rollup/plugin-terser')

module.exports = (commandLineArgs) => {
    const { inline } = commandLineArgs
    delete commandLineArgs.inline
    return {
        input: 'src/xmlToJson.js',
        output: [
            {
                file: 'lib/simpleXmlToJson.min.js',
                format: 'cjs',
                exports: 'auto',
                plugins: [terser()]
            },
            {
                file: 'lib/simpleXmlToJson.js',
                format: 'cjs',
                exports: 'auto'
            }
        ],
        plugins: [
            commonjs(),
            replace({
                preventAssignment: true,
                values: { 'BUILD.COMPTIME': 'false' }
            }),
            ...(inline ? require('./scripts/inline-plugins') : [])
        ]
    }
}
