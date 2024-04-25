'use strict'

const { BIT, BUILD, CHAR_CODE, TOKEN_TYPE } = require('./constants')
const { Token } = require('./model')

const EOF_TOKEN = Token(/*inline*/ TOKEN_TYPE.EOF, '')

function createLexer(xmlAsString, { knownAttrib, knownElement } = {}) {
    const { length } = xmlAsString
    const scoping = []
    let currScope = 0
    let currToken = EOF_TOKEN
    let currTokenType = TOKEN_TYPE.EOF
    let peekedPos = 0
    let peekedTagName = ''
    let pos = 0

    const getPos = () => pos
    const getScope = () => currScope
    const peek = () => xmlAsString.charCodeAt(pos)
    const hasNext = () => pos < length

    const initializePosForLexer = () => {
        skipSpaces(/*inline*/)
        skipXMLDocumentHeader(/*inline*/)
    }

    const isAssignToAttribute = () => currTokenType === TOKEN_TYPE.ASSIGN

    const isBlank = ($code) =>
        $code === CHAR_CODE.SPACE ||
        $code === CHAR_CODE.NEW_LINE ||
        $code === CHAR_CODE.CARRIAGE_RETURN ||
        $code === CHAR_CODE.TAB

    const isElementBegin = () => currTokenType === TOKEN_TYPE.OPEN_BRACKET

    const isQuote = ($code) =>
        $code === CHAR_CODE.DOUBLE_QUOTE || $code === CHAR_CODE.SINGLE_QUOTE

    const readAlphaNumericAndSpecialChars = () => {
        const start = pos
        while (hasNext(/*inline*/)) {
            const code = peek(/*inline*/)
            // inline /[^>=<]/u.test(xmlAsString[pos])
            if (
                code !== CHAR_CODE.OPEN_BRACKET &&
                code !== CHAR_CODE.EQUAL_SIGN &&
                code !== CHAR_CODE.CLOSE_BRACKET
            ) {
                pos += 1
                continue
            }
            break
        }
        const str = xmlAsString.slice(start, pos)
        return replaceQuotes(str)
    }

    const readBracketsAsBitmask = () => {
        if (hasNext(/*inline*/)) {
            const code = peek(/*inline*/)
            if (code === CHAR_CODE.OPEN_BRACKET) {
                pos += 1
                if (
                    hasNext(/*inline*/) &&
                    peek(/*inline*/) === CHAR_CODE.FORWARD_SLASH
                ) {
                    pos += 1
                    return BIT.OPEN_BRACKET_SLASH
                }
                if (
                    hasNext(/*inline*/) &&
                    peek(/*inline*/) === CHAR_CODE.EXCLAMATION_POINT &&
                    xmlAsString.charCodeAt(pos + 1) === CHAR_CODE.HYPHEN &&
                    xmlAsString.charCodeAt(pos + 2) === CHAR_CODE.HYPHEN
                ) {
                    // its a comment
                    pos += 3
                    return BIT.COMMENT
                }
                return BIT.OPEN_BRACKET
            }
            if (code === CHAR_CODE.FORWARD_SLASH) {
                pos += 1
                if (
                    hasNext(/*inline*/) &&
                    peek(/*inline*/) === CHAR_CODE.CLOSE_BRACKET
                ) {
                    pos += 1
                    return BIT.SLASH_CLOSE_BRACKET
                }
                return BIT.FORWARD_SLASH
            } else if (code === CHAR_CODE.EQUAL_SIGN) {
                pos += 1
                return BIT.EQUAL_SIGN
            } else if (code === CHAR_CODE.CLOSE_BRACKET) {
                pos += 1
                return BIT.CLOSE_BRACKET
            }
        }
        return 0
    }

    const readTagName = () => {
        let start = pos
        while (hasNext(/*inline*/)) {
            const code = peek(/*inline*/)
            // inline /[a-zA-Z0-9_:-]/.test(xmlAsString[pos])
            if (
                (code >= CHAR_CODE.LOWER_A && code <= CHAR_CODE.LOWER_Z) ||
                (code >= CHAR_CODE.UPPER_A && code <= CHAR_CODE.UPPER_Z) ||
                (code >= CHAR_CODE.DIGIT_0 && code <= CHAR_CODE.DIGIT_9) ||
                code === CHAR_CODE.LODASH ||
                code === CHAR_CODE.COLON ||
                code === CHAR_CODE.HYPHEN
            ) {
                pos += 1
                continue
            }
            break
        }
        return xmlAsString.slice(start, pos)
    }

    const replaceQuotes = ($str) => {
        let output = ''
        let fromIndex = 0
        let index = 0
        while ((index = $str.indexOf("'", fromIndex)) !== -1) {
            output = output + $str.slice(fromIndex, index) + '"'
            fromIndex = index + 1
        }
        return fromIndex ? output + $str.slice(fromIndex) : $str
    }

    const skipQuotes = () => {
        if (hasNext(/*inline*/)) {
            const code = peek(/*inline*/)
            if (isQuote(/*inline*/ code)) {
                pos += 1
            }
        }
    }

    const skipSpaces = () => {
        while (hasNext(/*inline*/)) {
            const code = peek(/*inline*/)
            if (isBlank(/*inline*/ code)) {
                pos += 1
                continue
            }
            break
        }
    }

    const skipXMLDocumentHeader = () => {
        // inline xmlAsString.startsWith('<?xml', pos)
        if (
            peek(/*inline*/) === CHAR_CODE.OPEN_BRACKET &&
            xmlAsString.charCodeAt(pos + 1) === CHAR_CODE.QUESTION_MARK &&
            xmlAsString.charCodeAt(pos + 2) === CHAR_CODE.LOWER_X &&
            xmlAsString.charCodeAt(pos + 3) === CHAR_CODE.LOWER_M &&
            xmlAsString.charCodeAt(pos + 4) === CHAR_CODE.LOWER_L
        ) {
            while (hasNext(/*inline*/)) {
                if (peek(/*inline*/) !== CHAR_CODE.QUESTION_MARK) {
                    pos += 1
                } else if (
                    xmlAsString.charCodeAt(pos + 1) === CHAR_CODE.CLOSE_BRACKET
                ) {
                    // skip "?>"
                    pos += 2
                    break
                } else {
                    pos += 1
                }
            }
        }
    }

    const next = () => {
        while (true) {
            const prevPos = pos
            skipSpaces(/*inline*/)
            const numOfSpacesSkipped = pos - prevPos
            if (!(hasNext(/*inline*/))) {
                currToken = EOF_TOKEN
                currTokenType = TOKEN_TYPE.EOF
                return currToken
            }
            if (isElementBegin(/*inline*/)) {
                // starting new element
                const tagName = readTagName()
                currScope = { tagName }
                currTokenType = TOKEN_TYPE.ELEMENT_TYPE
                currToken = Token(/*inline*/ TOKEN_TYPE.ELEMENT_TYPE, tagName)
                scoping.push(currScope)
                return currToken
            } else if (isAssignToAttribute(/*inline*/)) {
                // assign value to attribute
                skipQuotes(/*inline*/)
                let start = pos
                while (hasNext(/*inline*/)) {
                    const code = peek(/*inline*/)
                    if (isQuote(/*inline*/ code)) {
                        break
                    }
                    pos += 1
                }
                currTokenType = TOKEN_TYPE.ATTRIB_VALUE
                const str = xmlAsString.slice(start, pos)
                const buffer = replaceQuotes(str)
                pos += 1
                currToken = Token(/*inline*/ TOKEN_TYPE.ATTRIB_VALUE, buffer)
                return currToken
            } else {
                skipSpaces(/*inline*/)
                switch (readBracketsAsBitmask()) {
                    case BIT.OPEN_BRACKET: {
                        currTokenType = TOKEN_TYPE.OPEN_BRACKET
                        currToken = Token(
                            /*inline*/ TOKEN_TYPE.OPEN_BRACKET,
                            ''
                        )
                        return currToken
                    }
                    case BIT.OPEN_BRACKET_SLASH: {
                        scoping.pop()
                        const start = pos
                        while (peek(/*inline*/) !== CHAR_CODE.CLOSE_BRACKET)
                            pos += 1
                        currScope = scoping[scoping.length - 1]
                        currTokenType = TOKEN_TYPE.CLOSE_ELEMENT
                        currToken = Token(
                            /*inline*/
                            TOKEN_TYPE.CLOSE_ELEMENT,
                            xmlAsString.slice(start, pos)
                        )
                        pos += 1 // skip the ">"
                        return currToken
                    }
                    case BIT.CLOSE_BRACKET: {
                        currTokenType = TOKEN_TYPE.CLOSE_BRACKET
                        currToken = Token(
                            /*inline*/ TOKEN_TYPE.CLOSE_BRACKET,
                            ''
                        )
                        return currToken
                    }
                    case BIT.SLASH_CLOSE_BRACKET: {
                        const { tagName } = scoping.pop()
                        currScope = scoping[scoping.length - 1]
                        currTokenType = TOKEN_TYPE.CLOSE_ELEMENT
                        currToken = Token(
                            /*inline*/
                            TOKEN_TYPE.CLOSE_ELEMENT,
                            tagName
                        )
                        return currToken
                    }
                    case BIT.EQUAL_SIGN: {
                        if (currTokenType === TOKEN_TYPE.ATTRIB_NAME) {
                            currTokenType = TOKEN_TYPE.ASSIGN
                            currToken = Token(/*inline*/ TOKEN_TYPE.ASSIGN, '')
                            return currToken
                        }
                        currTokenType = TOKEN_TYPE.CONTENT
                        currToken = Token(/*inline*/ TOKEN_TYPE.CONTENT, '=')
                        return currToken
                    }
                    case BIT.COMMENT: {
                        // skipComment contents
                        const closingBuff = [
                            CHAR_CODE.EXCLAMATION_POINT,
                            CHAR_CODE.HYPHEN,
                            CHAR_CODE.HYPHEN
                        ]
                        while (
                            hasNext(/*inline*/) &&
                            (closingBuff[2] !== CHAR_CODE.CLOSE_BRACKET ||
                                closingBuff[1] !== CHAR_CODE.HYPHEN ||
                                closingBuff[0] !== CHAR_CODE.HYPHEN)
                        ) {
                            closingBuff.shift()
                            closingBuff.push(peek(/*inline*/))
                            pos += 1
                        }
                        break
                    }
                    default: {
                        const buffer = readAlphaNumericAndSpecialChars()
                        if (buffer.length === 0) {
                            throw new Error(
                                `Unknown Syntax : "${xmlAsString[pos]}"`
                            )
                        }
                        // here we fall if we have alphanumeric string, which can be related to attributes, content or nothing
                        if (currTokenType === TOKEN_TYPE.CLOSE_BRACKET) {
                            currTokenType = TOKEN_TYPE.CONTENT
                            currToken =
                                // prettier-ignore
                                peek(/*inline*/) === CHAR_CODE.OPEN_BRACKET
                                    ? Token(
                                        /*inline*/
                                        TOKEN_TYPE.CONTENT,
                                        buffer
                                    )
                                    : Token(
                                        /*inline*/
                                        TOKEN_TYPE.CONTENT,
                                        buffer +
                                                readAlphaNumericAndSpecialChars()
                                    )
                            return currToken
                        }
                        if (
                            currTokenType !== TOKEN_TYPE.ATTRIB_NAME &&
                            currTokenType !== TOKEN_TYPE.CONTENT
                        ) {
                            if (currTokenType === TOKEN_TYPE.CLOSE_ELEMENT) {
                                // we're assuming this is content, part of unstructured data
                                currTokenType = TOKEN_TYPE.CONTENT
                                currToken = Token(
                                    /*inline*/
                                    TOKEN_TYPE.CONTENT,
                                    ' '.repeat(numOfSpacesSkipped) + buffer
                                )
                                return currToken
                            }
                            // it should be an attribute name token
                            currTokenType = TOKEN_TYPE.ATTRIB_NAME
                            currToken = Token(
                                /*inline*/
                                TOKEN_TYPE.ATTRIB_NAME,
                                buffer
                            )
                            return currToken
                        }
                        currTokenType = TOKEN_TYPE.CONTENT
                        currToken = Token(
                            /*inline*/
                            TOKEN_TYPE.CONTENT,
                            ' '.repeat(numOfSpacesSkipped) + buffer // spaces included as content
                        )
                        return currToken
                    }
                }
            }
        }
    }

    initializePosForLexer(/*inline*/)

    return {
        hasNext,
        next,
        peek,
        pos: getPos,
        scope: getScope,
        // prettier-ignore
        ...(BUILD.COMPTIME
            ? {
                initializePosForLexer,
                isAssignToAttribute,
                isBlank,
                isElementBegin,
                isQuote,
                skipQuotes,
                skipSpaces,
                skipXMLDocumentHeader
            }
            : {})
    }
}

module.exports = {
    createLexer
}
