var util = require('util');
/**
 * This function handles any errors.
 * @param err Error object
 */
exports.handle_error = function(err, call_fun) {
  if (err !== null && err !== undefined && err !== '') {
    console.error(util.format("Error from %s: %j", call_fun, JSON.stringify(err)));
    console.trace("Error!");
    console.error('Exiting...');
    process.exit(1);
  }
};


