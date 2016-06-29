"use strict";

const sidekickAnalyser = require("@sidekick/analyser-common");
const fs = require('fs');
const path = require('path');

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

    run(setup.content)
      .then((results) => {
        console.log(JSON.stringify({ meta: results }));
      }, (err) => {
        process.exit(1);
      })
  });
}

module.exports._testRun = run;
function run(content) {
  return new Promise(function(resolve, reject){
    //run rubocop
  });
}

function format(error) {
  return {
    analyser: annotationDefaults.analyserName,
    location: {
      startLine: error.line,
      endLine: error.line,
      startCharacter: error.column,
      endCharacter: error.column,
    },
    message: error.message,
    kind: error.ruleId,
  };
}
