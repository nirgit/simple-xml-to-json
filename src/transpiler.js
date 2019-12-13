'use strict';

const {createLexer} = require('./lexer')
const {TOKEN_TYPE} = require('./model')
// AST Node types
const [ROOT, ELEMENT, ATTRIBUTE] = ["ROOT", "ELEMENT", "ATTRIBUTE"]

const Node = (type, value) => ({
    type,
    value
})

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


const parseXML = (lexer, xmlAsString) => {
    /*
        How does the grammar look?
        | expr: (openBracket + ElementName) + (AttributeList)* + closeBracket + (expr)* + closeElement
        | openBracket: <
        | closeBracket: >
        | closeElement: </ + ElementName + closeBracket
        | ElementName: String
        | AttributeList: AttributeName + "=" + AttributeValue + AttributeList*
        | AttributeName: String
        | AttributeValue: String
    */
   const rootNode = Node(ROOT, {
       children: parseExpr(lexer)
   })
   return rootNode
}

const parseExpr = (lexer) => {
    const children = []
    while (lexer.hasNext()) {
       const lexem = lexer.next()
       switch (lexem.type) {
           case TOKEN_TYPE.OPEN_BRACKET: {
               const elementLexem = lexer.next()
               const elementAttributes = parseElementAttributes(lexer)
               const elementBody = parseExpr(lexer)
               children.push(ElementNode(
                   elementLexem.value,
                   elementAttributes,
                   elementBody
               ))
               break
           }
           case TOKEN_TYPE.CLOSE_ELEMENT: break
           case TOKEN_TYPE.EOF: return children
           default: {
               throw new Error("Unknown Lexem type: " + lexem.type)
            }
       }
   }
   return children
}

const parseElementAttributes = lexer => {
    const attribs = []
    let currentToken = lexer.peek()
    if (!lexer.hasNext() || currentToken && currentToken.type === TOKEN_TYPE.CLOSE_BRACKET) {
        return attribs
    }
    currentToken = lexer.next()
    while (lexer.hasNext() && currentToken && currentToken.type !== TOKEN_TYPE.CLOSE_BRACKET) {
        const attribName = currentToken
        lexer.next() //assignment
        const attribValue = lexer.next()
        const attributeNode = AttribNode(attribName.value, attribValue.value)
        attribs.push(attributeNode)
        currentToken = lexer.next()
    }
    return attribs
}

const convertAST2Json = ast => ast

function transpile(xmlAsString) {
    const lexer = createLexer(xmlAsString)
    const ast = parseXML(lexer, xmlAsString)
    return convertAST2Json(ast)
}

module.exports = {
    transpile,
    Node,
    ElementNode,
    AttribNode
}
