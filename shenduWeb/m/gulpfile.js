var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass',function(){
    return gulp.src('./scss/*.scss').pipe(sass({outputStyle:'compact'}).on('error',sass.logError)).pipe(gulp.dest('./css/'));
})
gulp.task('watch',function(){
    gulp.watch('./scss/*.scss',['sass'])
    gulp.watch('./*.html',['sass'])
})
// expanded 手写
// nested  嵌套
// compact 独占单行
// compressed 压缩