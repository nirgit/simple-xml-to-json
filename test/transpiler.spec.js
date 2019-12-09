const fs = require('fs')
const xmlToJson = require('../src/transpiler')

const readMockXMLFile = fileName => {
    return fs.readFileSync(fileName, {encoding: 'utf8'})
}

describe('transpiler', () => {
    it('should convert the XML to JSON', () => {
        const mockXML = readMockXMLFile(__dirname + '/mock.xml');
        expect(xmlToJson.transpile(mockXML)).toBe(false)
    })
})
