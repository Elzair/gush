/**
 * This function handles any errors.
 * @param err Error object
 */
exports.handle_error = function(err) {
  if (err !== null && err !== undefined && err !== '') {
    console.error(JSON.stringify(err));
    console.log('Exiting...');
    process.exit(1);
  }
};


