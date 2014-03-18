var util = require('util');

/**
 * This function handles any errors.
 * @param err Error object
 */
exports.handle_error = function(err) {
  if (err !== null && err !== undefined && err !== '') {
    console.error(util.format("Error: %s", JSON.stringify(err)));
    console.trace("Error!");
    process.exit(1);
  }
};
