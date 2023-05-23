import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/xmlToJson.js',
  output: {
    file: 'lib/simpleXmlToJson.min.js',
    format: 'cjs',
    exports: 'auto'
  },
  plugins: [
    commonjs(),
    terser()
  ]
};

