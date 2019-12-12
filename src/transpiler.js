'use strict';

// AST Node types
const [ROOT, ELEMENT] = ["ROOT", "ELEMENT"]

const Node = (type, value) => ({
    type,
    value
})


const parseXML = xmlAsString => {
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
   const ast = Node(ROOT)

   while (lexer.hasNext()) {
       const lexem = lexer.next()
       switch (lexem.type) {
           case OPEN_BRACKET: {
               const elementLexem = lexer.next()
               const elementAttributes = parseElementAttributes(lexer)
               const elementBody = parseExpr(lexer)
               const closeBracketLexem = lexer.next()
               return Node(ELEMENT, {
                   type: elementLexem.value,
                   attributes: elementAttributes,
                   children: elementBody
               })
           }
           default: {
               throw new Error("Unknown Lexem type: " + lexem.type)
            }
       }
   }

    return ast
}

const convertAST2Json = ast => ast

function transpile(xmlAsString) {
    const ast = parseXML(xmlAsString)
    return convertAST2Json(ast)
}

module.exports = {
    transpile
}
