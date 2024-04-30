'use strict'

const acorn = require('acorn')
const MagicString = require('magic-string')
const replacePlugin = require('@rollup/plugin-replace')
const walk = require('acorn-walk')

const candidates = {
    ...require('../src/lexer').createLexer(''),
    ...require('../src/model'),
    ...require('../src/transpiler')
}
const constants = require('../src/constants')
const inlineCommentRegExp = /\/\*\s*inline\s*\*\//
const inlineInfo = new Map()
const inlineMisses = new Set()

const createAssertNonParamId = (info, paramLookup) => {
    const { name: funcName, body } = info
    return (id) => {
        const { name, start } = id
        if (paramLookup.has(name)) {
            const { lineStart, lineEnd } = getLineInfo(body, start)
            throw new Error(
                `Problem inlining '${name}' in ${funcName}:\n${body.slice(
                    lineStart,
                    lineEnd
                )}\n${' '.repeat(start - lineStart)}^`
            )
        }
    }
}

const createFuncInfo = (funcName) => {
    const func = candidates[funcName]
    if (typeof func !== 'function') return undefined
    const source = `${func}`
    const ast = acorn.parse(source, { ecmaVersion: 'latest' })
    const {
        body: { 0: stmtNode }
    } = ast
    const funcNode = stmtNode.expression ?? stmtNode
    const { body: bodyNode } = funcNode
    const { start: bodyStart } = bodyNode
    const padding = ' '.repeat(bodyStart)
    const magicString = new MagicString(
        padding + source.slice(bodyStart, bodyNode.end)
    )
    replaceInlinableCallExpressions(ast, magicString)
    const info = {
        name: funcName,
        params: funcNode.params.map(getIdent).flat(),
        body: magicString.toString(),
        ast: funcNode
    }
    inlineInfo.set(funcName, info)
    return info
}

const getConstantsReplacements = () => {
    const replacements = {}
    for (const { 0: name, 1: constant } of Object.entries(constants)) {
        if (typeof constant === 'object' && constant !== null) {
            for (const { 0: key, 1: value } of Object.entries(constant)) {
                replacements[`${name}.${key}`] = JSON.stringify(value)
            }
        } else {
            replacements[name] = JSON.stringify(constant)
        }
    }
    return replacements
}

const getIdent = (node) => {
    switch (node.type) {
        case 'ArrayPattern':
            return node.elements.map(getParam)
        case 'AssignmentPattern':
            return node.left.name
        case 'ObjectPattern':
            return node.properties.map(getParam)
        case 'RestElement':
            return node.argument.name
        case 'Identifier':
        default:
            return node.name
    }
}

const getInlineInfo = (funcName) => {
    let info = inlineInfo.get(funcName)
    if (info) return info
    info = createFuncInfo(funcName)
    if (info === undefined) return undefined
    inlineInfo.set(funcName, info)
    return info
}

const getLineInfo = (input, pos) => {
    let line = 1
    let cur = 0
    while (true) {
        const nextBreak = nextLineBreak(input, cur, pos)
        if (nextBreak < 0) {
            return {
                line,
                lineStart: cur,
                lineEnd: nextLineBreak(input, pos),
                col: pos - cur
            }
        }
        line += 1
        cur = nextBreak + 1
    }
}

const nextLineBreak = (input, from, end = input.length) => {
    const { length } = input
    if (length === 0) return -1
    const lastIndex = length - 1
    for (let i = from; i < end; i += 1) {
        if (i === lastIndex) return i
        const code = input.charCodeAt(i)
        if (code === 10 || code === 13 || code === 0x2028 || code === 0x2029) {
            return i < end - 1 && code === 13 && input.charCodeAt(i + 1) === 10
                ? i + 1
                : i
        }
    }
    return -1
}

const paramIdentifierVisitor = (() => {
    const AssignmentExpression = (node, st, c) => {
        // Skip replacing identifiers on the left side of an assignment.
        st.assertNonParamId(node.left)
        c(node.right, st, 'Expression')
    }
    const Identifier = (node, { magicString, paramToArg }) => {
        const arg = paramToArg.get(node.name)
        if (arg) {
            magicString.overwrite(node.start, node.end, arg)
        }
    }
    const Property = (node, st, c) => {
        // Skip shorthand property identifiers.
        if (node.shorthand) return st.assertNonParamId(node.key)
        if (node.computed) c(node.key, st, 'Expression')
        if (node.value) c(node.value, st, 'Expression')
    }
    const VariableDeclarator = (node, st, c) => {
        // Skip replacing local variable declarators.
        st.assertNonParamId(node.id)
        if (node.init) c(node.init, st, 'Expression')
    }
    return {
        AssignmentExpression,
        AssignmentPattern: AssignmentExpression,
        Identifier,
        MethodDefinition: Property,
        Property,
        PropertyDefinition: Property,
        VariableDeclarator
    }
})()

const inlinableCallExpressionReplacer = (match, funcName, args) => {
    const info = getInlineInfo(funcName)
    if (info === undefined) {
        if (!inlineMisses.has(funcName)) {
            inlineMisses.add(funcName)
            console.warn(`inline miss for ${funcName}()`)
        }
        return match
    }
    const magicString = new MagicString(info.body)
    const paramToArg = new Map(info.params.map((p, i) => [p, `${args[i]}`]))
    walk.recursive(
        info.ast.body,
        {
            magicString,
            paramToArg,
            assertNonParamId: createAssertNonParamId(info, paramToArg)
        },
        paramIdentifierVisitor
    )
    const result = magicString.toString()
    const trimmed = result.trim()
    return info.ast.expression ? `(${trimmed})` : trimmed.slice(1, -1)
}

const inlinableCallExpressionVisitor = {
    CallExpression(node, { magicString }) {
        const { arguments: args, start, end } = node
        if (
            inlineCommentRegExp.test(
                magicString.original.slice(
                    start,
                    args.length ? args[0].start : end - 1
                )
            )
        ) {
            magicString.overwrite(
                start,
                end,
                inlinableCallExpressionReplacer(
                    magicString.original.slice(start, end),
                    node.callee.name,
                    args.map((a) => magicString.original.slice(a.start, a.end))
                )
            )
        }
    }
}

const replaceInlinableCallExpressions = (ast, magicString) => {
    walk.simple(ast, inlinableCallExpressionVisitor, null, { magicString })
}

module.exports = [
    {
        name: 'inline',
        transform: (source) => {
            const ast = acorn.parse(source, {
                ecmaVersion: 'latest',
                sourceType: 'module'
            })
            const magicString = new MagicString(source)
            replaceInlinableCallExpressions(ast, magicString)
            return {
                code: magicString.toString(),
                map: magicString.generateMap({ hires: true })
            }
        }
    },
    replacePlugin({
        preventAssignment: false,
        values: getConstantsReplacements()
    })
]
