/**
 * Created by yujihu on 2018/10/18.
 */
var gulp = require("gulp"),
  sass = require("gulp-ruby-sass"),
  sourcemaps = require("gulp-sourcemaps"),
  minifyCss = require("gulp-minify-css"),
  uglify = require("gulp-uglify"),
  runSequence = require("gulp-run-sequence"),
  copy = require("gulp-copy"),
  cssBase64 = require("gulp-css-base64"),
  del = require("del"),
  browsersync = require("browser-sync").create(),
  autoprefixer = require('gulp-autoprefixer'),
  babel = require('gulp-babel'); // 用于ES6转化ES5

var DEVELOPMENT = true;
var argvs = process.argv.slice(3);
var port = (argvs[0] && argvs[0].slice(2)) || 8080; //端口号
var srcPath = "./src";
var buildPath = "build";
var config = require(srcPath + "/config");
/****************************server****************************/
gulp.task("server", ["sass"], function () {
  browsersync.init({
    server: {
      baseDir: srcPath,
      middleware: []
    },
    port: port
    //files:'./**/*.*'
  });

  gulp.watch(srcPath + "/sass/*.scss", ["sass"]);
  gulp.watch(srcPath + "/*.html").on("change", browsersync.reload);
  gulp.watch(srcPath + "/js/*.js").on("change", browsersync.reload);
});

gulp.task("sass", function () {
  sass(srcPath + "/sass/index.scss")
    .on("error", sass.logError)
    .pipe(sourcemaps.init())
    // .pipe(cssBase64())
    .pipe(autoprefixer({
      browsers: ['last 4 versions'], //兼容到IE8
    }))
    .pipe(sourcemaps.write("./maps"))
    .pipe(gulp.dest(srcPath + "/css"))
    .pipe(browsersync.stream({
      match: "**/*.css"
    }));
});
gulp.task("watch", function () {
  gulp.watch(srcPath + "/sass/*.scss", ["sass"]);
});
/**************************build****************************/
/**clean**/
gulp.task("clean", function () {
  del.sync(buildPath);
});
/**copy**/
var vendorJS = config.vendorJS.map(function (js) {
    return srcPath + "/" + js;
  }),
  vendorCSS = config.vendorCSS.map(function (css) {
    return srcPath + "/" + css;
  }),
  copyFiles = vendorJS
  .concat(vendorCSS)
  .concat([
    srcPath + "/**/*.html",
    srcPath + "/images/**/*.*",
    srcPath + "/css/**/*.css",
    srcPath + "/js/**/*.js"
  ]);
gulp.task("copy", ["sass"], function () {
  return gulp.src(copyFiles).pipe(copy(buildPath, {
    prefix: 2
  }));
});
/**compress**/
gulp.task("compress", ["compress:css", "compress:js"]);
gulp.task("compress:css", function () {
  return gulp
    .src(buildPath + "/css/**/*.css", {
      base: buildPath
    })
    .pipe(minifyCss())
    .pipe(gulp.dest(buildPath));
});

gulp.task("compress:js", function () {
  return gulp
    .src(buildPath + "/js/**/*.js", {
      base: buildPath
    })
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest(buildPath));
});
/**build**/
gulp.task("build", function () {
  runSequence("clean", "copy", "compress");
});