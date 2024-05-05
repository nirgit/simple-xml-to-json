'use strict'

const terser = require('@rollup/plugin-terser')
const commonjs = require('@rollup/plugin-commonjs')

module.exports = {
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
    plugins: [commonjs()]
}
