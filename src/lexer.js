'use strict'

const {Token, TOKEN_TYPE} = require('./model')

function createLexer(xmlAsString) {

    xmlAsString = xmlAsString.replace(/'/g, '"')
    let currentToken = null
    let pos = 0
    let row = 0

    const current = () => currentToken
    const hasNext = () => pos < xmlAsString.length
    const isBlankSpace = () => {
        const char = xmlAsString[pos]
        return char === " " || char === "\n" || char === "\r"
    }

    const skipQuotes = () => {
        if (hasNext() && xmlAsString[pos] === '"') pos++
    }
    const skipSpaces = () => {
        while (hasNext() && isBlankSpace()) pos++
    }

    const readAlphaNumericCharsOrBrackets = () => {
        if (hasNext()) {
            if (xmlAsString[pos] === '<') {
                let buffer = '<'
                pos++
                if (hasNext() && xmlAsString[pos] === '/') {
                    pos++
                    buffer += '/'
                }
                return buffer
            } else if (xmlAsString[pos] === '=' || xmlAsString[pos] === '>') {
                const buffer = xmlAsString[pos]
                pos++
                return buffer
            }
        }
        let start = pos
        while (hasNext() && xmlAsString[pos].match(/[a-zA-Z0-9]/)) pos++
        const buffer = xmlAsString.substring(start, pos)
        return buffer
    }

    const next = () => {
        skipSpaces();
        if (!hasNext()) {
            currentToken = Token('EOF')
        } else if (currentToken && currentToken.type === TOKEN_TYPE.OPEN_BRACKET) {
            skipSpaces()
            const buffer = readAlphaNumericCharsOrBrackets()
            currentToken = Token(TOKEN_TYPE.ELEMENT_TYPE, buffer)
        } else if (currentToken && currentToken.type === TOKEN_TYPE.ASSIGN) {
            skipQuotes()
            let start = pos
            while (hasNext() && xmlAsString[pos] !== '"') pos++
            const buffer = xmlAsString.substring(start, pos)
            pos++
            currentToken = Token(TOKEN_TYPE.ATTRIB_VALUE, buffer)
        } else {
            skipSpaces()
            const buffer = readAlphaNumericCharsOrBrackets()
            switch (buffer) {
                case "=": {
                    currentToken = Token(TOKEN_TYPE.ASSIGN)
                    break;
                }
                case "</": {
                    const start = pos
                    while (xmlAsString[pos] !== ">") pos++
                    currentToken = Token(TOKEN_TYPE.CLOSE_ELEMENT, xmlAsString.substring(start, pos))
                    pos++ // skip the ">"
                    break;
                }
                case ">": {
                    currentToken = Token(TOKEN_TYPE.CLOSE_BRACKET)
                    break
                }
                case "<": {
                    currentToken = Token(TOKEN_TYPE.OPEN_BRACKET)
                    break;
                }
                default: { // here we fall if we have alphanumeric string, which can be related to attributes or nothing
                    if (buffer && buffer.length > 0) {
                        if (currentToken.type !== TOKEN_TYPE.ATTRIB_NAME) {
                            // it should be a value token
                            currentToken = Token(TOKEN_TYPE.ATTRIB_NAME, buffer)
                        }
                        break;
                    } else {
                        // const errMsg = 'Unknown Syntax at position: ' + pos + " | " + xmlAsString.substr(pos, 3) + "..."
                        const errMsg = 'Unknown Syntax : "' + buffer + '"'
                        throw new Error(errMsg)
                    }
                }
            }
        }

        return currentToken
    }

    return {
        current,
        next,
        hasNext
    }
}

module.exports = {
    createLexer
}
