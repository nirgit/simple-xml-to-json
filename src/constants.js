'use strict'

module.exports = {
    BIT: {
        FORWARD_SLASH: 1,
        OPEN_BRACKET: 2,
        CLOSE_BRACKET: 4,
        EQUAL_SIGN: 8,
        COMMENT: 16,
        OPEN_BRACKET_SLASH: 3 /*BIT.OPEN_BRACKET | BIT.FORWARD_SLASH*/,
        SLASH_CLOSE_BRACKET: 5 /*BIT.FORWARD_SLASH | BIT.CLOSE_BRACKET*/
    },
    BUILD: {
        COMPTIME: true
    },
    CHAR_CODE: {
        CARRIAGE_RETURN: 13,
        CLOSE_BRACKET: 62,
        COLON: 58,
        DIGIT_0: 48,
        DIGIT_9: 57,
        DOUBLE_QUOTE: 34,
        EQUAL_SIGN: 61,
        EXCLAMATION_POINT: 33,
        FORWARD_SLASH: 47,
        HYPHEN: 45,
        LODASH: 95,
        LOWER_A: 97,
        LOWER_L: 108,
        LOWER_M: 109,
        LOWER_X: 120,
        LOWER_Z: 122,
        NEW_LINE: 10,
        OPEN_BRACKET: 60,
        QUESTION_MARK: 63,
        SINGLE_QUOTE: 39,
        SPACE: 32,
        TAB: 9,
        UPPER_A: 65,
        UPPER_Z: 90
    },
    NODE_TYPE: {
        ATTRIBUTE: 'ATTRIBUTE',
        CONTENT: 'CONTENT',
        ELEMENT: 'ELEMENT',
        ROOT: 'ROOT'
    },
    QUEUE: {
        // Preallocate queues to avoid growing them.
        // Feel free to experiment with this size.
        PREALLOCATE_SIZE: 1000
    },
    TOKEN_TYPE: {
        OPEN_BRACKET: 1,
        ELEMENT_TYPE: 2,
        ATTRIB_NAME: 3,
        ATTRIB_VALUE: 4,
        ASSIGN: 5,
        CONTENT: 6,
        CLOSE_BRACKET: 7,
        CLOSE_ELEMENT: 8,
        EOF: 9
    }
}
