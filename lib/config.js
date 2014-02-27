var fs         = require('fs')
  , path       = require('path')
  ;
/**
 * This function returns the home directory of the user executing this script.
 */
var get_user_home = function() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
};

/**
 * This function processes a git config file and attempts to find the username and email.
 * @param file_path path to the config file
 * @param cb callback function to execute
 */
var process_config_file = function(file_path, cb) {
  fs.readFile(file_path, function(err, data) {
    var user_info = {};
    if (err) {
      cb(err, user_info);
      return;
    }
    var contents = data.toString().split('\n');
    var user_re = /\[user\]/, not_user_re = /\[(?!user)\]/;
    var name_re = /name[ \t]*=[ \t]*\w+/, email_re = /email[ \t]*=[ \t]*\w+@\w+\.\w+/;
    var i = 0;
    var in_user = false;
    for (i=0; i<contents.length; i++) {
      if (!in_user) {
        in_user = contents[i].match(user_re) ? true : false;
      }
      else {
        if (contents[i].match(not_user_re)) {
          in_user = false;
        }
        else if (contents[i].match(name_re)) {
          user_info.name = contents[i].split(/\s+/)[3];
        }
        else if (contents[i].match(email_re)) {
          user_info.email = contents[i].split(/\s+/)[3];
        }
      }
    }
    cb(err, user_info);
  });
};

/** 
 * This function return the name & email for the tag object.
 * @param cwd directory containing the git repository
 * @param cb callback function to execute
 */
exports.get_user_info = function(cwd, cb) {
  // First try to get user info from local .git/config
  var user_info = {};
  process_config_file(path.join(cwd, '.git', 'config'), function(err, info) {
    if (err) {
      cb(err, user_info);
    }

    // Then, also read data from the .gitconfig file in the user's home directory
    process_config_file(path.join(get_user_home(), '.gitconfig'), function(err, more_info) {
      if (err) {
        cb(err, user_info);
        return;
      }
      user_info.name = info.name || more_info.name || process.env.GIT_COMMITTER_NAME || process.env.GIT_AUTHOR_NAME;
      user_info.email = info.email || more_info.email || process.env.GIT_COMMITTER_EMAIL || process.env.GIT_AUTHOR_EMAIL;
      cb(err, user_info);
    });
  });
};

