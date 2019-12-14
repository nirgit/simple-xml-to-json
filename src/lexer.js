'use strict'

const {Token, TOKEN_TYPE} = require('./model')
const EOF_TOKEN = Token('EOF')

const isCharBlank = char => char === " " || char === "\n" || char === "\r"

const normalizeXMLForLexer = xmlAsString => {
    let pos = 0
    while (pos < xmlAsString.length && isCharBlank(xmlAsString[pos])) pos++
    xmlAsString = xmlAsString.substr(pos)
    if (xmlAsString.startsWith('<?xml')) {
        xmlAsString = xmlAsString.replace(/<\?xml.*\?>/, '')
    }
    xmlAsString = xmlAsString.replace(/'/g, '"')

    return xmlAsString
}

function createLexer(xmlAsString) {

    xmlAsString = normalizeXMLForLexer(xmlAsString)
    
    let currentToken = null
    let pos = 0

    const peek = () => xmlAsString[pos]
    const hasNext = () => currentToken !== EOF_TOKEN && pos < xmlAsString.length
    const isBlankSpace = () => {
        const char = xmlAsString[pos]
        return isCharBlank(char)
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
        return readAlphaNumericChars(false)
    }

    const readAlphaNumericChars = (isSpaceSupport) => {
        const matcher = isSpaceSupport ? /[a-zA-Z0-9_\s]/ : /[a-zA-Z0-9_]/
        let start = pos
        while (hasNext() && xmlAsString[pos].match(matcher)) pos++
        const buffer = xmlAsString.substring(start, pos)
        return buffer
    }

    const next = () => {
        skipSpaces();
        if (!hasNext()) {
            currentToken = EOF_TOKEN
        } else if (currentToken && currentToken.type === TOKEN_TYPE.OPEN_BRACKET) { // starting new element
            skipSpaces()
            const buffer = readAlphaNumericCharsOrBrackets()
            currentToken = Token(TOKEN_TYPE.ELEMENT_TYPE, buffer)
        } else if (currentToken && currentToken.type === TOKEN_TYPE.ASSIGN) { // assign value to attribute
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
                        if (currentToken.type === TOKEN_TYPE.CLOSE_BRACKET) {
                            let suffix = ''
                            if (peek() !== '<') {
                                suffix = readAlphaNumericChars(true)
                            }
                            currentToken = Token(TOKEN_TYPE.CONTENT, buffer + suffix)
                        } else if (currentToken.type !== TOKEN_TYPE.ATTRIB_NAME) {
                            // it should be a value token
                            currentToken = Token(TOKEN_TYPE.ATTRIB_NAME, buffer)
                        }
                        break;
                    } else {
                        const errMsg = 'Unknown Syntax : "' + buffer + '"'
                        throw new Error(errMsg)
                    }
                }
            }
        }

        return currentToken
    }

    return {
        peek,
        next,
        hasNext
    }
}

module.exports = {
    createLexer
}
