var chai = require('chai');
var expect = chai.expect;

var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var fs = require('fs');
var exec = require("child_process").exec;
var path = require('path');

describe('rubocop analyser', function() {

  describe('config', function() {

    var self = this;

    function createInput() {
      var filePath = path.join(__dirname, '/fixtures/fixture.rb');
      var fileContent = fs.readFileSync(filePath, { encoding: "utf8" });

      return JSON.stringify({path: __dirname, filePath: 'fixture.rb', configFiles: {}}) + "\n" + fileContent;
    }

    it('can run analyser from cli', function(done) {
      runFixture(createInput(),
          function(err, stdout) {
            if(err) return done(err);
            self.stdout = stdout;
            done();
          });
    });

    function runFixture(input, cb) {
      var cmd = `node ${path.join(__dirname, '../index.js')} --debug=51699`;
      var child = exec(cmd, cb);
      child.stdin.end(input);
    }
  });
});
