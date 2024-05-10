'use strict'

module.exports = {
    BUILD: {
        COMPTIME: true
    },
    NODE_TYPE: {
        ATTRIBUTE: 'ATTRIBUTE',
        CONTENT: 'CONTENT',
        ELEMENT: 'ELEMENT',
        ROOT: 'ROOT'
    },
    TOKEN_TYPE: {
        OPEN_BRACKET: 'OPEN_BRACKET',
        ELEMENT_TYPE: 'ELEMENT_TYPE',
        CLOSE_ELEMENT: 'CLOSE_ELEMENT',
        ATTRIB_NAME: 'ATTRIB_NAME',
        ATTRIB_VALUE: 'ATTRIB_VALUE',
        ASSIGN: 'ASSIGN',
        CLOSE_BRACKET: 'CLOSE_BRACKET',
        CONTENT: 'CONTENT',
        EOF: 'EOF'
    }
}
