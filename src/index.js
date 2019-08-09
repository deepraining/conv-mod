import path from 'path';
import rd from 'rd';
import commander from 'commander';
import { correctSlash } from './util';

import pkg from '../package.json';

const { join } = path;
const { eachFileFilterSync } = rd;

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
 * Run command
 *
 * @param dir
 * @param options
 */
function run(dir, options) {
  const { filter, regular } = options;
  const dirPath = join(cwd, dir);

  const files = getFiles({ dirPath, filter, regular });

  console.log(files);
}

commander
  .version(pkg.version)
  .description('Convert JavaScript module from AMD or CommonJs to ES6')
  .arguments('<dir>')
  .option('-f, --filter <filter>', 'a query string to filter files')
  .option(
    '-r, --regular',
    'regard query string as regular expression to filter files',
  )
  .option('-i, --ignore', 'ignore files under node_modules')
  .action(run)
  .parse(process.argv);
