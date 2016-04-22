"use strict";

var gulp = require('gulp');

// ** UTILITY PLUGINS ** //
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var del = require('del');
var filter = require('gulp-filter');
var watch = require('gulp-watch');
var debug = require('gulp-debug');
var gulpif = require('gulp-if');
var rsync = require('gulp-rsync');
var argv = require('yargs').argv;
var mainBowerFiles = require('main-bower-files');

// ** SASS/SCSS/CSS PLUGINS ** //
var sass = require('gulp-sass');

// ** JAVASCRIPT PLUGINS ** //
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var sourcemaps = require('gulp-sourcemaps');

// ** IMAGE OPTIMISATION PLUGINS ** //
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var optipng = require('imagemin-optipng');
var jpegoptim = require('imagemin-jpegoptim');

// ** SETTINGS ** //
var production = !!(argv.production);
// To build production site, run: gulp --production

// JAVASCRIPT HINTING
gulp.task('jshint', function() {
  gulp.src('meerkat_frontend/src/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// JAVASCRIPT TASKS
gulp.task('vendorJS', function() {
	return gulp.src( mainBowerFiles().concat([
		'node_modules/tree-model/dist/TreeModel-min.js',
		'bower_components/bootstrap-table/src/locale/bootstrap-table-en-US.js'
    ]))
		.pipe(filter('*.js'))
 //   .pipe(sourcemaps.init())
    .pipe(gulpif(production, uglify()))
 //   .pipe(sourcemaps.write())
    .pipe(gulp.dest('meerkat_frontend/static/js'));
});

gulp.task('appJS', ['jshint'], function() {
  return gulp.src([
      'meerkat_frontend/src/js/reports-navbar.js',
      'meerkat_frontend/src/js/mapbox-reports.js',
      'meerkat_frontend/src/js/charts/charts.js',
      'meerkat_frontend/src/js/**/*.js'
    ])
    //.pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(gulpif(production, uglify()))
    //.pipe(sourcemaps.write())
    .pipe(gulp.dest('meerkat_frontend/static/js'));
});

gulp.task('js', function() {
  gulp.start('vendorJS', 'appJS');
});


// SASS/CSS TASKS
gulp.task('sass', ['mapbox-rename-css-to-scss'], function() {
  return gulp.src('meerkat_frontend/src/sass/main.scss')
//    .pipe(sourcemaps.init())
    .pipe(gulpif(
      production,
      sass({
        outputStyle: 'compressed'
      }).on('error', sass.logError),
      sass({
        outputStyle: 'expanded'
      }).on('error', sass.logError)))
//    .pipe(sourcemaps.write())
    .pipe(gulp.dest('meerkat_frontend/static/css'));
});

// Hacky hacky hack to get mapbox.css as scss for SASS to compile it...
gulp.task('mapbox-rename-css-to-scss', function() {
  return gulp.src([
      'bower_components/mapbox.js/mapbox.uncompressed.css',
      'bower_components/leaflet.markercluster/dist/MarkerCluster.css',
      'bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css',
      'bower_components/intl-tel-input/build/css/intltelInput.css',
	  'bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css',
 	  'bower_components/bootstrap-table/src/bootstrap-table.css'
    ])
    .pipe(rename(function(path) {
      path.extname = ".scss"
    }))
    .pipe(gulp.dest('meerkat_frontend/src/sass/autogenerated'));
});

gulp.task('vendor-css', function(){
  return gulp.src(mainBowerFiles())
    .pipe( filter('*.css') )
    .pipe(gulp.dest('meerkat_frontend/static/css/'));
});

// FONT TASKS
gulp.task('fonts', function() {
  return gulp.src([
      'bower_components/fontawesome/fonts/*',
      'bower_components/bootstrap-sass/assets/fonts/bootstrap/*'
    ])
    .pipe(gulp.dest('meerkat_frontend/static/fonts'));
});

// IMG TASKS
gulp.task('copyFlags', function() {
  return gulp.src([
      'bower_components/flag-icon-css/flags/**/*', 
      'meerkat_frontend/src/img/flags/**/*'
    ])
    .pipe(gulp.dest('meerkat_frontend/static/img/flags'));
});

gulp.task('copyMapMarkers', function() {
  return gulp.src(['bower_components/mapbox.js/images/**/*'])
    .pipe(gulp.dest('meerkat_frontend/static/css/images'));
});

gulp.task('img', function() {
  gulp.start('copyFlags', 'copyMapMarkers');
  return gulp.src([
    'meerkat_frontend/src/img/**/*.{gif,jpg,png}',
    'bower_components/Leaflet.fullscreen/src/*.png',
    'bower_components/intl-tel-input/build/img/*.png'
  ])
    .pipe(imagemin({
      optimizationLevel: 3,
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [
        pngquant(),
        optipng({
          optimizationLevel: 3
        }),
        jpegoptim({
          max: 50,
          progressive: true
        }),
      ]
    }))
    .pipe(gulp.dest('meerkat_frontend/static/img/'));
});

//COPY OTHER FILES
gulp.task( 'files', function(){
  return gulp.src(['meerkat_frontend/src/files/*',
                   'meerkat_frontend/src/files/**/*'])
    .pipe(gulp.dest('meerkat_frontend/static/files'));
});

// WATCH TASKS
gulp.task('watch', function() {
  var watchFiles = [
    'meerkat_frontend/src/js/*.js',
    'meerkat_frontend/src/img/**/*.{gif,png,jpg,svg}',
    'meerkat_frontend/src/sass/**/*.scss'
  ];
  gulp.watch(watchFiles, ['default']);
});

gulp.task('sass:watch', function() {
  gulp.watch('meerkat_frontend/src/sass/**/*', ['sass']);
});

// CLEAN TASKS
gulp.task('clean', function() {
  return del([
    'meerkat_frontend/src/sass/autogenerated/**/*',
    'meerkat_frontend/static/css/**/*',
    'meerkat_frontend/static/js/**/*',
    'meerkat_frontend/static/fonts/**/*',
    'meerkat_frontend/static/img/**/*.{gif,jpg,png,svg}',
  ]);
});

// DEFAULT TASK
gulp.task('default', ['clean'], function() {
  gulp.start('sass', 'js', 'fonts', 'img', 'files', 'vendor-css');
});
