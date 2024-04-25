'use strict'

const { createAST } = require('./parser')

function convertXML(
    xmlAsString,
    converter = require('./converters/astToJson')
) {
    const ast = createAST(xmlAsString)
    return converter ? converter.convert(ast) : ast
}

module.exports = {
    convertXML
}
