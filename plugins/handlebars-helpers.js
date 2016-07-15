var Handlebars = require('handlebars');

module.exports = function() {
  var helpers = {
    json: function(value, indentation) {
      return JSON.stringify(value, null, indentation);
    }
    , linkify: function (lang, t1, t2){
      if(lang === '')
        return '/' + t1;
      else
        return '/' + lang + '/' + t2;
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
