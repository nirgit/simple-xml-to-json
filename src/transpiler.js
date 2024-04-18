'use strict'

const { createLexer } = require('./lexer')
const { Token, TOKEN_TYPE } = require('./model')
// AST Node types
const [ROOT, ELEMENT, ATTRIBUTE, CONTENT] = [
    'ROOT',
    'ELEMENT',
    'ATTRIBUTE',
    'CONTENT'
]

const Node = (type, value) => ({
    type,
    value
})

const ContentNode = (value) => Node(CONTENT, value)

const ElementNode = (type, attributes, children) => {
    return Node(ELEMENT, {
        type,
        attributes,
        children
    })
}

const AttribNode = (name, value) => {
    return Node(ATTRIBUTE, {
        name,
        value
    })
}

const parseXML = (lexer) => {
    /*
    How does the grammar look?
    | expr: StructuredXML | UnstructuredXML | Content
    | StructuredXML: (openBracket + ElementName) + (AttributeList)* + closeBracket + (expr)* + closeElement
    | UnstructuredXML: Content* + expr* + Content*
    | Content: String
    | openBracket: <
    | closeBracket: >
    | closeElement: </ + ElementName + closeBracket
    | ElementName: String
    | AttributeList: AttributeName + "=" + AttributeValue + AttributeList*
    | AttributeName: String
    | AttributeValue: String
    */
    const rootNode = Node(ROOT, {
        children: parseExpr(lexer, Token(ROOT, 'ROOT'))
    })
    return rootNode
}

const parseExpr = (lexer, scopingElement) => {
    const children = []
    while (lexer.hasNext()) {
        const lexem = lexer.next()
        switch (lexem.type) {
            case TOKEN_TYPE.OPEN_BRACKET: {
                const elementLexem = lexer.next()
                const [elementAttributes, currentToken] =
                    parseElementAttributes(lexer)
                let elementChildren = []
                if (currentToken.type !== TOKEN_TYPE.CLOSE_ELEMENT) {
                    elementChildren = parseExpr(lexer, elementLexem)
                }
                if (
                    elementChildren &&
                    elementChildren.length > 0 &&
                    elementChildren[0].type === TOKEN_TYPE.CONTENT
                ) {
                    elementChildren = reduceChildrenElements(elementChildren)
                }
                children.push(
                    ElementNode(
                        elementLexem.value,
                        elementAttributes,
                        elementChildren
                    )
                )
                break
            }
            case TOKEN_TYPE.CLOSE_ELEMENT: {
                if (lexem.value === scopingElement.value) return children
                break
            }
            case TOKEN_TYPE.CONTENT: {
                children.push(ContentNode(lexem.value))
                break
            }
            case TOKEN_TYPE.EOF: {
                return children
            }
            default: {
                throw new Error(
                    `Unknown Lexem type: ${lexem.type} "${lexem.value}, scoping element: ${scopingElement.value}"`
                )
            }
        }
    }
    return children
}

const parseElementAttributes = (lexer) => {
    const attribs = []
    let currentToken = lexer.peek()
    if (
        !lexer.hasNext() ||
        (currentToken && currentToken.type === TOKEN_TYPE.CLOSE_BRACKET) ||
        (currentToken && currentToken.type === TOKEN_TYPE.CLOSE_ELEMENT)
    ) {
        return [attribs, currentToken]
    }
    currentToken = lexer.next()
    while (
        lexer.hasNext() &&
        currentToken &&
        currentToken.type !== TOKEN_TYPE.CLOSE_BRACKET &&
        currentToken.type !== TOKEN_TYPE.CLOSE_ELEMENT
    ) {
        const attribName = currentToken
        lexer.next() //assignment token
        const attribValue = lexer.next()
        const attributeNode = AttribNode(attribName.value, attribValue.value)
        attribs.push(attributeNode)
        currentToken = lexer.next()
    }
    return [attribs, currentToken]
}

function reduceChildrenElements(elementChildren) {
    let reduced = [],
        buffer = ''

    elementChildren.forEach((child) => {
        if (child.type === TOKEN_TYPE.CONTENT) {
            buffer += child.value
        } else {
            if (buffer.length) {
                reduced.push(ContentNode(buffer))
                buffer = ''
            }
            reduced.push(child)
        }
    })

    if (buffer.length) reduced.push(ContentNode(buffer))

    return reduced
}

function transpile(xmlAsString, astConverter) {
    const lexer = createLexer(xmlAsString)
    const ast = parseXML(lexer, xmlAsString)
    if (astConverter) {
        return astConverter.convert(ast)
    }
    return ast
}

module.exports = {
    transpile,
    Node,
    ElementNode,
    AttribNode
}
