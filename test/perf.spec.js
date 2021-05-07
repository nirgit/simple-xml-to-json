'use strict'

const fs = require('fs')
const {createLexer} = require('../src/lexer')
const {transpile} = require('../src/transpiler')

const readXMLFile = fileName => fs.readFileSync(fileName, {encoding: 'utf8'})

const getXMLFileToTest = () => readXMLFile(__dirname + '/perf.xml')

const benchmark = func => {
    let startTime = performance.now()
    func()
    let endTime = performance.now()
    return endTime - startTime
}

const perfTest = (testFunc, cycles) => {
    cycles = cycles || 100
    let totalTime = 0

    for (let i=0; i < cycles; i++) {
        totalTime += benchmark(testFunc)
    }

    return totalTime/cycles
}

describe('perf test suite', () => {
    it('crash test - ensure that the transpiler doesnt blow up on the xml we want to measure perf on', () => {
        const xmlFileToTest = getXMLFileToTest();
        transpile(xmlFileToTest)
    })

    describe('Lexing', () => {
        it('should initialize the lexer in less than 0.01ms', () => {
            const xmlFileToTest = getXMLFileToTest()
            const testFunc = () => createLexer(xmlFileToTest)
            const avgTime = perfTest(testFunc, 10000)
            expect(avgTime).toBeLessThan(0.01)
        })
    })

    describe('parsing', () => {
        it('should parse the XML in less than 10 ms', () => {
            const xmlFileToTest = getXMLFileToTest()
            const testFunc = () => transpile(xmlFileToTest)
            const avgTimeInMs = perfTest(testFunc, 500)
            expect(avgTimeInMs).toBeLessThan(10)
        })
    })
})
