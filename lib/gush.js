var path       = require('path')
  , util       = require('util')
  , git        = require('../lib/git')
  ;

/**
 * This function adds the gush config file to the git repository in the current working directory.
 * @param options.cwd path to git repository
 * @param options.path path to gush config file
 * @param options.tag_name tag name
 * @param options.tag_message tag message
 * @param cb callback function to execute
 */
exports.add_config = function(options, cb) {
  git.add_git_object(options.cwd, options.path, function(error, hash) {
    options.hash = hash;
    git.add_tag(options, function(inner_error, inner_stdout) {
      var my_err = (error || inner_error) ? {error: error, inner_error: inner_error} :  null;
      cb(my_err, inner_stdout);
    }); 
  });
};

/**
 * This method initializes a bare repository on a remote server
 * @param options.user the name of the user account on the destination
 * @param options.host the destination hostname
 * @param options.port the port to which the destination's SSH server listens (default: 22)
 * @param options.local_path the path of the 
 */
exports.init_app = function(options, cb) {
};
