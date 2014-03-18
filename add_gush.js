#!/usr/bin/env node

var path       = require('path')
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
  var argv = minimist(process.argv.slice(2));
  console.log(util.inspect(argv));
  var options = {};

  // Ensure valid gush config file name (i.e. .gush.environment.json)
  if (!argv.path || !path.basename(/^\.gush\.[a-z]+\.json$/.exec(argv.path))) {
    err.handle_error("Invalid gush config file name!");
  }
  var environment = argv.path.split(".")[2];

  options.path = argv.path;
  options.cwd = process.cwd();
  options.tag_name = "gush_json";
  options.tag_message = environment;
  console.log(util.inspect(options));

  add_gush_config(options, function(error, stdout) {
    err.handle_error(error);
    if (stdout !== undefined && stdout !== null && stdout !== '') {
      console.log(stdout);
    }
    console.log("Successfully added & tagged current gush config file!");
  });
};

main();
