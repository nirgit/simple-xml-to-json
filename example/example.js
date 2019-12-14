'use strict'

const fs = require('fs')
const xmlToJson = require('../src/xmlToJson')
const chalk = require('chalk')

const xmlToConvert = fs.readFileSync(__dirname + '/example.xml', {encoding: 'UTF8'})

console.log(chalk.blue('------ XML ------'))
console.log(xmlToConvert)
console.log('\n\n\n')

console.log(chalk.green('------ JSON ------'))
console.log(JSON.stringify(xmlToJson(xmlToConvert), null, 4))
