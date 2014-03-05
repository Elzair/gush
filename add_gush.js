#!/usr/bin/env node

var exec       = require('child_process').exec
  , fs         = require('fs')
  , path       = require('path')
  , util       = require('util')
  , minimist   = require('minimist')
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
      var my_err = (error || inner_error) ? {error: error, inner_error: inner_error} :  null;
      cb(my_err, inner_stdout);
    }); 
  });
};

/**
 * This is the main function.
 */
var main = function() {
  // Get command line arguments
  var cmd = process.argv[2];
  var argv = minimist(process.argv.slice(3));
  console.log(util.inspect(argv));
  var options = {};

  if (cmd === 'add') {
    options.path = argv.path || path.join(process.cwd(), '.gush.development.json');
    options.cwd = argv.cwd || process.cwd();
    options.tag_name = argv.name || path.basename(argv.path).replace(/\./g, "_");
    options.tag_message = argv.message || path.basename(options.path);
    options.overwrite = argv.hasOwnProperty('o') ? true : false;
    options.annotated = true;
    console.log(util.inspect(options));
 
    //add_gush_config(options, function(error, stdout) {
    //  err.handle_error(error);
    //  if (stdout !== undefined && stdout !== null && stdout !== '') {
    //    console.log(stdout);
    //  }
    //  console.log("Successfully added & tagged current gush config file!");
    //});
  }
};

main();
