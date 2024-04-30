'use strict'

const { NODE_TYPE } = require('../constants')

const convertToJSON = ast => {
    return buildJSONFromNode(ast.value.children[0])
}

const buildJSONFromNode = node => {
    if (!node) return null
    const json = {}
    switch (node.type) {
        case NODE_TYPE.ELEMENT: {
            let element = {}
            const attribs = buildAttributes(node.value.attributes)
            const children = buildJSONFromNode(node.value.children)
            if (attribs) {
                element = Object.assign(element, attribs)
            }
            if (children) {
                const jsonChildren = buildChildren(node.value.children)
                element = Object.assign(element, jsonChildren)
            }
            json[node.value.type] = element
            break
        }
        case NODE_TYPE.ATTRIBUTE: {
            const attribNameAndValue = node.value
            json[attribNameAndValue.name] = attribNameAndValue.value
            break
        }
        case NODE_TYPE.CONTENT: {
            return {content: node.value}
        }
        default: {
            break
        }
    }

    return json
}

const buildChildren = children => {
    if (!children || !Array.isArray(children) || children.length === 0) return null
    if (isContentChildren(children)) {
        return {
            content: children[0].value
        }
    }
    return {
        children: children.map(buildJSONFromNode)
    }
}

const isContentChildren = children => children && Array.isArray(children) && children.length === 1 && children[0].type === NODE_TYPE.CONTENT

const buildAttributes = arrayNodes => {
    if (arrayNodes && Array.isArray(arrayNodes)) {
        const jsonArray = arrayNodes.map(buildJSONFromNode)
        return jsonArray.reduce((agg, j) => Object.assign(agg, j), {})
    }
    return null
}

module.exports = {
    convert: convertToJSON
}
