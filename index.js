#!/usr/bin/env node

/*
 * NOTE: IF you get a "spawn EMFILE" error, try increasing your
 * open file descriptors limit: ulimit -n 1000
 */
var exec = require('child_process').exec
  , fs   = require('fs');

// Get blob object by hash and copy it to the new working directory
var get_blob = function(hash, cwd, nwd) {
  exec("git cat-file -p " + hash + " > " + nwd,
    {cwd: cwd},
    function(error, stdout, stderr) {
      if (stderr !== '') {
        console.log('stderr: ' + stderr);
        return;
      }
      if (error !== null) {
        console.log('exec error: ' + error);
        return;
      }
      if (stdout !== '') {
        console.log(stdout);
      }
    }
  );
};

// Parse tree object
var get_tree_helper = function(stdout, cwd, nwd) {
  var lines = stdout.split('\n');
  var i = 0, line = '', dirname = '', fname = '', hash = '', np = '';

  // First handle all the blobs
  for (i=0; i<lines.length; i++) {
    line = lines[i].split(' ');
    if (line[1] === 'blob') {
      fname = lines[i].substring(lines[i].indexOf('\t')+1);
      np = nwd + '/' + fname;
      hash = lines[i].substring(12, 42);
      get_blob(hash, cwd, np);
    }
  }
  // Then handle all the subtrees
  for (i=0; i<lines.length; i++) {
    line = lines[i].split(' ');
    if (line[1] === 'tree') {
      dirname = lines[i].substring(lines[i].indexOf('\t')+1);
      np = nwd + '/' + dirname;
      // Ensure destination directory exists
      fs.mkdirSync(np);
      hash = lines[i].substring(12, 42);
      get_tree(hash, cwd, np);
    }
  }
};

// Get tree object by hash
var get_tree = function(hash, cwd, nwd) {
  exec("git cat-file -p " + hash,
    {cwd: cwd},
    function(error, stdout, stderr) {
      if (stderr !== '') {
        console.log('stderr: ' + stderr);
        return;
      }
      if (error !== null) {
        console.log('exec error: ' + error);
        return;
      }
      get_tree_helper(stdout, cwd, nwd);
    }
  );
};

var main = function() {
  // Get arguments passed to script
  var cmdargs = process.argv.slice(2,process.argv.length);

  // Get the tree object of the commit object pointed to by HEAD.
  exec("git cat-file -p $(cat .git/$(cat .git/HEAD | awk '{print $2}')) | head -n 1 | awk '{print $2}'",
    {cwd: cmdargs[0]},
    function(error, stdout, stderr) {
      if (stderr !== '') {
        console.log('stderr: ' + stderr);
        return;
      }
      if (error !== null) {
        console.log('exec error: ' + error);
        return;
      }
      get_tree(stdout, cmdargs[0], cmdargs[1]);
    }
  );
};

main();
