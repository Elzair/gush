var util = require('util');
/**
 * This function handles any errors.
 * @param err Error object
 */
exports.handle_error = function(err) {
  if (err !== null && err !== undefined && err !== '') {
    console.error(util.format("Error: %j", JSON.stringify(err)));
    console.trace("Error!");
    console.error('Exiting...');
    process.exit(1);
  }
};


