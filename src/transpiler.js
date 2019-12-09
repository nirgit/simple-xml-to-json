'use strict';

const parseXML = xml => {
    /*
        How does the grammar look?
        | expr: (openBracket + ElementName) + (AttributeList)* + (expr)* + (closeBracket + ElementName + ">")
        | openBracket: <
        | closeBracket: </
        | ElementName: String
        | AttributeList: AttributeName + "=" + AttributeValue + AttributeList*
        | AttributeName: String
        | AttributeValue: String
    */


    return xml
}

const convertAST2Json = ast => ast

function transpile(xmlAsString) {
    const ast = parseXML(xmlAsString)
    return convertAST2Json(ast)
}

module.exports = {
    transpile
}