const { parse } = require('abstract-syntax-tree');

const source = `
import a from './a';
import {b, c} from './b';
import './c';

console.log(a);
console.log(b);

export {a, b};

export const a = 'a';
export const b = () => 'b';

export default {};

const result = [a, b];

export default result;
`;

const tree = parse(source);

console.log(JSON.stringify(tree));
//
// const treeJson = {
//   "type":"Program",
//   "sourceType":"module",
//   "body":[
//     {
//       "type":"ImportDeclaration",
//       "specifiers":[
//         {
//           "type":"ImportDefaultSpecifier",
//           "local":{
//             "type":"Identifier",
//             "name":"a"
//           }
//         }
//       ],
//       "source":{
//         "type":"Literal",
//         "value":"./a"
//       }
//     },
//     {
//       "type":"ImportDeclaration",
//       "specifiers":[
//         {
//           "type":"ImportSpecifier",
//           "local":{
//             "type":"Identifier",
//             "name":"b"
//           },
//           "imported":{
//             "type":"Identifier",
//             "name":"b"
//           }
//         },
//         {
//           "type":"ImportSpecifier",
//           "local":{
//             "type":"Identifier",
//             "name":"c"
//           },
//           "imported":{
//             "type":"Identifier",
//             "name":"c"
//           }
//         }
//       ],
//       "source":{
//         "type":"Literal",
//         "value":"./b"
//       }
//     },
//     {
//       "type":"ImportDeclaration",
//       "specifiers":[
//
//       ],
//       "source":{
//         "type":"Literal",
//         "value":"./c"
//       }
//     },
//     {
//       "type":"ExpressionStatement",
//       "expression":{
//         "type":"CallExpression",
//         "callee":{
//           "type":"MemberExpression",
//           "object":{
//             "type":"Identifier",
//             "name":"console"
//           },
//           "computed":false,
//           "property":{
//             "type":"Identifier",
//             "name":"log"
//           }
//         },
//         "arguments":[
//           {
//             "type":"Identifier",
//             "name":"a"
//           }
//         ]
//       }
//     },
//     {
//       "type":"ExpressionStatement",
//       "expression":{
//         "type":"CallExpression",
//         "callee":{
//           "type":"MemberExpression",
//           "object":{
//             "type":"Identifier",
//             "name":"console"
//           },
//           "computed":false,
//           "property":{
//             "type":"Identifier",
//             "name":"log"
//           }
//         },
//         "arguments":[
//           {
//             "type":"Identifier",
//             "name":"b"
//           }
//         ]
//       }
//     },
//     {
//       "type":"ExportNamedDeclaration",
//       "source":null,
//       "specifiers":[
//         {
//           "type":"ExportSpecifier",
//           "local":{
//             "type":"Identifier",
//             "name":"a"
//           },
//           "exported":{
//             "type":"Identifier",
//             "name":"a"
//           }
//         },
//         {
//           "type":"ExportSpecifier",
//           "local":{
//             "type":"Identifier",
//             "name":"b"
//           },
//           "exported":{
//             "type":"Identifier",
//             "name":"b"
//           }
//         }
//       ],
//       "declaration":null
//     },
//     {
//       "type":"ExportNamedDeclaration",
//       "source":null,
//       "specifiers":[
//
//       ],
//       "declaration":{
//         "type":"VariableDeclaration",
//         "kind":"const",
//         "declarations":[
//           {
//             "type":"VariableDeclarator",
//             "init":{
//               "type":"Literal",
//               "value":"a"
//             },
//             "id":{
//               "type":"Identifier",
//               "name":"a"
//             }
//           }
//         ]
//       }
//     },
//     {
//       "type":"ExportNamedDeclaration",
//       "source":null,
//       "specifiers":[
//
//       ],
//       "declaration":{
//         "type":"VariableDeclaration",
//         "kind":"const",
//         "declarations":[
//           {
//             "type":"VariableDeclarator",
//             "init":{
//               "type":"ArrowFunctionExpression",
//               "body":{
//                 "type":"Literal",
//                 "value":"b"
//               },
//               "params":[
//
//               ],
//               "id":null,
//               "async":false,
//               "generator":false,
//               "expression":true
//             },
//             "id":{
//               "type":"Identifier",
//               "name":"b"
//             }
//           }
//         ]
//       }
//     },
//     {
//       "type":"ExportDefaultDeclaration",
//       "declaration":{
//         "type":"ObjectExpression",
//         "properties":[
//
//         ]
//       }
//     },
//     {
//       "type":"VariableDeclaration",
//       "kind":"const",
//       "declarations":[
//         {
//           "type":"VariableDeclarator",
//           "init":{
//             "type":"ArrayExpression",
//             "elements":[
//               {
//                 "type":"Identifier",
//                 "name":"a"
//               },
//               {
//                 "type":"Identifier",
//                 "name":"b"
//               }
//             ]
//           },
//           "id":{
//             "type":"Identifier",
//             "name":"result"
//           }
//         }
//       ]
//     },
//     {
//       "type":"ExportDefaultDeclaration",
//       "declaration":{
//         "type":"Identifier",
//         "name":"result"
//       }
//     }
//   ]
// };
