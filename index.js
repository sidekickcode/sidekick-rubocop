"use strict";

const sidekickAnalyser = require("@sidekick/analyser-common");
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

const _ = require('lodash');
const stripJsonComments = require("strip-json-comments");

const annotationDefaults = {analyserName: 'sidekick-rubocop'};
const LOG_FILE = path.join(__dirname, '/debug.log');

//log to file as any stdout will be reported to the analyser runner
function logger(message) {
  fs.appendFile(LOG_FILE, message + '\n');
}

if(require.main === module) {
  execute();
}
module.exports = exports = execute;

function execute() {
  sidekickAnalyser(function(setup) {
    var config;

    var conf = setup.configFiles || {};
    if(conf) {
      try {
        config = JSON.parse(stripJsonComments(conf));
      } catch(e) {
        // FIXME need some way of signalling
        console.error("can't parse config");
        console.error(e);
      }
    }

    if(!config) {
      config = {};
    }

    run(setup.content, setup.filePath)
      .then((results) => {
        console.log(JSON.stringify({ meta: results }));
      }, (err) => {
        console.error(err);
        process.exit(1);
      })
  });
}

module.exports._run = run;
function run(content, filePath) {
  return new Promise(function(resolve, reject){
    const invocation = `rubocop ${filePath} --format json`;    //run rubocop
    const opts = {cwd: __dirname};
    exec(invocation, opts, (err, stdout, stderr) => {
      if(err || stderr !== ''){
        const pathProblem = /command\ not\ found/;
        if(pathProblem.test(err.message)){
          reject('Unable to run rubocop. Please make sure that rubocop is installed and that your gems are available on your path.');
        }
        reject(`Unable to run rubocop: ${err.message}`);
      } else {
        const results = JSON.parse(stdout);
        resolve(format(results));
      }
    });
  });
}

function format(errors) {
  var results = [];
  //we run per-file so there will only be 1 file in the files array
  _.each(errors.files[0].offenses, function(offense){
    const formattedError = {
      analyser: annotationDefaults.analyserName,
      location: {
        startLine: offense.location.line,
        endLine: offense.location.line,
        startCharacter: offense.location.column,
        endCharacter: offense.location.column + offense.location.length,
      },
      message: offense.message,
      kind: offense.cop_name,
    };
    results.push(formattedError);
  });
  return results;
}
