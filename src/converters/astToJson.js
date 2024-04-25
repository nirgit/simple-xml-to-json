'use strict'

const { QUEUE, NODE_TYPE } = require('../constants')

const convertToJSON = ast => {
    const root = ast.value.children[0]
    if (typeof root !== 'object' || root === null) {
        return null
    }
    const json = {}
    // Use a queue to avoid call stack limits.
    const queue = Array(QUEUE.PREALLOCATE_SIZE)
    queue[0] = [root, json, -1]
    let queueLength = 1
    let pos = 0
    while (pos < queueLength) {
        const {
            0: {
                value: { attributes, children, type: key }
            },
            1: parent,
            2: parentArrayIndex
        } = queue[pos++]
        const parentIsArray = parentArrayIndex !== -1
        const object = {}
        if (parentIsArray) {
            parent[parentArrayIndex] = { [key]: object }
        } else {
            parent[key] = object
        }
        for (let i = 0, { length } = attributes; i < length; i += 1) {
            const {
                value: { name: attrName, value: attrValue }
            } = attributes[i]
            object[attrName] = attrValue
        }
        const { length: childrenLength } = children
        if (!childrenLength) {
            continue
        }
        if (childrenLength === 1 && children[0].type === NODE_TYPE.CONTENT) {
            object.content = children[0].value
            continue
        }
        const childObjects = Array(childrenLength)
        object.children = childObjects
        for (let i = 0; i < childrenLength; i += 1) {
            const childNode = children[i]
            if (childNode.type === NODE_TYPE.CONTENT) {
                childObjects[i] = { content: childNode.value }
            } else {
                queue[queueLength++] = [childNode, childObjects, i]
            }
        }
    }
    return json
}

module.exports = {
    convert: convertToJSON
}
