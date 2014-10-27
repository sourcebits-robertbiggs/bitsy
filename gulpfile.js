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

