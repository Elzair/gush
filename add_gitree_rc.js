#!/usr/bin/env node

var exec   = require('child_process').exec
  , fs     = require('fs')
  , crypto = require('crypto')
  , zlib   = require('zlib');

var main = function() {
  // Get arguments passed to script
  var cmdargs = process.argv.slice(2,process.argv.length);

  // Read input file
  fs.readFile(cmdargs[0], function(err, data) {
    if (err) {
      console.log(JSON.stringify(err));
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

    zlib.deflate(store, function(err, buff) {

    });
  });
};

main();
