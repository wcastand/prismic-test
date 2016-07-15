#!/usr/bin/env node
'use strict';

// Setup env variables from local .env file. After this call, all variables
// from .env file can be access via `process.env`.
var dotEnvLoaded = require('dotenv').config({
    silent: true,
});
console.log('.env file loaded:', dotEnvLoaded);

var autoprefixer = require('metalsmith-autoprefixer');
var beautify = require('metalsmith-beautify');
var ignore = require('metalsmith-ignore');
var layouts = require('metalsmith-layouts');
var markdown = require('metalsmith-markdown');
var s3 = require('metalsmith-s3');
var sass = require('metalsmith-sass');

var metalsmithPrismicServer = require('metalsmith-prismic-server');

var handlebarsHelpers = require('./plugins/handlebars-helpers');
var languageHelpers = require('./plugins/language-helper');
var utils = require('./utils/utils.js');

var argv = require('process').argv;

var defaultLanguage = 'fr';
var config = {
  /*
    Si language 'fr' alors mis en root, sinon mis dans le dossier 'en'
    page mis en root
    blog mis dans /blog/
  */
  prismicLinkResolver (ctx, doc) {
    if (doc.isBroken)
      return

    var filename = doc.data ? 'index.html' : ''
    var language = utils.getLanguageFromTags(doc)
    if(language === defaultLanguage){
      switch (doc.type) {
        case 'page':
        case 'home':
          return '/' + filename
        case 'blog-post':
          return '/blog/' +  (doc.uid || doc.slug) + '/' + filename
        default:
          return '/' + doc.type + '/' +  (doc.uid || doc.slug) + '/' + filename
      }
    }
    else if(language !== defaultLanguage){
      switch (doc.type) {
        case 'page':
        case 'home':
          return '/' + language + '/' + filename
        case 'blog-post':
          return '/' + language + '/blog/' +  (doc.uid || doc.slug) + '/' + filename
        default:
          return '/' + language + '/' + doc.type + '/' +  (doc.uid || doc.slug) + '/' + filename
      }
    }
    else
      return '/' + filename
  },

  // Metalsmith plugins passed to metalsmithPrismicServer
  plugins: {
    common: [
      // Render markdown files to html
      markdown(),
      // Register handlebars helpers
      handlebarsHelpers(),
      // Register language helpers
      languageHelpers(),
      // Render with handlebars templates
      layouts({
        engine: 'handlebars',
        directory: 'layouts',
        partials: 'partials',
        pattern: '**/*.html'
      }),
      // Style using sass
      sass({
        outputDir: 'style/'
      }),
      // Autoprefix styles
      autoprefixer({
        // Support browsers based on these versions
        browsers: ['last 2 versions',
                   '> 5%']
      }),
      // Prettify output
      beautify({
        indent_size: 2,
        indent_char: ' ',
        wrap_line_length: 0,
        end_with_newline: true,
        css: true,
        html: true
      }),
      // Ignore some files
      ignore([
        '**/*.scss'
      ])
    ],
    deploy: [
      s3({
        action: 'write',
        bucket: 'test-prismic-ellyo',
        region: 'us-west-2'
      })
    ]
  }
};

function run() {
  // Start server
  switch (argv[2]) {
    case 'dev':
      metalsmithPrismicServer.dev(config);
      break;
    case 'prod':
      metalsmithPrismicServer.prod(config);
      break;
    case 'build':
      metalsmithPrismicServer.build(config, []);
      break;
    default:
      console.error(`invalid command '${argv[2]}'`);
  }
}

if (require.main === module) {
  // Only run server if run from script
  run();
}
