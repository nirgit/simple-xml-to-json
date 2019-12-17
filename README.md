# A simple XML to JSON converter library
* Note - _this is an *alpha* version. Use at your own discretion_.
[![Build Status](https://travis-ci.org/nirgit/xml-to-json.svg?branch=master)](https://travis-ci.org/nirgit/xml-to-json)

## How this works in a nutshell
1. The library converts the XML to an AST
2. There is a JSON converter that takes the AST and spits out a JSON
3. You can write your own converters if you need XML-to-ANY-OTHER-FORMAT

## API
1. convertXML
2. createAST

Code Example:
```javascript
const {convertXML, createAST} = require("simple-xml-to-json")

const myJson = convertXML(myXMLString)
const myYaml = convertXML(myXMLString, yamlConverter)
const myAst = createAST(myXMLString)
````

## Notes and how to use code
1. The easiest thing to start is to run `node example/example.js` in your terminal and see what happens.
2. There's the xmlToJson.js file for convenience. Just pass in the XML as a String.
3. It's MIT licensed so you can do whatever :)
4. Profit

## Current Drawbacks
1. No support for XSD
2. All values are translated to strings in JSON
3. There are currently reserved words in the JSON converter: 
    * "content" 
    * "children"

    so you cannot by default have an attribute with that name and free text as the content of the element or have nested elements as children.
    
    *If you need to, you can write your own converter from the AST created by the parser, and pass it as a 2nd parameter after the xml string*

## Future plans
1. Split the implementation of this library to XML-TO-AST and AST-TO-JSON to make it more modular
2. Support XSD (maybe :) )

