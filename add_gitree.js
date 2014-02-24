#!/usr/bin/env node

var exec   = require('child_process').exec
  , fs     = require('fs')
  , crypto = require('crypto')
  , path   = require('path')
  , util   = require('util')
  , zlib   = require('zlib');

var handle_error = function(err) {
  if (err) {
    console.error(JSON.stringify(err));
    process.exit(1);
  }
};

var write_blob = function(dir_path, buff, hash) {
  var file_path = path.join(dir_path, hash.substring(2, hash.length));
  fs.stat(file_path, function(err, stats) {
    handle_error(err);
    if (stats.isFile()) {
      console.log('Warning: Identical .gitree.json already exists in repository!');
      console.log(util.format("%s", hash));
    }
    else {
      fs.writeFile(file_path, buff, function(err) {
        handle_error(err);
        console.log(util.format("%s", hash));
      });
    }
  });
};

var main = function() {
  // Get directory to find .gitree.json file
  var cmdargs = process.argv.slice(2,process.argv.length);
  var cwd = cmdargs[0];
  var pa = path.join(cwd, '.gitree.json');

  // Read input file
  fs.readFile(pa, function(err, data) {
    handle_error(err);

    // Create header of git blob object
    var header = new Buffer(util.format('blob %d\u0000', data.length));

    // Create a buffer with the contents of the header and the input file
    var store = new Buffer(header.length+data.length);
    header.copy(store);
    data.copy(store, header.length);
    console.log(store.toString());

    // Generate SHA-1 hash of blob object
    var shasum = crypto.createHash('sha1');
    shasum.update(store);
    var hash = shasum.digest('hex');

    // Compress object & store it in git repository
    zlib.deflate(store, function(err, buff) {
      handle_error(err);

      var dir_path = path.join(cwd, '.git', 'objects', hash.substring(0,2));
      fs.stat(dir_path, function(err, stats) {
        handle_error(err);

        if (stats.isDirectory()) {
          write_blob(dir_path, buff, hash);
        }
        else {
          fs.mkdir(dir_path, function(err) {
            handle_error(err);
            write_blob(dir_path, buff, hash);
          });
        }
      });
    });
  });
};

main();
