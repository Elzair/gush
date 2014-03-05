var exec = require('child_process').exec
  , util = require('util')
  ;
/*
 * This function adds a file in the current working directory to the git
 * repository in the same directory.
 * @param cwd path to git repository
 * @param obj_path directory containing file
 * @param cb callback function to execute
 */
exports.add_git_object = function(cwd, obj_path, cb) {
  exec(util.format("git hash-object -w %s", obj_path), {cwd: cwd}, function(error, stdout, stderr) {
    var my_err = error || stderr || null;
    cb(my_err, stdout);
  });
};

/**
 * This function adds an annotated tag to the current repository.
 * @param cwd path to git repository
 * @param hash SHA-1 hash of object to tag
 * @param name tag name
 * @param message message
 * @param cb callback function to execute
 */
exports.add_tag_object  = function(cwd, hash, name, message, cb) {
  exec(util.format("git tag -a %s -m '%s' %s", name, message, hash), {cwd: cwd}, function(error, stdout, stderr) {
    var my_err = error || stderr ? {error: error, stderr: stderr} :  null;
    cb(my_err, stdout);
  });
};

/**
 * This function deletes a tag from a repository
 * @param cwd path to git repository
 * @param name tag name
 * @param cb callback function to execute
 */
exports.delete_tag_object = function(cwd, name, cb) {
  exec(util.format("git tag -d %s", name), {cwd: cwd}, function(error, stdout, stderr) {
    var my_err = (error || stderr) ? {error: error, stderr: stderr} :  null;
    cb(my_err, stdout);
  });
};

