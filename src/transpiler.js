'use strict'

const { TOKEN_TYPE } = require('./constants')
const { createLexer } = require('./lexer')
const { Token } = require('./model')
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

// Frame factory for stack items in parseXML
function Frame(node, scopingElement) {
    return {
        node,
        scopingElement,
        children: node.value.children
    }
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
    const rootNode = Node(ROOT, { children: [] })
    const stack = [
        Frame(rootNode, Token(ROOT, 'ROOT'))
    ]
    let currentFrame = stack[stack.length - 1]
    while (lexer.hasNext()) {
        const lexem = lexer.next()
        switch (lexem.type) {
            case TOKEN_TYPE.OPEN_BRACKET:
                handleOpenBracket(lexer, stack)
                currentFrame = stack[stack.length - 1]
                break
            case TOKEN_TYPE.CLOSE_ELEMENT:
                handleCloseElement(lexem, stack)
                currentFrame = stack[stack.length - 1]
                break
            case TOKEN_TYPE.CONTENT:
                handleContent(lexem, currentFrame)
                break
            case TOKEN_TYPE.EOF:
                handleEOF(stack)
                break
            default:
                throw new Error(
                    `Unknown Lexem type: ${lexem.type} "${lexem.value}, scoping element: ${currentFrame.scopingElement.value}"`
                )
        }
        if (stack.length === 0) break
    }
    return rootNode
}

function handleOpenBracket(lexer, stack) {
    const currentFrame = stack[stack.length - 1]
    const elementLexem = lexer.next()
    const attribs = []
    let currentToken = lexer.peek()
    if (
        !lexer.hasNext() ||
        (currentToken && currentToken.type === TOKEN_TYPE.CLOSE_BRACKET) ||
        (currentToken && currentToken.type === TOKEN_TYPE.CLOSE_ELEMENT)
    ) {
        // No attributes
    } else {
        currentToken = lexer.next()
        while (
            lexer.hasNext() &&
            currentToken &&
            currentToken.type !== TOKEN_TYPE.CLOSE_BRACKET &&
            currentToken.type !== TOKEN_TYPE.CLOSE_ELEMENT
        ) {
            const attribName = currentToken
            lexer.next() // assignment token
            const attribValue = lexer.next()
            attribs.push(AttribNode(attribName.value, attribValue.value))
            currentToken = lexer.next()
        }
    }
    if (currentToken && currentToken.type === TOKEN_TYPE.CLOSE_ELEMENT) {
        currentFrame.children.push(ElementNode(elementLexem.value, attribs, []))
    } else {
        const elementNode = ElementNode(elementLexem.value, attribs, [])
        currentFrame.children.push(elementNode)
        stack.push(Frame(elementNode, elementLexem))
    }
}

function handleCloseElement(lexem, stack) {
    const currentFrame = stack[stack.length - 1]
    if (lexem.value === currentFrame.scopingElement.value) {
        let children = currentFrame.children
        if (
            children &&
            children.length > 0 &&
            children[0].type === TOKEN_TYPE.CONTENT
        ) {
            children = reduceChildrenElements(children)
            currentFrame.node.value.children = children
        }
        stack.pop()
    }
}

function handleContent(lexem, currentFrame) {
    currentFrame.children.push(ContentNode(lexem.value))
}

function handleEOF(stack) {
    stack.length = 1 // force unwind to root
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
    const ast = parseXML(lexer)
    if (astConverter) {
        return astConverter.convert(ast)
    }
    return ast
}

module.exports = {
    AttribNode,
    ContentNode,
    ElementNode,
    Node,
    transpile
}
