/**
 * Currently cant convert:
 *
 * const a = require('a').default;
 * const {a, b} = require('a');
 * const a, {b, c} = require('a');
 */

const { parse, find, replace, generate } = require('abstract-syntax-tree');

const source = `

const a = require('a');
var b = require('b');

import b from 'b';

let c = require('./c');
require('../../d/e');

import '../../d/f';

module.exports = { a1, a2, b };

console.log('hello');

module.exports = {};


exports.c = 'c';

exports.d = 'd';

exports.e = {a: 1, b: 2, c: 3};

exports.f = function () {
  return 'f';
};


`;

const tree = parse(source);

// console.log(JSON.stringify(tree));

// require() statement
const requireNode = {
  type: 'CallExpression',
  callee: {
    type: 'Identifier',
    name: 'require',
  },
};

// module.exports statement
const moduleExportsNode = {
  type: 'AssignmentExpression',
  left: {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: 'module',
    },
    property: {
      type: 'Identifier',
      name: 'exports',
    },
  },
};

// exports.property statement
const exportsNode = {
  type: 'AssignmentExpression',
  left: {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: 'exports',
    },
    property: {
      type: 'Identifier',
    },
  },
};

// console.log(find(tree, requireNode));
//
// console.log(find(tree, moduleExportsNode));
//
// console.log(find(tree, exportsNode));

const requireTest = node =>
  (node.type === 'VariableDeclaration' ||
    node.type === 'ExpressionStatement') &&
  !!find(node, requireNode).length;

const moduleExportsTest = node =>
  node.type === 'ExpressionStatement' && !!find(node, moduleExportsNode).length;

const exportsTest = node =>
  node.type === 'ExpressionStatement' && !!find(node, exportsNode).length;

let requireCount = 0;
let moduleExportsCount = 0;
let exportsCount = 0;

replace(tree, {
  enter(node) {
    if (requireTest(node)) {
      requireCount += 1;

      if (node.type === 'ExpressionStatement') {
        return {
          type: 'ImportDeclaration',
          specifiers: [],
          source: {
            type: 'Literal',
            value: node.expression.arguments[0].value,
          },
        };
      }

      return {
        type: 'ImportDeclaration',
        specifiers: [
          {
            type: 'ImportDefaultSpecifier',
            local: node.declarations[0].id,
          },
        ],
        source: {
          type: 'Literal',
          value: node.declarations[0].init.arguments[0].value,
        },
      };
    }
    if (moduleExportsTest(node)) {
      moduleExportsCount += 1;

      return {
        type: 'ExportDefaultDeclaration',
        declaration: node.expression.right,
      };
    }
    if (exportsTest(node)) {
      exportsCount += 1;

      return {
        type: 'ExportNamedDeclaration',
        source: null,
        specifiers: [],
        declaration: {
          type: 'VariableDeclaration',
          kind: 'const',
          declarations: [
            {
              type: 'VariableDeclarator',
              init: node.expression.right,
              id: {
                type: 'Identifier',
                name: node.expression.left.property.name,
              },
            },
          ],
        },
      };
    }

    return node;
  },
});

console.log(generate(tree));

console.log(requireCount);
console.log(moduleExportsCount);
console.log(exportsCount);

