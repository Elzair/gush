var exec = require('child_process').exec
  , util = require('util')
  ;

/**
 * This function adds a file in the current working directory to the git
 * repository in the same directory.
 * @param cwd path to git repository
 * @param path directory containing file
 * @param cb callback function to execute
 */
exports.add_git_object = function(cwd, path, cb) {
  exec(util.format("git hash-object -w %s", path), {cwd: cwd}, function(error, stdout, stderr) {
    var my_err = (error || stderr) ? {error: error, stderr: stderr} :  null;
    cb(my_err, stdout);
  });
};

/**
 * This function adds an annotated tag to the current repository.
 * @param options.cwd path to git repository
 * @param options.hash SHA-1 hash of object to tag
 * @param options.tag_name tag name
 * @param options.tag_message tag message
 * @param cb callback function to execute
 */
var add_tag_object  = function(options, cb) {
  options.annotated = options.annotated || true;
  exec(util.format("git tag -a %s -m '%s' %s", options.tag_name, options.tag_message, options.hash), 
   {cwd: options.cwd}, 
   function(error, stdout, stderr) {
    var my_err = (error || stderr) ? {error: error, stderr: stderr} :  null;
    cb(my_err, stdout);
  });
};

/**
 * This function deletes a tag from a repository
 * @param options.cwd path to git repository
 * @param options.tag_name tag name
 * @param cb callback function to execute
 */
var delete_tag_object = function(options, cb) {
  exec(util.format("git tag -d %s", options.tag_name), 
   {cwd: options.cwd}, 
   function(error, stdout, stderr) {
    var my_err = (error || stderr) ? {error: error, stderr: stderr} :  null;
    cb(my_err, stdout);
  });
};

/**
 * This function adds an annotated tag to the current repository.
 * @param options.cwd path to git repository
 * @param options.hash SHA-1 hash of object to tag
 * @param options.tag_name tag name
 * @param options.tag_message tag message
 * @param cb callback function to execute
 */
exports.add_tag = function(options, cb) {
  options.overwrite = options.overwrite || false;
  add_tag_object(options, function(error, stdout) {
    // If tag already exists, delete it and tag the new object.
    if (error && error.hasOwnProperty('error') 
     && error.error.hasOwnProperty('code') && error.error.code === 128) {
      delete_tag_object(options, function(inner_error, inner_stdout) {
        var inner_output = [stdout, inner_stdout].join("\n");
        if (inner_error) {
          cb(inner_error, inner_output);
        }
        add_tag_object(options, function(innermost_error, innermost_stdout) {
          var innermost_output = [inner_output, innermost_stdout].join("\n");
          cb(innermost_error, innermost_output);
        });
      });
    }
    else if (error) {
      cb(error, stdout);
    }
  });
};
