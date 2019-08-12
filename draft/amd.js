const { parse, generate } = require('abstract-syntax-tree');

const source = `
/**
 * comment 1
 */

// comment 2
define(['a', 'b', './c', '../../d/e'], function(a, b, c) {
  // comment 3

  console.log('hello');
  console.log('hehe');
  
  (function() {
    alert('haha');
  })();

  return {a, b, c};

  // comment 4
});

// comment 5
`;

const tree = parse(source);

const { expression } = tree.body[0];
const arrayExpression = expression.arguments.find(
  i => i.type === 'ArrayExpression',
);
const functionExpression = expression.arguments.find(
  i => i.type === 'FunctionExpression',
);
const dependencies = arrayExpression
  ? arrayExpression.elements.map(i => i.value)
  : [];
const dependencyNames = functionExpression.params
  ? functionExpression.params.map(i => i.name)
  : [];
const { body } = functionExpression.body;
const lastBodyBlock = body[body.length - 1];

if (lastBodyBlock.type === 'ReturnStatement') {
  body.pop();
}

const newTree = {
  type: 'Program',
  sourceType: 'module',
  body: [],
};
dependencies.forEach((d, i) => {
  const node = {
    type: 'ImportDeclaration',
    specifiers: [],
    source: {
      type: 'Literal',
      value: d,
    },
  };

  if (dependencyNames[i]) {
    node.specifiers.push({
      type: 'ImportDefaultSpecifier',
      local: {
        type: 'Identifier',
        name: dependencyNames[i],
      },
    });
  }

  newTree.body.push(node);
});

newTree.body.push(...body);

if (lastBodyBlock.type === 'ReturnStatement') {
  newTree.body.push({
    type: 'ExportDefaultDeclaration',
    declaration: {
      type: lastBodyBlock.argument.type,
      properties: lastBodyBlock.argument.properties,
    },
  });
}

console.log(generate(newTree));

// const treeJson = {
//   "type":"Program",
//   "sourceType":"module",
//   "body":[
//     {
//       "type":"ExpressionStatement",
//       "expression":{
//         "type":"CallExpression",
//         "callee":{
//           "type":"Identifier",
//           "name":"define"
//         },
//         "arguments":[
//           {
//             "type":"ArrayExpression",
//             "elements":[
//               {
//                 "type":"Literal",
//                 "value":"a"
//               },
//               {
//                 "type":"Literal",
//                 "value":"b"
//               },
//               {
//                 "type":"Literal",
//                 "value":"./c"
//               },
//               {
//                 "type":"Literal",
//                 "value":"../../d/e"
//               }
//             ]
//           },
//           {
//             "type":"FunctionExpression",
//             "params":[
//               {
//                 "type":"Identifier",
//                 "name":"a"
//               },
//               {
//                 "type":"Identifier",
//                 "name":"b"
//               },
//               {
//                 "type":"Identifier",
//                 "name":"c"
//               }
//             ],
//             "body":{
//               "type":"BlockStatement",
//               "body":[
//                 // Object{...},
//                 {
//                   "type":"ReturnStatement",
//                   "argument":{
//                     "type":"ObjectExpression",
//                     "properties":[
//
//                     ]
//                   }
//                 }
//               ]
//             },
//             "async":false,
//             "generator":false,
//             "expression":false,
//             "id":null
//           }
//         ]
//       }
//     }
//   ]
// };
