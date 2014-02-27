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

/**
 * This function writes an object to the git repository.
 * @param obj_path path to git_repository/.git/objects/hash[0:2]
 * @param buff buffer containing the compressed data of the object
 * @param hash SHA-1 hash of object
 * @param cb callback function to execute
 */
var write_object = function(obj_path, buff, hash, cb) {
  var file_path = path.join(obj_path, hash.substring(2, hash.length));
  fs.writeFile(file_path, buff, function(err) {
    if (err) {
      if (err.code === "EACESS") {
        console.log("There is already a .gush.json file in this repository!");
        err = null;
      }
      else {
        cb(err);
        return;
      }
    }
    console.log(util.format("%s", hash));
    cb(err);
  });
};

var add_object_header = function(data, type) {
    // Create header of git blob object
    var header = new Buffer(util.format('%s %d\u0000', type, data.length));

    // Create a buffer with the contents of the header and the input file
    var store = new Buffer(header.length+data.length);
    header.copy(store);
    data.copy(store, header.length);
    return store;
};

/**
 * This function return the SHA-1 hash of a git object.
 * @param buff buffer containing the object
 * @return SHA-1 hash
 */
var generate_hash = function(buff) {
  var shasum = crypto.createHash('sha1');
  shasum.update(buff);
  return shasum.digest('hex');
};

/** 
 * This function compresses and writes an object to the git repository.
 * @param cwd path to git repository
 * @param bu buffer containing object
 * @param hash SHA-1 hash of object
 * @param cb callback function to execute
 */
var caw_object = function(cwd, bu, hash, cb) {
  zlib.deflate(bu, function(err, buff) {
    if (err) {
      cb(err, hash);
      return;
    }

    var dir_path = path.join(cwd, '.git', 'objects', hash.substring(0,2));
    fs.mkdir(dir_path, function(err) {
      if (err) {
        if (err.code === "EEXIST") {
          err = null;
        }
        else {
          cb(err, hash);
          return;
        }
      }
      write_object(dir_path, buff, hash, function(err) {
        cb(err, hash);
      });
    });
  });
};

/*
 * This function adds the .gush.json file in the current working directory to the git
 * repository in the same directory.
 * @param cwd path to git repository
 * @param gush_path directory containing .gush.json
 * @param cb callback function to execute
 */
var add_gush_blob = function(cwd, gush_path, cb) {
  // Read input file
  fs.readFile(path.join(gush_path, '.gush.json'), function(err, data) {
    if (err) {
      cb(err, null);
      return;
    }

    var store = add_object_header(data, 'blob');

    // Generate SHA-1 hash of blob object
    var hash = generate_hash(store);

    // Compress object & store it in git repository
    caw_object(cwd, store, hash, cb);
  });
};

/**
 * This function adds a tag to the current .gush.json file.
 * @param cwd path to git repository
 * @param hash SHA-1 hash of blob object containing current .gush.json file
 * @param cb callback function to execute
 */
var add_gush_tag  = function(cwd, hash, cb) {
  // Next, get user name & email
  config.get_user_info(cwd, function(err, user_info) {
    if (err) {
      err.handle_error(err);
    }

    // Get formateed date
    var now = dateformat(new Date(), "ddd mmmm dd HH:MM:ss yyyy o");

    // Create tag contents
    var tag_str = [
      'object ' + hash,
      'type blob',
      'tag gush_json',
      'tagger ' + user_info.name + ' <' + user_info.email + '> ' + now.toString(),
      '',
      'gush.json'
    ].join('\n');
    console.log(tag_str);
    var tag_buf = new Buffer(tag_str);

    var store = add_object_header(tag_buf, 'tag');

    // Get SHA-1 hash of tag object
    var tag_hash = generate_hash(store);

    // Compress 
    caw_object(cwd, store, tag_hash, cb);
  });
};

/**
 * This is the main function.
 */
var main = function() {
  // Get directory of  file
  var script_name = path.basename(process.argv[1]);
  var cmdargs = process.argv.slice(2,process.argv.length);
  var gush_path = cmdargs[0];
  if (!gush_path) {
    console.error(util.format("Usage: %s /directory/of/gush.json/file [/path/to/git/repository]", script_name));
    process.exit(1);
  }
  var cwd = cmdargs[1] || process.cwd();
  console.log('CWD: ' + cwd);
 
  // Get the hash of the current .gush.json file
  add_gush_blob(cwd, gush_path, function(err, hash) {
    err.handle_error(err);

    // Create a tag object for the current .gush.json file
    add_gush_tag(cwd, hash, function(err, tag_hash) {
      err.handle_error(err);

      // Write tag file
      fs.writeFile(path.join(cwd, '.git', 'refs', 'tags', 'gush_json'), tag_hash, function(err) {
        err.handle_error(err);

        console.log('Tag created!');
      });
    });
  });
};

main();
