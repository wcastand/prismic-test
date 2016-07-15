var Handlebars = require('handlebars');

module.exports = function() {
  var helpers = {
    json: function(value, indentation) {
      return JSON.stringify(value, null, indentation);
    }
    , linkify: function (value, indentation){
      if(value === '')
        return '';
      else
        return '/' + value;
    }
  };

  for(var key in helpers) {
    if(helpers.hasOwnProperty(key)) {
      Handlebars.registerHelper(key, helpers[key]);
    }
  }

  return function(files, metalsmith, done) {
    done();
  };
};
