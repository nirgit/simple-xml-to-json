import { convertXML, createAST } from '../src/xmlToJson.esm.mjs'

describe('ESM entry point', () => {
    it('converts XML to JSON', () => {
        const xml = '<root><item id="1">Hello</item></root>'
        expect(convertXML(xml)).toEqual({
            root: {
                children: [
                    {
                        item: {
                            id: '1',
                            content: 'Hello',
                        },
                    },
                ],
            },
        })
    })

    it('creates an AST', () => {
        const xml = '<root><item>text</item></root>'
        const ast = createAST(xml)
        expect(ast.type).toBe('ROOT')
        expect(ast.value.children).toHaveLength(1)
        expect(ast.value.children[0].value.type).toBe('root')
    })
})
