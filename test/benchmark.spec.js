'use strict'

const { readXMLFile } = require('./testUtils')
const { convertXML } = require('../src/xmlToJson')

describe('transpiler', () => {
    it('Benchmarking the library', () => {
        const xmlInput = readXMLFile(__dirname + '/benchmark-input.xml')
        const start = Date.now()
        const iterations = 1000
        for (let i = 0; i < iterations; i++) {
            convertXML(xmlInput)
        }
        const end = Date.now()
        console.log(
            `avg exec time of ${iterations} iterations (in ms): ${
                (end - start) / iterations
            }`
        )
        expect(end - start).toBeGreaterThan(0)
    })
})
