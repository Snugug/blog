'use strict';

//////////////////////////////
// Require Gulp and grab Armadillo
//////////////////////////////
var gulp = require('gulp');

require('gulp-armadillo')(gulp, {
  'pages': {
    'dir': 'pages/musings',
    'transformURL': true,
    'sort': 'created',
    'reverse': true
  }
});
