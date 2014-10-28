// Import modules:
var gulp = require('gulp')
,   pkg = require('./package.json')
,   rename = require('gulp-rename')
,   concat = require('gulp-concat')
,   gutils = require('gulp-util')
,   jshint = require('gulp-jshint')
,   uglify = require('gulp-uglify')
,   header = require('gulp-header');

// Define header for Bitsy files:
var bitsyHeader = ['/*',
  '<%= pkg.title %>',
  'Copyright ' + gutils.date("yyyy") + ' Sourcebits www.sourcebits.com',
  'Version: <%= pkg.version %>',
  '*/\n'].join('\n');

// Define header for Bitsy examples:
var bitsyExampleHeader = ['<!DOCTYPE html>',
'<html lang="en">',
'<head>',
'  <meta charset="utf-8">',
'  <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no">',
'  <meta name="apple-mobile-web-app-capable" content="yes">',
'  <meta name="mobile-web-app-capable" content="yes">',
'  <meta name="msapplication-tap-highlight" content="no">',
'  <title>Bitsy</title>',
'  <script src="../dist/bitsy-<%= pkg.version %>.js"></script>'].join('\n');

// Concat, minify and output JavaScript:
gulp.task('js', function () {
  gulp.src([
    'src/core.js',
    'src/extend.js',
    'src/collection.js',
    'src/injector.js',
    'src/pubsub.js',
    'src/databinding.js',
    'src/template.js',
    'src/promise.js',
    'src/ajax.js',
    'src/modifiers.js',
    'src/events.js',
    'src/router.js'
  ])

  .pipe(concat(pkg.name + "-" + pkg.version + ".js"))
  .pipe(header(bitsyHeader, { pkg : pkg}))
  .pipe(gulp.dest(pkg.projectPath + 'dist/'))
  .pipe(uglify({mangle: false}))
  .pipe(header(bitsyHeader, { pkg : pkg }))
  .pipe(rename(pkg.name + "-" + pkg.version + ".min.js"))
  .pipe(gulp.dest(pkg.projectPath + 'dist/'));
});

// Concat and output examples:
gulp.task('examples', function() {
  gulp.src([
    'src/examples/$.html',
    'src/examples/$$.html',
    'src/examples/events.html',
    'src/examples/dependency-injection.html',
    'src/examples/data-binding.html',
    'src/examples/mediators.html',
    'src/examples/promises.html',
    'src/examples/pub-sub.html',
    'src/examples/routing.html',
    'src/examples/templates.html'
  ])
  .pipe(header(bitsyExampleHeader, { pkg : pkg}))
  .pipe(gulp.dest(pkg.projectPath + 'examples/'));
});

// JSHint:
gulp.task('jshint', function() {
  gulp.src(pkg.name + "-" + pkg.version + ".js")
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

/* 
   Define default task:
   To build, just enter gulp in terminal.
*/
gulp.task('default', ['js','jshint']);

