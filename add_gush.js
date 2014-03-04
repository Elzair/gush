#!/usr/bin/env node

var exec       = require('child_process').exec
  , fs         = require('fs')
  , crypto     = require('crypto')
  , path       = require('path')
  , util       = require('util')
  , zlib       = require('zlib')
  , dateformat = require('dateformat')
  , err        = require('./lib/err')
  , config     = require('./lib/config')
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
  exec(util.format("git hash-object -w %s", gush_path), {cwd: cwd}, function(error, stdout, stderr) {
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
var add_tag_file  = function(cwd, hash, name, message, cb) {
  exec(util.format("git tag -a %s -m '%s' %s", name, message, hash), {cwd: cwd}, function(error, stdout, stderr) {
    var my_err = error || stderr || null;
    cb(my_err, stdout);
  });
};

/**
 * This function deletes a tag from a repository
 * @param cwd path to git repository
 * @param name tag name
 * @param cb callback function to execute
 */
var delete_tag = function(cwd, name, cb) {
  exec(util.format("git tag -d %s", name), {cwd: cwd}, function(error, stdout, stderr) {
    var my_err = error || stderr || null;
    cb(my_err, stdout);
  });
};

/**
 * This function adds a tag to the current .gush.json file.
 * @param cwd path to git repository
 * @param hash SHA-1 hash of blob object containing current .gush.json file
 * @param cb callback function to execute
 */
var add_gush_tag  = function(cwd, hash, cb) {
  add_tag_file(cwd, hash, 'gush_json', '.gush.json', function(error, hash) {
    // If tag already exists, delete it and attempt to create the tag again
    if (error && error.hasOwnProperty('code') && error.code === 127) {
      delete_tag(cwd, 'gush_json', function(inner_error, inner_stdout) {
        console.log(inner_stdout);
        err.handle_error(inner_error);
        add_tag_file(cwd, hash, cb);
      });
    }
    else {
      cb(error, hash);
    }
  });
};

/**
 * This is the main function.
 */
var main = function() {
  // Get directory of  file
  var script_name = path.basename(process.argv[1]);
  var cmdargs = process.argv.slice(3,process.argv.length);
  var gush_path = cmdargs[0];
  if (!gush_path) {
    console.error(util.format("Usage: %s add /directory/of/gush.json/file [/path/to/git/repository]", script_name));
    process.exit(1);
  }
  var cwd = cmdargs[1] || process.cwd();
  console.log('CWD: ' + cwd);
 
  // Get the hash of the current .gush.json file
  add_gush_file(cwd, gush_path, function(my_err, hash) {
    err.handle_error(my_err);
    console.log('Added .gush.json!');

    // Create a tag object for the current .gush.json file
    add_gush_tag(cwd, hash, function(my_err, tag_hash) {
      err.handle_error(my_err);
      console.log(util.format("Successfully added & tagged current .git.json file: %s!", tag_hash));
    });
  });
};

main();
