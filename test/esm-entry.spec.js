'use strict'

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const { convertXML, createAST } = require('../src/xmlToJson')

describe('ESM entry point', () => {
    it('should only export convertXML and createAST', () => {
        const esmSource = fs.readFileSync(
            path.resolve(__dirname, '../src/xmlToJson.esm.js'),
            'utf8'
        )
        const namedExports = esmSource.match(/export const (\w+)/g)
        expect(namedExports).toHaveLength(2)
        expect(namedExports).toContain('export const convertXML')
        expect(namedExports).toContain('export const createAST')
    })

    it('should import from the CJS module', () => {
        const esmSource = fs.readFileSync(
            path.resolve(__dirname, '../src/xmlToJson.esm.js'),
            'utf8'
        )
        expect(esmSource).toContain("import cjs from './xmlToJson.js'")
        expect(esmSource).toContain('cjs.convertXML')
        expect(esmSource).toContain('cjs.createAST')
    })

    it('should produce the same output as CJS when run as ESM', () => {
        const xml = '<root><item id="1">Hello</item></root>'
        const esmScript = [
            "import { convertXML, createAST } from './src/xmlToJson.esm.js';",
            `console.log(JSON.stringify({ json: convertXML('${xml}'), ast: createAST('${xml}') }));`
        ].join(' ')
        const result = execSync(
            `node --input-type=module -e "${esmScript.replace(/"/g, '\\"')}"`,
            { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' }
        )
        const { json, ast } = JSON.parse(result)
        expect(json).toEqual(convertXML(xml))
        expect(ast).toEqual(createAST(xml))
    })
})
