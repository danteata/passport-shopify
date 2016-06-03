import gulp from 'gulp';
import gutil from 'gulp-util';
import babel from 'gulp-babel';
import istanbul from 'gulp-istanbul';
import mocha from 'gulp-mocha';
import { Instrumenter } from 'isparta';

// Files to process
const TEST_FILES = 'test/**/*.js';
const SRC_FILES = 'src/**/*.js';

gulp.on('err', (e) => {
  gutil.beep();
  return gutil.log(e.err.stack);
});

gulp.task('build', () =>
    gulp.src([SRC_FILES])
        .pipe(babel({
            presets: ['es2015'],
          }))
        .pipe(gulp.dest('lib/passport-shopify'))
);

gulp.task('istanbul', cb => {
  gulp.src([SRC_FILES])
    .pipe(istanbul({
      instrumenter: Instrumenter,
    }))
    .pipe(istanbul.hookRequire())
    .on('finish', cb);
});

gulp.task('test', ['istanbul'], () => gulp.src([TEST_FILES])
  .pipe(mocha({
  reporter: 'spec',
  compilers: 'js:babel-core/register',
})).pipe(istanbul.writeReports()));

gulp.task('watch', function () {
  return gulp.watch('SRC_FILES', ['build']);
});

gulp.task('default', ['build']);
