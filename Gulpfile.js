'use strict';

//////////////////////////////
// Require Gulp and grab Armadillo
//////////////////////////////
const gulp = require('gulp');
const rename = require('gulp-rename');

require('gulp-armadillo')(gulp);

gulp.task('config:cms', () => {
  return gulp
    .src('cms.yml')
    .pipe(
      rename({
        basename: 'config',
      }),
    )
    .pipe(gulp.dest('.www/admin'));
});
