'use strict';

 /*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\
( REQUIRED METHODS )
 \_______________*/

const   autoprefixer    = require('gulp-autoprefixer'),
        babel           = require('gulp-babel'),
        browserSync     = require('browser-sync').create(),
        concat          = require('gulp-concat'),
        cssnano         = require('gulp-cssnano'),
        debug           = require('gulp-debug'),
        del             = require('del'),
        gulp            = require('gulp'),
        imagemin        = require('gulp-imagemin'),
        less            = require('gulp-less'),
        notify          = require('gulp-notify'),
        order           = require('gulp-order'),
        plumber         = require('gulp-plumber'),
        remember        = require('gulp-remember'),
        rename          = require('gulp-rename'),
        replace         = require('gulp-replace'),
        sourcemaps      = require('gulp-sourcemaps'),
        uglify          = require('gulp-uglify');

 /*¯¯¯¯¯¯¯¯¯¯\
( DEVELOPMENT )
 \__________*/

// compile .css files from .less files, add prefixes in .css files and tracking errors in .less files
gulp.task('dev:less', function () {
    return gulp.src(['app/styles/less/*.less', '!app/styles/less/variables.less'], {since: gulp.lastRun('dev:less')})
        .pipe(plumber({
            errorHandler: notify.onError(function (error) {
                return {
                    title: 'Error in .less file',
                    message: error.message
                };
            })
        }))
        .pipe(debug({title: 'dev:less:src'}))
        .pipe(less())
        .pipe(debug({title: 'dev:less:less'}))
        .pipe(autoprefixer({
            browsers: [
                'last 10 Chrome versions',
                'last 10 Firefox versions',
                'last 2 Safari versions',
                'ie >= 10',
                'iOS >= 7',
                'Android >= 4.2'
            ],
            cascade: true
        }))
        .pipe(debug({title: 'dev:less:autoprefixer'}))
        .pipe(gulp.dest('app/styles/css'))
        .pipe(debug({title: 'dev:less:dest'}))
});

// concatenate .css files, make sourcemap in main.css file
gulp.task('dev:styles', function () {
    return gulp.src('app/styles/{css,libs}/*.css', {since: gulp.lastRun('dev:styles')})
        .pipe(debug({title: 'dev:styles:src'}))
        .pipe(remember('styles'))
        .pipe(debug({title: 'dev:styles:remember'}))
        .pipe(order([
            'app/styles/libs/*.css',
            'app/styles/css/reset.css',
            'app/styles/css/fonts.css',
            'app/styles/css/base.css',
            'app/styles/css/common.css',
            'app/styles/css/media.css'
        ], {base: './'}))
        .pipe(sourcemaps.init())
        .pipe(concat('main.css'))
        .pipe(debug({title: 'dev:styles:concat'}))
        .pipe(replace('../../', '../'))
        .pipe(debug({title: 'dev:styles:replace'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('app/styles'))
        .pipe(debug({title: 'dev:styles:dest'}))
});

// concatenate .js files, make sourcemap in main.js file
gulp.task('dev:scripts', function () {
    return gulp.src('app/scripts/{js,libs}/*.js', {since: gulp.lastRun('dev:scripts')})
        .pipe(debug({title: 'dev:scripts:src'}))
        .pipe(remember('scripts'))
        .pipe(debug({title: 'dev:scripts:remember'}))
        .pipe(order([
            'app/scripts/libs/*.js',
            'app/scripts/js/*.js'
        ], {base: './'}))
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(debug({title: 'dev:scripts:concat'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('app/scripts'))
        .pipe(debug({title: 'dev:scripts:dest'}))
});

// delete old .css, .js and .map files
gulp.task('dev:clean', function () {
    return del('app/{styles/{css/*.css,*.{css,map}},scripts/*.{js,map}}')
});

// build main.css and main.js files
gulp.task('dev:build', gulp.series('dev:clean', 'dev:less', gulp.parallel('dev:styles', 'dev:scripts')));

// watch changes in main.css and main.js files
gulp.task('dev:watch', function () {
    gulp.watch('app/styles/less', gulp.series('dev:less', 'dev:styles'));
    gulp.watch('app/scripts/js', gulp.series('dev:scripts'))
});

// reload page in real-time with browser-sync
gulp.task('dev:serve', function () {
    browserSync.init({
        server: 'app',
        notify: false
    });
    browserSync.watch('app').on('change', browserSync.reload);
});

// first launch and watch changes in main.css and main.js files
gulp.task('dev', gulp.series('dev:build', gulp.parallel('dev:watch', 'dev:serve')));

 /*¯¯¯¯¯¯¯¯¯¯¯\
( DISTRIBUTION )
 \___________*/

// copy fonts to distribution
gulp.task('dist:fonts', function () {
    return gulp.src('app/fonts/**/*.*')
        .pipe(debug({title: 'dist:fonts:src'}))
        .pipe(gulp.dest('dist/fonts'))
        .pipe(debug({title: 'dist:fonts:dest'}))
});

// minify and copy images to distribution
gulp.task('dist:images', function () {
    return gulp.src('app/images/**/*.*')
        .pipe(debug({title: 'dist:images:src'}))
        .pipe(imagemin({progressive: true}))
        .pipe(debug({title: 'dist:images:imagemin'}))
        .pipe(gulp.dest('dist/images'))
        .pipe(debug({title: 'dist:images:dest'}))
});

// minify, rename and copy main.css file to distribution
gulp.task('dist:styles', function () {
    return gulp.src('app/styles/main.css')
        .pipe(debug({title: 'dist:styles:src'}))
        .pipe(cssnano())
        .pipe(debug({title: 'dist:styles:cssnano'}))
        .pipe(rename({suffix: '.min'}))
        .pipe(debug({title: 'dist:styles:rename'}))
        .pipe(gulp.dest('dist/styles'))
        .pipe(debug({title: 'dist:styles:dest'}))
});

// transpile, uglify, rename and copy main.js file to distribution
gulp.task('dist:scripts', function () {
    return gulp.src('app/scripts/main.js')
        .pipe(debug({title: 'dist:scripts:src'}))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(debug({title: 'dist:scripts:babel'}))
        .pipe(uglify())
        .pipe(debug({title: 'dist:scripts:uglify'}))
        .pipe(rename({suffix: '.min'}))
        .pipe(debug({title: 'dist:scripts:rename'}))
        .pipe(gulp.dest('dist/scripts'))
        .pipe(debug({title: 'dist:scripts:dest'}))
});

// copy .html files to distribution
gulp.task('dist:html', function () {
    return gulp.src('app/index.html')
        .pipe(debug({title: 'dist:html:src'}))
        .pipe(replace('main.css', 'main.min.css'))
        .pipe(debug({title: 'dist:html:replace'}))
        .pipe(replace('main.js', 'main.min.js'))
        .pipe(debug({title: 'dist:html:replace'}))
        .pipe(gulp.dest('dist'))
        .pipe(debug({title: 'dist:html:dest'}))
});

// delete old distribution files
gulp.task('dist:clean', function () {
    return del('dist')
});

// make distribution files
gulp.task('dist', gulp.series(gulp.parallel('dist:clean', 'dev:build'), gulp.parallel('dist:fonts', 'dist:images', 'dist:styles', 'dist:scripts', 'dist:html')));
