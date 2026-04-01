# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A lightweight, zero-dependency NPM library that converts XML strings to JSON. Public API exposes two functions: `convertXML(xml, [customConverter])` and `createAST(xml)`.

## Commands

```bash
npm test                                    # run all tests (Jest)
npm test -- test/lexer.spec.js              # run a single test file
npm test -- -t "issue #17"                  # run tests matching a name pattern
npm run lint                                # ESLint on src/ and test/
npm run prettify                            # Prettier on all JS files
npm run build                               # clean + rollup (produces lib/)
npm run validate-lib-health                 # prettify → lint → test (full check)
```

## Architecture

Three-stage pipeline: **Lexer → Transpiler → Converter**

### Lexer (`src/lexer.js`)
Reads XML character-by-character, producing a token stream. `createLexer(xml)` returns `{ next(), peek(), hasNext() }`. Skips XML declarations (`<?xml ?>`) and comments (`<!-- -->`). Token types are defined in `src/constants.js`.

### Transpiler (`src/transpiler.js`)
Recursive descent parser that consumes the token stream and builds an AST. Entry point is `transpile(xml, astConverter)`. AST node constructors (`Node`, `ElementNode`, `AttribNode`, `ContentNode`) live in `src/model.js`.

Grammar:
```
expr: StructuredXML | UnstructuredXML | Content
StructuredXML: <ElementName Attributes*> expr* </ElementName>
UnstructuredXML: Content* expr* Content*
```

### Converter (`src/converters/astToJson.js`)
Walks the AST and produces JSON. Elements become objects keyed by tag name; attributes become properties; text becomes `content`; nested elements go into `children`. Users can supply a custom converter to `convertXML()` for XML-to-any-format.

### Entry point (`src/xmlToJson.js`)
Thin facade that wires the pipeline together and exports the public API.

## Key Design Details

- **`content` attribute collision**: An XML attribute named `content` would clash with the text content property. Since v1.2.3, it is automatically prefixed to `@content` during parsing (in `parseElementAttributes()`).
- **Build-time inlining**: `BUILD.COMPTIME` flag in `constants.js` controls whether lexer internals are exported (dev) or tree-shaken (prod). Rollup's replace plugin sets this to `false` at build time. Functions marked `/* inline */` are inlined by a custom Rollup plugin (`scripts/inline-plugins.js`) when building with `--inline`.
- **All values are strings**: The JSON converter does not attempt type coercion.
- **Reserved property names**: `content` (text content) and `children` (nested elements).

## Code Style

- 4-space indentation, single quotes, no semicolons, no trailing commas (enforced by ESLint + Prettier)
- Unix line endings (LF)
