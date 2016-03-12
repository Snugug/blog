'use strict';

//////////////////////////////
// Require Gulp and grab Armadillo
//////////////////////////////
var gulp = require('gulp');

require('gulp-armadillo')(gulp);


gulp.task('copy:fonts', function () {
  return gulp.src('.www/css/fonts.css')
    .pipe(gulp.dest('.dist/css'));
});
