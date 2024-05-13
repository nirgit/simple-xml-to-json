declare module 'simple-xml-to-json' {
  interface ASTConverter {
    convert: (ast: object) => any;
  }

  export function convertXML(xmlAsString: string, customConverter?: ASTConverter): any;
  
  export function createAST(xmlAsString: string): object;
}
