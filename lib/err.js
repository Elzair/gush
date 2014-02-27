/**
 * This function handles any errors.
 * @param err Error object
 */
exports.handle_error = function(err) {
  if (err) {
    console.error(JSON.stringify(err));
    process.exit(1);
  }
};


