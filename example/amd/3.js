define(function() {
  console.log('hello');
  (function() {
    console.log('hi');
  })();

  return [1, 2, 3];
});
