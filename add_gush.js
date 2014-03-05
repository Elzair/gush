#!/usr/bin/env node

var exec       = require('child_process').exec
  , fs         = require('fs')
  , path       = require('path')
  , util       = require('util')
  , err        = require('./lib/err')
  , git        = require('./lib/git')
  ;

/*
 * This function adds the .gush.json file in the current working directory to the git
 * repository in the same directory.
 * @param cwd path to git repository
 * @param gush_path directory containing .gush.json
 * @param cb callback function to execute
 */
var add_gush_file = function(cwd, gush_path, cb) {
  if (path.basename(gush_path) !== '.gush.json') {
    gush_path = path.join(gush_path, '.gush.json');
  }
  git.add_git_object(cwd, gush_path, cb);
};


/**
 * This function adds a tag to the current .gush.json file.
 * @param cwd path to git repository
 * @param hash SHA-1 hash of blob object containing current .gush.json file
 * @param cb callback function to execute
 */
var add_gush_tag  = function(cwd, hash, cb) {
  git.add_tag_object(cwd, hash, 'gush_json', '.gush.json', function(error, stdout) {
    // If tag already exists, delete it and attempt to create the tag again
    if (error && error.hasOwnProperty('error') && error.error.hasOwnProperty('code') && error.error.code === 128) {
      git.delete_tag_object(cwd, 'gush_json', function(inner_error, inner_stdout) {
        err.handle_error(inner_error);
        git.add_tag_object(cwd, hash, 'gush_json', '.gush.json', cb);
      });
    }
    else if (error) {
      err.handle_error(error);
    }
    else {
      cb(error, stdout);
    }
  });
};

/**
 * This is the main function.
 */
var main = function() {
  // Get directory of .gush.json file
  var script_name = path.basename(process.argv[1]);
  var cmdargs = process.argv.slice(3,process.argv.length);
  var gush_path = cmdargs[0];
  if (!gush_path) {
    console.error(util.format("Usage: %s add /directory/of/gush.json/file [/path/to/git/repository]", script_name));
    process.exit(1);
  }
  var cwd = cmdargs[1] || process.cwd();
 
  // Get the hash of the current .gush.json file
  add_gush_file(cwd, gush_path, function(my_err, hash) {
    err.handle_error(my_err);
    console.log('Added .gush.json!');

    // Create a tag object for the current .gush.json file
    add_gush_tag(cwd, hash, function(my_err, stdout) {
      err.handle_error(my_err);
      console.log("Successfully added & tagged current .git.json file!");
    });
  });
};

main();
