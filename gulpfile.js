var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var less        = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var reload      = browserSync.reload;

// var spritesmith = require('gulp.spritesmith');

// gulp.task('sprite', function () {
//   var spriteData = gulp.src('img/a*.png').pipe(spritesmith({
//     imgName: 'sprite.png',
//     cssName: 'sprite.css',
//     padding: 10
//   }));
//   return spriteData.pipe(gulp.dest('dist/'));
// });


// 静态服务器 + 监听 scss/html 文件
gulp.task('serve', ['less'], function() {
    browserSync.init({
        server: "./"
    });
});

gulp.watch("less/*.less", ['less']);
gulp.watch("*.html").on('change', reload);

// less编译后的css将注入到浏览器里实现更新
gulp.task('less', function() {
    return gulp.src("less/index.less")
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest("css"))
        .pipe(reload({stream: true}));
});


gulp.task('default', ['serve']);
