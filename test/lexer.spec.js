'use strict'
const lexer = require('../src/lexer')
const {Token, TOKEN_TYPE} = require('../src/model')

describe('Lexer', () => {
    it('should do some lexing', () => {
        const tokenizer = lexer.createLexer("<a></a>")
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.OPEN_BRACKET))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.ELEMENT_TYPE, 'a'))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.CLOSE_BRACKET, 'a'))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.EOF))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.EOF))
        expect(tokenizer.next()).toEqual(Token(TOKEN_TYPE.EOF))
    })
})
