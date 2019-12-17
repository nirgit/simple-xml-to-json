'use strict'

const fs = require('fs')
const {convertXML} = require('../src/xmlToJson')
const chalk = require('chalk')

const xmlToConvert = fs.readFileSync(__dirname + '/example.xml', {encoding: 'UTF8'})

console.log(chalk.blue('------ XML ------'))
console.log(xmlToConvert)
console.log('\n\n\n')

console.log(chalk.green('------ JSON ------'))
console.log(JSON.stringify(convertXML(xmlToConvert), null, 4))
