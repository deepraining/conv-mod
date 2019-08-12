import path from 'path';
import rd from 'rd';
import commander from 'commander';
import inquirer from 'inquirer';
import { parse } from 'abstract-syntax-tree';
import fse from 'fs-extra';
import { correctSlash } from './util';
import { error, info, log, success } from './logger';
import { checkAmd, convertAmd } from './amd';
import { checkCjs, convertCjs } from './cjs';

import pkg from '../package.json';

const { join, relative } = path;
const { eachFileFilterSync } = rd;
const { prompt } = inquirer;
const { readFileSync } = fse;

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

function handle(file) {
  const shortFile = relative(cwd, file);

  log(`Start to handle file ${shortFile}`);

  const content = readFileSync(file, 'utf8');
  const tree = parse(content);

  try {
    if (checkAmd(tree)) {
      log(`File ${shortFile} is an AMD module`);
      convertAmd({ file, tree });
      success(`Convert file ${shortFile} succeeded \n`);
      return;
    }

    if (checkCjs(tree)) {
      log(`File ${shortFile} is an CommonJs module`);
      convertCjs({ file, tree });
      success(`Convert file ${shortFile} succeeded \n`);
      return;
    }

    info(`No need to convert file ${shortFile} \n`);
  } catch (e) {
    error(`Can not convert file ${shortFile} \n`);
    error(e.stack);
    error('');
  }
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
