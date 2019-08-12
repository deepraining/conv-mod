import path from 'path';
import rd from 'rd';
import commander from 'commander';
import inquirer from 'inquirer';
import { parse, generate } from 'abstract-syntax-tree';
import fse from 'fs-extra';
import { correctSlash } from './util';
import { info, log, success } from './logger';

import pkg from '../package.json';

const { join, relative } = path;
const { eachFileFilterSync } = rd;
const { prompt } = inquirer;
const { readFileSync, outputFileSync } = fse;

const cwd = process.cwd();

/**
 * Get files.
 *
 * @param dirPath
 * @param filter
 * @param regular
 * @returns {Array}
 */
function getFiles({ dirPath, filter, regular }) {
  const files = [];
  const filterRegExp = new RegExp(filter);
  eachFileFilterSync(dirPath, /\.js$/, f => {
    const file = correctSlash(f);
    if (!filter) {
      files.push(file);
      return;
    }

    if (!regular) {
      if (file.indexOf(filter) > -1) files.push(file);
      return;
    }

    if (filterRegExp.test(file)) files.push(file);
  });
  return files;
}

/**
 * Check is AMD module or not.
 *
 * @param tree
 * @returns {boolean}
 */
function checkAmd(tree) {
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
 * @param shortFile
 * @param tree
 */
function convertAmd({ file, shortFile, tree }) {
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
      declaration: {
        ...lastBodyBlock.argument,
      },
    });
  }

  outputFileSync(file, generate(newTree));

  success(`Convert file ${shortFile} succeeded \n`);
}

function handle(file) {
  const shortFile = relative(cwd, file);

  log(`Start to handle file ${shortFile}`);

  const content = readFileSync(file, 'utf8');
  const tree = parse(content);

  if (checkAmd(tree)) {
    log(`File ${shortFile} is an AMD module`);
    convertAmd({ file, shortFile, tree });
    return;
  }

  info(`No need to convert file ${shortFile} \n`);
}

/**
 * Run command
 *
 * @param dirs
 * @param options
 */
function run(dirs, options) {
  const { filter, regular } = options;
  const files = [];

  dirs.forEach(dir => {
    const dirPath = join(cwd, dir);

    files.push(...getFiles({ dirPath, filter, regular }));
  });

  files.forEach(file => {
    handle(file);
  });
}

commander
  .version(pkg.version)
  .description('Convert JavaScript module from AMD or CommonJs to ES6')
  .arguments('<dir> [extraDirs...]')
  .option('-f, --filter <filter>', 'a query string to filter files')
  .option(
    '-r, --regular',
    'regard query string as regular expression to filter files',
  )
  .option('-i, --ignore', 'ignore files under node_modules')
  .action((dir, extraDirs, options) => {
    const dirs = [dir, ...extraDirs];

    prompt([
      {
        name: 'goon',
        type: 'confirm',
        default: false,
        message: `Files under ${dirs.join(
          '|',
        )} will be overwritten, are you sure to continue?`,
      },
    ]).then(({ goon }) => {
      if (!goon) return;

      run(dirs, options);
    });
  })
  .parse(process.argv);
