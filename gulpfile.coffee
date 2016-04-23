# Load all required libraries.
gulp = require 'gulp'
gutil = require 'gulp-util'
coffee = require 'gulp-coffee'
istanbul = require 'gulp-istanbul'
mocha = require 'gulp-mocha'
plumber = require 'gulp-plumber'

gulp.on 'err', (e) ->
  gutil.beep()
  gutil.log e.err.stack

gulp.task 'coffee', ->
  gulp.src './src/**/*.coffee'
    .pipe plumber() # Pevent pipe breaking caused by errors from gulp plugins
    .pipe coffee({bare: true})
    .pipe gulp.dest './lib/passport-shopify/'

gulp.task 'test', ['coffee'], ->
  gulp.src ['lib/passport-shopify/**/*.js']
    .pipe(istanbul()) # Covering files
    .pipe(istanbul.hookRequire()) # Overwrite require so it returns the covered files
    .on 'finish', ->
      gulp.src(['test/**/*.spec.coffee'])
        .pipe mocha reporter: 'spec', compilers: 'coffee:coffee-script'
        .pipe istanbul.writeReports() # Creating the reports after tests run

gulp.task 'watch', ->
  gulp.watch './src/**/*.coffee', ['coffee']

gulp.task 'default', ['coffee']
