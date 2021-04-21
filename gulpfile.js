'use strict';
 
const gulp = require('gulp'), // Builder principal
  sass = require('gulp-sass'), // Compilation de sass
  connect = require('gulp-connect'), // Création du server local
  autoprefixer = require('gulp-autoprefixer'), // Ajout des pseudo class css
  csso = require('gulp-csso'), // Minification du style
  terser = require('gulp-terser'), // Minification du js
  open = require('gulp-open'); // Ouverture de la page builder

const CONSTANTS = {
    PORT_NUMBER: 8880,
    INDEX_FILE: 'index.html',
}

const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

gulp.task('connectServer', function() {
    connect.server({
        root: './dist/',
        port: CONSTANTS.PORT_NUMBER,
        livereload: true
    });
});

gulp.task('openPage', function() {
    gulp.src('./dist/' + CONSTANTS.INDEX_FILE)
        .pipe(open({uri: 'http://localhost:' + CONSTANTS.PORT_NUMBER + '/' + CONSTANTS.INDEX_FILE}))
        .pipe(connect.reload());
})
   
gulp.task('html', function () {
    gulp.src('./src/*.html')
    .pipe(gulp.dest('./dist/'))
    .pipe(connect.reload());
});

gulp.task('htmlProd', function () {
    gulp.src('src/*.html')
    .pipe(gulp.dest('./www/'))
});

gulp.task('copyData', function () {
    gulp.src('./src/data/**/*.*')
    .pipe(gulp.dest('./dist/assets/'))
    .pipe(connect.reload());
    gulp.src('./src/*.ico')
    .pipe(gulp.dest('./dist/'))

});
gulp.task('copyDataProd', function () {
    gulp.src('src/data/**/*.*')
    .pipe(gulp.dest('./www/assets/'))
    gulp.src('src/*.ico')
    .pipe(gulp.dest('./www/'))

});
gulp.task('js', function () {
    return gulp.src('./src/scripts/**/*.js')
    .pipe(gulp.dest('./dist/scripts/'))
    .pipe(connect.reload());
});
gulp.task('jsProd', function () {
    return gulp.src('./src/scripts/**/*.js')
    .pipe(terser())
    .pipe(gulp.dest('./www/scripts/'))
});
   
gulp.task('watch', function () {
    gulp.watch('src/*.html', gulp.series('html'));
    gulp.watch('src/data/**/**.*', gulp.series('copyData'));
    gulp.watch('src/styles/sass/**/*.scss', gulp.series('sass'));
    gulp.watch('src/scripts/**/*.js',  gulp.series('js'));
});

gulp.task('sass', function () {
  return gulp.src('./src/styles/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe(gulp.dest('./dist/css'))
    .pipe(connect.reload());
});

gulp.task('sassProd', function () {
    return gulp.src('src/styles/sass/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
      .pipe(csso())
      .pipe(gulp.dest('./www/css'))
  });


gulp.task('build',gulp.parallel('html', 'copyData','js','sass'));

gulp.task('prod', gulp.parallel('htmlProd', 'copyDataProd','jsProd','sassProd'));
gulp.task('default',gulp.parallel('html', 'copyData','js','sass','watch', 'openPage','connectServer'));
