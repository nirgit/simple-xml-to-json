const fs = require('fs')
const xmlToJson = require('../src/transpiler')

const readMockXMLFile = fileName => {
    return fs.readFileSync(fileName, {encoding: 'utf8'})
}

describe.skip('transpiler', () => {
    it('should convert the XML to JSON', () => {
        const mockXML = readMockXMLFile(__dirname + '/mock.xml');
        expect(xmlToJson.transpile(mockXML)).toEqual({
            type: "parent",
            children: [
                {
                    type: "child",
                    name: "Foo"
                },
                {
                    type: "child",
                    name: "Bar",
                    children: [{
                        type: "child",
                        name: "grandson"
                    }]
                }
            ]
        })
    })
})
