define([
  'a',
  'b',
  // comment 1
  './c',
  '../../d/e',
], function(
  a,
  b,
  // comment 2
  c,
) {
  console.log('hello');

  return {};
});
