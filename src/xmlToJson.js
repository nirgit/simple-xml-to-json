'use strict'

const { createAST } = require('./parser')
const { convertXML } = require('./transpiler')

module.exports = {
    convertXML,
    createAST
}
