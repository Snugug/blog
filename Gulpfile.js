'use strict';

//////////////////////////////
// Require Gulp and grab Armadillo
//////////////////////////////
const gulp = require('gulp');
const rename = require('gulp-rename');
const fs = require('fs-extra');
const path = require('path');

require('gulp-armadillo')(gulp);

gulp.task('config:cms', () => {
  return gulp
    .src('cms.yml')
    .pipe(
      rename({
        basename: 'config'
      })
    )
    .pipe(gulp.dest('.www/admin'));
});

const redirects = {
  cooking: '/cookbook'
};

async function makeRedirect(input, output) {
  const file = `<!DOCTYPE html><meta charset="utf-8" /><title>Redirecting to ${output}</title><meta http-equiv="refresh" content="0; URL=${output}" /><link rel="canonical" href="${output}" />`;
  const p = path.join('.www', input, 'index.html');
  return fs.outputFile(p, file);
}

gulp.task('generate:redirects', cb => {
  const rdrs = Object.keys(redirects).map(input => makeRedirect(input, redirects[input]));

  Promise.all(rdrs).then(() => cb());
});
