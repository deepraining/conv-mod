import fse from 'fs-extra';
import { find, replace, generate } from 'abstract-syntax-tree';

const { outputFileSync } = fse;

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

const requireTest = node =>
  (node.type === 'VariableDeclaration' ||
    node.type === 'ExpressionStatement') &&
  !!find(node, requireNode).length;

const moduleExportsTest = node =>
  node.type === 'ExpressionStatement' && !!find(node, moduleExportsNode).length;

const exportsTest = node =>
  node.type === 'ExpressionStatement' && !!find(node, exportsNode).length;

/**
 * Check is CommonJs module or not.
 *
 * @param tree
 * @returns {boolean}
 */
export function checkCjs(tree) {
  const requireStatements = find(tree, requireNode);
  const moduleExportsStatements = find(tree, moduleExportsNode);
  const exportsStatements = find(tree, exportsNode);

  return (
    !!requireStatements.length ||
    !!moduleExportsStatements.length ||
    !!exportsStatements.length
  );
}

export function convertCjs({ file, tree }) {
  replace(tree, {
    enter(node) {
      if (requireTest(node)) {
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
        return {
          type: 'ExportDefaultDeclaration',
          declaration: node.expression.right,
        };
      }

      if (exportsTest(node)) {
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

  outputFileSync(file, generate(tree));
}
