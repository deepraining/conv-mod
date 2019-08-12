import { generate } from 'abstract-syntax-tree';
import fse from 'fs-extra';

const { outputFileSync } = fse;

/**
 * Check is AMD module or not.
 *
 * @param tree
 * @returns {boolean}
 */
export function checkAmd(tree) {
  if (!tree || !tree.body) return !1;

  const firstBlock = tree.body[0];

  return (
    firstBlock.type === 'ExpressionStatement' &&
    firstBlock.expression.type === 'CallExpression' &&
    firstBlock.expression.callee.type === 'Identifier' &&
    firstBlock.expression.callee.name === 'define'
  );
}

/**
 * Convert AMD file.
 *
 * @param file
 * @param tree
 */
export function convertAmd({ file, tree }) {
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
  const hasReturnStatement = lastBodyBlock.type === 'ReturnStatement';

  if (hasReturnStatement) body.pop();

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

  if (hasReturnStatement) {
    newTree.body.push({
      type: 'ExportDefaultDeclaration',
      declaration: lastBodyBlock.argument,
    });
  }

  outputFileSync(file, generate(newTree));
}
