#!/usr/bin/env node

var exec       = require('child_process').exec
  , fs         = require('fs')
  , path       = require('path')
  , util       = require('util')
  , err        = require('./lib/err')
  , git        = require('./lib/git')
  ;

/**
 * This function adds the gush config file to the git repository in the current working directory.
 * @param options.cwd path to git repository
 * @param options.path path to gush config file
 * @param options.tag_name tag name
 * @param options.tag_message tag message
 * @param options.overwrite whether or not to overwrite existing tag
 * @param cb callback function to execute
 */
var add_gush_config = function(options, cb) {
  git.add_git_object(options.cwd, options.path, function(error, hash) {
    options.hash = hash;
    git.add_tag(options, function(inner_error, inner_stdout) {
      var my_err = [error, inner_error].join("\n");
      cb(my_err, inner_stdout);
    }); 
  });
};

/**
 * This is the main function.
 */
var main = function() {
  // Get path to gush config file
  var script_name = path.basename(process.argv[1]);
  var cmdargs = process.argv.slice(2,process.argv.length);
  if (cmdargs.length < 2) {
    console.error(util.format("Usage: %s add /path/to/gush/config/file [/path/to/git/repository]", script_name));
    process.exit(1);
  }
  var cmd = cmdargs[0];
  if (cmd !== 'add') {
    console.error(util.format("Usage: %s add /path/to/gush/config/file [/path/to/git/repository]", script_name));
    process.exit(1);
  }

  // Get options
  var options = {};
  options.path = cmdargs[1];
  options.cwd = cmdargs[2] || process.cwd();
  options.tag_message = path.basename(options.path);
  options.tag_name = options.tag_message.replace(/\./g, "_");
  options.overwrite = true;
  options.annotated = true;
 
  add_gush_config(options, function(error, stdout) {
    err.handle_error(error);
    if (stdout !== undefined && stdout !== null && stdout !== '') {
      console.log(stdout);
    }
    console.log("Successfully added & tagged current gush config file!");
  });
};

main();