// const treeJson = {
//   "type":"Program",
//   "sourceType":"module",
//   "body":[
//     {
//       "type":"VariableDeclaration",
//       "kind":"const",
//       "declarations":[
//         {
//           "type":"VariableDeclarator",
//           "init":{
//             "type":"CallExpression",
//             "callee":{
//               "type":"Identifier",
//               "name":"require"
//             },
//             "arguments":[
//               {
//                 "type":"Literal",
//                 "value":"a"
//               }
//             ]
//           },
//           "id":{
//             "type":"Identifier",
//             "name":"a"
//           }
//         }
//       ]
//     },
//     {
//       "type":"VariableDeclaration",
//       "kind":"var",
//       "declarations":[
//         {
//           "type":"VariableDeclarator",
//           "init":{
//             "type":"CallExpression",
//             "callee":{
//               "type":"Identifier",
//               "name":"require"
//             },
//             "arguments":[
//               {
//                 "type":"Literal",
//                 "value":"b"
//               }
//             ]
//           },
//           "id":{
//             "type":"Identifier",
//             "name":"b"
//           }
//         }
//       ]
//     },
//     {
//       "type":"ImportDeclaration",
//       "specifiers":[
//         {
//           "type":"ImportDefaultSpecifier",
//           "local":{
//             "type":"Identifier",
//             "name":"b"
//           }
//         }
//       ],
//       "source":{
//         "type":"Literal",
//         "value":"b"
//       }
//     },
//     {
//       "type":"VariableDeclaration",
//       "kind":"let",
//       "declarations":[
//         {
//           "type":"VariableDeclarator",
//           "init":{
//             "type":"CallExpression",
//             "callee":{
//               "type":"Identifier",
//               "name":"require"
//             },
//             "arguments":[
//               {
//                 "type":"Literal",
//                 "value":"./c"
//               }
//             ]
//           },
//           "id":{
//             "type":"Identifier",
//             "name":"c"
//           }
//         }
//       ]
//     },
//     {
//       "type":"ExpressionStatement",
//       "expression":{
//         "type":"CallExpression",
//         "callee":{
//           "type":"Identifier",
//           "name":"require"
//         },
//         "arguments":[
//           {
//             "type":"Literal",
//             "value":"../../d/e"
//           }
//         ]
//       }
//     },
//     {
//       "type":"ImportDeclaration",
//       "specifiers":[
//
//       ],
//       "source":{
//         "type":"Literal",
//         "value":"../../d/f"
//       }
//     },
//     {
//       "type":"VariableDeclaration",
//       "kind":"const",
//       "declarations":[
//         {
//           "type":"VariableDeclarator",
//           "init":{
//             "type":"CallExpression",
//             "callee":{
//               "type":"Identifier",
//               "name":"require"
//             },
//             "arguments":[
//               {
//                 "type":"Literal",
//                 "value":"./a"
//               }
//             ]
//           },
//           "id":{
//             "type":"ObjectPattern",
//             "properties":[
//               {
//                 "type":"Property",
//                 "kind":"init",
//                 "key":{
//                   "type":"Identifier",
//                   "name":"a1"
//                 },
//                 "computed":false,
//                 "value":{
//                   "type":"Identifier",
//                   "name":"a1"
//                 },
//                 "method":false,
//                 "shorthand":true
//               },
//               {
//                 "type":"Property",
//                 "kind":"init",
//                 "key":{
//                   "type":"Identifier",
//                   "name":"a2"
//                 },
//                 "computed":false,
//                 "value":{
//                   "type":"Identifier",
//                   "name":"a2"
//                 },
//                 "method":false,
//                 "shorthand":true
//               }
//             ]
//           }
//         }
//       ]
//     },
//     {
//       "type":"VariableDeclaration",
//       "kind":"const",
//       "declarations":[
//         {
//           "type":"VariableDeclarator",
//           "init":{
//             "type":"MemberExpression",
//             "object":{
//               "type":"CallExpression",
//               "callee":{
//                 "type":"Identifier",
//                 "name":"require"
//               },
//               "arguments":[
//                 {
//                   "type":"Literal",
//                   "value":"./b"
//                 }
//               ]
//             },
//             "computed":false,
//             "property":{
//               "type":"Identifier",
//               "name":"default"
//             }
//           },
//           "id":{
//             "type":"Identifier",
//             "name":"b"
//           }
//         }
//       ]
//     },
//     {
//       "type":"ExpressionStatement",
//       "expression":{
//         "type":"AssignmentExpression",
//         "left":{
//           "type":"MemberExpression",
//           "object":{
//             "type":"Identifier",
//             "name":"module"
//           },
//           "computed":false,
//           "property":{
//             "type":"Identifier",
//             "name":"exports"
//           }
//         },
//         "operator":"=",
//         "right":{
//           "type":"ObjectExpression",
//           "properties":[
//             {
//               "type":"Property",
//               "key":{
//                 "type":"Identifier",
//                 "name":"a1"
//               },
//               "value":{
//                 "type":"Identifier",
//                 "name":"a1"
//               },
//               "kind":"init",
//               "computed":false,
//               "method":false,
//               "shorthand":true
//             },
//             {
//               "type":"Property",
//               "key":{
//                 "type":"Identifier",
//                 "name":"a2"
//               },
//               "value":{
//                 "type":"Identifier",
//                 "name":"a2"
//               },
//               "kind":"init",
//               "computed":false,
//               "method":false,
//               "shorthand":true
//             },
//             {
//               "type":"Property",
//               "key":{
//                 "type":"Identifier",
//                 "name":"b"
//               },
//               "value":{
//                 "type":"Identifier",
//                 "name":"b"
//               },
//               "kind":"init",
//               "computed":false,
//               "method":false,
//               "shorthand":true
//             }
//           ]
//         }
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
//             "type":"Literal",
//             "value":"hello"
//           }
//         ]
//       }
//     },
//     {
//       "type":"ExpressionStatement",
//       "expression":{
//         "type":"AssignmentExpression",
//         "left":{
//           "type":"MemberExpression",
//           "object":{
//             "type":"Identifier",
//             "name":"module"
//           },
//           "computed":false,
//           "property":{
//             "type":"Identifier",
//             "name":"exports"
//           }
//         },
//         "operator":"=",
//         "right":{
//           "type":"ObjectExpression",
//           "properties":[
//
//           ]
//         }
//       }
//     },
//     {
//       "type":"ExpressionStatement",
//       "expression":{
//         "type":"AssignmentExpression",
//         "left":{
//           "type":"MemberExpression",
//           "object":{
//             "type":"Identifier",
//             "name":"exports"
//           },
//           "computed":false,
//           "property":{
//             "type":"Identifier",
//             "name":"c"
//           }
//         },
//         "operator":"=",
//         "right":{
//           "type":"Literal",
//           "value":"c"
//         }
//       }
//     },
//     {
//       "type":"ExpressionStatement",
//       "expression":{
//         "type":"AssignmentExpression",
//         "left":{
//           "type":"MemberExpression",
//           "object":{
//             "type":"Identifier",
//             "name":"exports"
//           },
//           "computed":false,
//           "property":{
//             "type":"Identifier",
//             "name":"d"
//           }
//         },
//         "operator":"=",
//         "right":{
//           "type":"Literal",
//           "value":"d"
//         }
//       }
//     },
//     {
//       "type":"ExpressionStatement",
//       "expression":{
//         "type":"AssignmentExpression",
//         "left":{
//           "type":"MemberExpression",
//           "object":{
//             "type":"Identifier",
//             "name":"exports"
//           },
//           "computed":false,
//           "property":{
//             "type":"Identifier",
//             "name":"e"
//           }
//         },
//         "operator":"=",
//         "right":{
//           "type":"ObjectExpression",
//           "properties":[
//             {
//               "type":"Property",
//               "key":{
//                 "type":"Identifier",
//                 "name":"a"
//               },
//               "value":{
//                 "type":"Literal",
//                 "value":1
//               },
//               "kind":"init",
//               "computed":false,
//               "method":false,
//               "shorthand":false
//             },
//             {
//               "type":"Property",
//               "key":{
//                 "type":"Identifier",
//                 "name":"b"
//               },
//               "value":{
//                 "type":"Literal",
//                 "value":2
//               },
//               "kind":"init",
//               "computed":false,
//               "method":false,
//               "shorthand":false
//             },
//             {
//               "type":"Property",
//               "key":{
//                 "type":"Identifier",
//                 "name":"c"
//               },
//               "value":{
//                 "type":"Literal",
//                 "value":3
//               },
//               "kind":"init",
//               "computed":false,
//               "method":false,
//               "shorthand":false
//             }
//           ]
//         }
//       }
//     },
//     {
//       "type":"ExpressionStatement",
//       "expression":{
//         "type":"AssignmentExpression",
//         "left":{
//           "type":"MemberExpression",
//           "object":{
//             "type":"Identifier",
//             "name":"exports"
//           },
//           "computed":false,
//           "property":{
//             "type":"Identifier",
//             "name":"f"
//           }
//         },
//         "operator":"=",
//         "right":{
//           "type":"FunctionExpression",
//           "params":[
//
//           ],
//           "body":{
//             "type":"BlockStatement",
//             "body":[
//               {
//                 "type":"ReturnStatement",
//                 "argument":{
//                   "type":"Literal",
//                   "value":"f"
//                 }
//               }
//             ]
//           },
//           "async":false,
//           "generator":false,
//           "expression":false,
//           "id":null
//         }
//       }
//     }
//   ]
// };
