'use strict'

const jsonConverter = require('./converters/astToJson')
const {transpile} = require('./transpiler')

function run(xmlAsString, converter) {
    return transpile(xmlAsString, converter || jsonConverter)
}

module.exports = run
