define(['a', 'b', './c', '../../d/e'], function(a, b, c) {
  console.log('hello');
  (function() {
    console.log('hi');
  })();

  return {};
});
