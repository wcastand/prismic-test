var _ = require('lodash');

module.exports = function() {
  var defaultLanguage = 'fr'
  return function(files, metalsmith, done) {
    Object.keys(files).map(function(file) {
      if(file.indexOf('en')==! -1)
        files[file].language = 'en'
      else
        files[file].language = ''
    })
    done();
  };
};
