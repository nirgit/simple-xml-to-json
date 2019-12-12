'use strict'
const lexer = require('../src/lexer')
const {Token, TOKEN_TYPE} = require('../src/model')

describe('Lexer', () => {
    it('Simple lexing', () => {
        const tokenizer = lexer.createLexer("<a></a>")
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.OPEN_BRACKET))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.ELEMENT_TYPE, 'a'))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.CLOSE_BRACKET))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.CLOSE_ELEMENT, 'a'))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.EOF))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.EOF))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.EOF))
    })

    it('Lexing attributes', () => {
        const tokenizer = lexer.createLexer("<a p1='v1' p2='v2'></a>")
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.OPEN_BRACKET))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.ELEMENT_TYPE, 'a'))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.ATTRIB_NAME, 'p1'))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.ASSIGN))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.ATTRIB_VALUE, 'v1'))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.ATTRIB_NAME, 'p2'))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.ASSIGN))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.ATTRIB_VALUE, 'v2'))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.CLOSE_BRACKET))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.CLOSE_ELEMENT, 'a'))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.EOF))
    })

    it('should support nesting', () => {
        const mockXML = `
            <a><b></b></a>
        `
        const tokenizer = lexer.createLexer(mockXML)
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.OPEN_BRACKET))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.ELEMENT_TYPE, 'a'))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.CLOSE_BRACKET))

        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.OPEN_BRACKET))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.ELEMENT_TYPE, 'b'))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.CLOSE_BRACKET))

        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.CLOSE_ELEMENT, 'b'))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.CLOSE_ELEMENT, 'a'))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.EOF))
    })
})
