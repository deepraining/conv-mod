// import path from 'path';
import commander from 'commander';

import pkg from '../package.json';

// const { relative } = path;
//
// const cwd = process.cwd();

/**
 * Run command
 *
 * @param dir
 * @param options
 */
// function run(dir, options) {
function run(dir) {
  console.log(dir);
}

commander
  .version(pkg.version)
  .description('Convert JavaScript module from AMD or CommonJs to ES6')
  .arguments('<dir>')
  .action(run)
  .parse(process.argv);
