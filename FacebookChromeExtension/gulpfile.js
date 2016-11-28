'use strict';

var gulp = require('gulp');
var bump = require('gulp-bump');
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var inject = require('gulp-inject');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var template = require('gulp-template');
var tsc = require('gulp-typescript');
var merge = require('merge2');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var insert = require('gulp-insert');
var sass = require('gulp-sass');
var Builder = require('systemjs-builder');
var del = require('del');
var fs = require('fs');
var path = require('path');
var join = path.join;
var runSequence = require('run-sequence');
var semver = require('semver');
var series = require('stream-series');
var plumber = require('gulp-plumber'); 
var debug = require('gulp-debug'); 
var wait = require('gulp-wait'); 

var express = require('express');
var serveStatic = require('serve-static');
var connect = require('gulp-connect'); 
var openResource = require('open');

var tinylr = require('tiny-lr')();
var connectLivereload = require('connect-livereload');


// --------------
// Configuration.
var APP_BASE = '/';

var PATH = {
    dest: {
        all: 'dist',
        dev: {
            all: 'dist/dev',
            app: 'dist/dev/app',
            app_config: [
                './dist/dev/app/systemjs.config.js',
                './dist/dev/app/startup.js'
            ],
            css: 'dist/dev/styles',
            lib: 'dist/dev/lib',
            ng2: 'dist/dev/lib/@angular', 
            rxjs: 'dist/dev/lib/rxjs',
            facebook: 'dist/dev/lib/ng2-facebook-sdk',
        },
        prod: {
            all: 'dist/prod',
            lib: 'dist/prod/lib'
        }
    },
    src: {
        app_config: [
            './systemjs.config.js',
            './app/startup.js',
        ],
        lib: [
            './node_modules/traceur/bin/traceur-runtime.js',
            './node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.js',
            './node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.js.map',
            './node_modules/reflect-metadata/Reflect.js',
            './node_modules/reflect-metadata/Reflect.js.map',
            './node_modules/systemjs/dist/system.src.js',
            './node_modules/core-js/client/shim.min.js',
            './node_modules/zone.js/dist/zone.js',
            './node_modules/fb/lib/fb.js',
            './bower_components/jquery/dist/jquery.min.js',
            './bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js'
        ],
        angular2: [
            './node_modules/@angular/**/*',
            './node_modules/ng2-bootstrap/**/*',
            './node_modules/moment/**/*',
            './node_modules/natural/**/*',
            './node_modules/nedb/**/*.js',
        ],
        classifier: { 
            app: [
                './classifier/**/*',
            ],
            resources: [
                './web_crawler/cnnArticles.db'
            ] 
        },
        rxjs: [
            './node_modules/rxjs/**/*.js'
        ],
        facebook: [
            './node_modules/ng2-facebook-sdk/**/*'
        ],
        chromeExtension: [
            './manifest.json',
            './icon.png', 
        ]
    }
};

var PORT = 5555;
var LIVE_RELOAD_PORT = 4002;

var HTMLMinifierOpts = {conditionals: true};

var tsAppProject = tsc.createProject('tsconfig.json', {
    typescript: require('typescript'),
});

var tsClassifierProject = tsc.createProject('tsconfig.json', {
    typescript: require('typescript'),
    declaration: true, 
    module: 'commonjs'
});

var semverReleases = ['major', 'premajor', 'minor', 'preminor', 'patch',
    'prepatch', 'prerelease'];

var sassConfig = {
     sassPath: './resources/sass',
     bootstrapDir: './bower_components/bootstrap-sass/assets/stylesheets',
     fontAwesomeDir: './bower_components/font-awesome/scss',
     bowerDir: './bower_components' 
}

// --------------
// Clean.

gulp.task('clean', function (done) {
    del(PATH.dest.all, done);
});

gulp.task('clean.dev', function (done) {
    del(PATH.dest.dev.all, done);
});

gulp.task('clean.app.dev', function (done) {
    // TODO: rework this part.
    del([join(PATH.dest.dev.all, '**/*'), '!' +
    PATH.dest.dev.lib, '!' + join(PATH.dest.dev.lib, '**/*'), '!' + join(PATH.dest.dev.all, 'manifest.json'), '!' + join(PATH.dest.dev.all, 'icon.png'), '!' + join(PATH.dest.dev.all, 'startup.js')], done);
});

gulp.task('clean.prod', function (done) {
    del(PATH.dest.prod.all, done);
});

gulp.task('clean.app.prod', function (done) {
    // TODO: rework this part.
    del([join(PATH.dest.prod.all, '**/*'), '!' +
    PATH.dest.prod.lib, '!' + join(PATH.dest.prod.lib, '*')], done);
});

gulp.task('clean.tmp', function (done) {
    del('tmp', done);
});

// --------------
// Build dev.

gulp.task('build.lib.dev', ['build.lib.vendor.dev'], function () {
    return gulp.src(PATH.src.lib)
        .pipe(plumber())
        .pipe(gulp.dest(PATH.dest.dev.lib));
});

