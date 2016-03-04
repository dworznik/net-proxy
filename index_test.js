
beforeEach(function() {
/**
 * Clear the module cache before each test. Many of our modules, such as
 * Stores and Actions, are singletons that have state that we don't want to
 * carry over between tests. Clearing the cache makes `require(module)`
 * return a new instance of the singletons. Modules are still cached within
 * each test case.
 */
// var cache = require.cache;
// projectModuleIds.forEach(function(id) {
//     delete cache[id]
// }
// );
/**
 * Automatically mock the built in setTimeout and setInterval functions.
 */
jasmine.clock().install();
});

afterEach(function() {
jasmine.clock().uninstall();
});

var context = require.context('./test', true, /\.js$/);
context.keys().forEach(context);
// module.exports = context;