const fs = require('fs')

const {transpile, Node, AttribNode, ElementNode} = require('../src/transpiler')

const readMockXMLFile = fileName => {
    return fs.readFileSync(fileName, {encoding: 'utf8'})
}

describe('transpiler', () => {
    it('should convert a very simple XML to a simple AST', () => {
        const mockXML = '<a></a>'
        const ast = transpile(mockXML)
        expect(ast).toEqual({
            type: "ROOT",
            value: {
                children: [{
                    type: "ELEMENT",
                    value: {
                        type: "a",
                        attributes: [],
                        children: []
                    }
                }]
            }
        })
    })

    it('should convert a simple xml element with attributes to AST', () => {
        const mockXML = '<a p1="v1" p2="v2"></a>'
        const ast = transpile(mockXML)
        expect(ast).toEqual({
            type: "ROOT",
            value: {
                children: [{
                    type: "ELEMENT",
                    value: {
                        type: "a",
                        attributes: [AttribNode('p1', 'v1'), AttribNode('p2', 'v2')],
                        children: []
                    }
                }]
            }
        })
    })

    it('should convert a full XML to JSON', () => {
        const mockXML = `
        <a ap1="av1" ap2="av2">
            <b bp1='bv1'></b>
            <b bp2='bv2'></b>
            <b bp3='bv3'>
                <c cp1='cv1' cp2='cv2'></c>
            </b>
        </a>
        `
        const ast = transpile(mockXML)
        expect(ast).toEqual({
            type: "ROOT",
            value: {
                children: [{
                    type: "ELEMENT",
                    value: {
                        type: "a",
                        attributes: [AttribNode('ap1', 'av1'), AttribNode('ap2', 'av2')],
                        children: [
                            ElementNode('b', [AttribNode('bp1', 'bv1')], []),
                            ElementNode('b', [AttribNode('bp2', 'bv2')], []),
                            ElementNode('b', [AttribNode('bp3', 'bv3')], [{
                                type: "ELEMENT",
                                value: {
                                    type: "c",
                                    attributes: [AttribNode('cp1', 'cv1'), AttribNode('cp2', 'cv2')],
                                    children: []
                                }
                            }])
                        ]
                    }
                }]
            }
        })
    })
})