gulp.task('build.lib.vendor.dev', function() {
    var sources = PATH.src.angular2
                          .concat(PATH.src.rxjs)
                          .concat(PATH.src.facebook)
                          .concat(PATH.src.rxjs)
                          .concat(PATH.src.chromeExtension); 
    return gulp.src(sources, {base: './node_modules/'})
        .pipe(plumber())
        .pipe(gulp.dest(PATH.dest.dev.lib));
});

gulp.task('build.js.app.dev', function () {
    var result = gulp.src(['./app/**/*.ts'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(tsAppProject());

    return result.js
        .pipe(sourcemaps.write())
        .pipe(template(templateLocals()))
        .pipe(gulp.dest(PATH.dest.dev.app));
});

gulp.task('build.js.classifier.dev', function() {
    var result = gulp.src(['./classifier/**/*.ts'], {base: '.'})
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(tsClassifierProject());
    
    return merge([
            result.dts.pipe(gulp.dest('.')), 
            result.js.pipe(gulp.dest('.')), 
        ]); 
}); 

gulp.task('build.classifier.dev', ['build.js.classifier.dev'], function() {
}); 

gulp.task('build.css.dev', function() {
    return gulp.src(['./app/**/*.sass', './app/**/*.scss'])
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(PATH.dest.dev.app));
});

gulp.task('build.app.config.dev', function () {
    return gulp.src(PATH.src.app_config)
        .pipe(gulp.dest(PATH.dest.dev.app));
});

gulp.task('build.assets.dev', ['build.app.config.dev', 'build.js.app.dev', 'build.css.dev'], function () {
    return gulp.src(['./app/**/*.html', './app/**/*.css'])
        .pipe(gulp.dest(PATH.dest.dev.app));
});

gulp.task('build.index.dev', function () {
    var target = gulp.src(injectableDevAssetsRef(), {read: false});
    return gulp.src(PATH.dest.dev.app + '/index.html')
        .pipe(inject(target, {transform: transformPath('dev')}))
        .pipe(template(templateLocals()))
        .pipe(gulp.dest(PATH.dest.dev.app));
});

gulp.task('build.app.dev', function (done) {
    runSequence('clean.app.dev', 'build.classifier.dev', 'build.assets.dev', 'build.index.dev', done);
});

gulp.task('build.dev', function (done) {
    runSequence('clean.dev', 'build.lib.dev', 'build.app.dev', done);
});


// --------------
// Version.

registerBumpTasks();

gulp.task('bump.reset', function () {
    return gulp.src('package.json')
        .pipe(bump({version: '0.0.0'}))
        .pipe(gulp.dest('./'));
});

// --------------
// Serve dev.

gulp.task('serve.dev', ['build.dev', 'livereload'], function () {
    watch('./app/**', function (e) {
        runSequence('build.app.dev', function () {
            notifyLiveReload(e);
        });
    });
    serveSPA('dev');
});

// --------------
// Livereload.

gulp.task('livereload', function () {
    tinylr.listen(LIVE_RELOAD_PORT);
});

// --------------
// Utils.

function notifyLiveReload(e) {
    var fileName = e.path;
    tinylr.changed({
        body: {
            files: [fileName]
        }
    });
}

function transformPath(env) {
    var v = '?v=' + getVersion();
    return function (filepath) {
        var filename = filepath.replace('/' + PATH.dest[env].all, '') + v;
        arguments[0] = join(APP_BASE, filename);
        return inject.transform.apply(inject.transform, arguments);
    };
}

function injectableDevAssetsRef() {
    var src = PATH.src.lib.map(function (path) {
        return join(PATH.dest.dev.lib, path.split('/').pop());
    });
    src = src.concat(PATH.dest.dev.app_config); 
    src.push(join(PATH.dest.dev.all, '**/*.css'));
    return src;
}

function getVersion() {
    var pkg = JSON.parse(fs.readFileSync('package.json'));
    return pkg.version;
}

function templateLocals() {
    return {
        VERSION: getVersion(),
        APP_BASE: APP_BASE
    };
}

function registerBumpTasks() {
    semverReleases.forEach(function (release) {
        var semverTaskName = 'semver.' + release;
        var bumpTaskName = 'bump.' + release;
        gulp.task(semverTaskName, function () {
            var version = semver.inc(getVersion(), release);
            return gulp.src('package.json')
                .pipe(bump({version: version}))
                .pipe(gulp.dest('./'));
        });
        gulp.task(bumpTaskName, function (done) {
            runSequence(semverTaskName, 'build.app.prod', done);
        });
    });
}

function serveSPA(env) {
    //var app;
    //app = express().use(APP_BASE, connectLivereload({port: LIVE_RELOAD_PORT}), serveStatic(join(__dirname, PATH.dest[env].all)));
    //app.all(APP_BASE + '*', function (req, res, next) {
    //    res.sendFile(join(__dirname, PATH.dest[env].all, 'index.html'));
   // });
   // app.listen(PORT, function () {
    //    openResource('http://localhost:' + PORT + APP_BASE);
    //});
    connect.server({
        name: 'App',
        root: 'dist/dev',
        port: PORT,
        livereload: true
    });
}
