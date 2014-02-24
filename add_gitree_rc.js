#!/usr/bin/env node

var exec   = require('child_process').exec
  , fs     = require('fs')
  , crypto = require('crypto')
  , path   = require('path')
  , util   = require('util')
  , zlib   = require('zlib');

var main = function() {
  // Get directory to find .gitree file
  var cmdargs = process.argv.slice(2,process.argv.length);
  var cwd = cmdargs[0];
  var pa = path.join(cwd, '.gitree');

  // Read input file
  fs.readFile(pa, function(err, data) {
    if (err) {
      console.error(JSON.stringify(err));
      return 1;
    }

    // Create header of git blob object
    var header = new Buffer('blob 1234\0', 'ascii');
    header.writeUInt32BE(data.length, 5);

    // Create a buffer with the contents of the header and the input file
    var store = new Buffer(data.length+header.length);
    header.copy(store);
    data.copy(store, header.length);

    // Generate SHA-1 hash of blob object
    var shasum = crypto.createHash('sha1');
    shasum.update(store);
    var hash = shasum.digest('hex');

    // Compress object & store it in git repository
    zlib.deflate(store, function(err, buff) {
      if (err) {
        console.error(JSON.stringify(err));
        return 1;
      }
      var dir_path = path.join(cwd, '.git', 'objects', hash.substring(0,2));
      fs.mkdir(dir_path, function(err) {
        if (err) {
          console.error(JSON.stringify(err));
          return 1;
        }
        var file_path = path.join(dir_path, hash.substring(2, hash.length));
        fs.writeFile(file_path, buff, function(err) {
          if (err) {
            console.error(JSON.stringify(err));
            return 1;
          }
          console.log(util.format("%s", hash));
        });
      });
    });
  });
};

main();
