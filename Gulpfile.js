'use strict';

//////////////////////////////
// Require Gulp and grab Armadillo
//////////////////////////////
var gulp = require('gulp');

require('gulp-armadillo')(gulp, {
  'pages': {
    'dir': 'pages/musings',
    'transformURL': true,
    'sort': 'published',
    'reverse': true
  },
  'copy': {
    'dist': [
      '.www/**/*',
      '!.www/**/*.html',
      '!.www/bower_components/**/*',
      '!.www/css/**/style.css',
      '!.www/js/**/*',
      '.www/css/fonts.css',
      'CNAME'
    ]
  }
});
