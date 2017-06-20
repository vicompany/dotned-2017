/* globals require: false, */

'use strict';

const gulp = require('gulp');

const watch = require('gulp-watch');
const util = require('gulp-util');

const uglify = require('gulp-uglify');
const babelify = require('babelify');
const browserify = require('browserify');

const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const atImport = require('postcss-import');
const autoprefixer = require('autoprefixer');
const cssnano = require('gulp-cssnano');

const browserSync = require('browser-sync').create();

const config = {
	isProduction: util.env._.includes('build') || util.env.production,
};

const paths = {
	src: './source',
	dist: './wwwroot/dist',
};

const copyFiles = [
	`${paths.src}/fonts/**/*`,
	`${paths.src}/img/**/*`,
];

gulp.task('copy', () => gulp
	.src(copyFiles, { base: paths.src })
	.pipe(gulp.dest(`${paths.dist}`))
);

gulp.task('scss', () => gulp
	.src(`${paths.src}/scss/**/*.scss`)
	.pipe(config.isProduction ? util.noop() : sourcemaps.init())
	.pipe(sassGlob())
	.pipe(sass())
	.pipe(postcss([
		atImport(),
		autoprefixer({
			browsers: ['last 2 versions'],
		}),
	]))
	.pipe(config.isProduction ? cssnano() : sourcemaps.write())
	.pipe(config.isProduction ? util.noop() : sourcemaps.write())
	.pipe(gulp.dest(`${paths.dist}/css`))
);

// gulp.task('js', () => gulp
// 	.src(`${paths.src}/js/main.js`)
// 	.pipe(babel({presets: ['es2015']}))
// 	.pipe(config.isProduction
// 		? uglify({ mangle: true })
// 		: util.noop()
// 	)
// 	.pipe(gulp.dest(`${paths.dist}/js`))
// );

gulp.task('js', function () {
	const b = browserify({
		entries: `${paths.src}/js/main.js`,
		debug: true,
	})
	.transform(babelify.configure({
		presets: ['es2015', 'es2016'],
	}));

	return b.bundle()
		.pipe(source('main.js'))
		.pipe(buffer())
		.pipe(config.isProduction
			? uglify({ mangle: true })
			: util.noop()
		)
		.pipe(gulp.dest(`${paths.dist}/js`));
});


gulp.task('serve', () => {
	browserSync.init({
		proxy: 'http://localhost:54372/demo',
	});
});

gulp.task('watch', () => {
	watch(`${paths.src}/scss/**/*.scss`, () => {
		gulp.start('scss');
	});

	watch(`${paths.src}/js/**/*.js`, () => {
		gulp.start('js');
	});

	watch(copyFiles, () => {
		gulp.start('copy');
	});

	watch(['./*.cshtml', './dist/**'], () => {
		browserSync.reload();
	});
});

gulp.task('default', ['copy', 'scss', 'serve', 'watch']);
gulp.task('build', ['copy', 'scss', 'js']);
