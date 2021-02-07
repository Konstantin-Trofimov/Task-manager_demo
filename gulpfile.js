const { src, dest, parallel, series, watch } = require('gulp')
const browserSync  = require('browser-sync').create()
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS     = require('gulp-clean-css')
const imagemin     = require('gulp-imagemin')
const htmlmin      = require('gulp-htmlmin')
const rename       = require('gulp-rename')
const concat       = require('gulp-concat')
const uglify       = require('gulp-uglify-es').default
const newer        = require('gulp-newer')
const sass         = require('gulp-sass')
const del          = require('del')


const server = () => {
	browserSync.init({
		server: {
			baseDir: 'dist/'
		},
		notify: false,
		online: false
	})

	watch('app/**/*.html').on('change', browserSync.reload)
}

const html = () => {
	return src('app/*.html')
	.pipe(htmlmin({
		collapseWhitespace: true
	}))
	.pipe(dest('dist'))
	.pipe(browserSync.stream());
}

const scripts = () => {
	return src([
		'app/js/app.js'
	])
	.pipe(concat('app.min.js'))
	.pipe(uglify())
	.pipe(dest('app/js'))
	.pipe(dest('dist/js'))
	.pipe(browserSync.stream())
}

const styles = () => {
	return src('app/sass/*.sass')
	.pipe(sass())
	.pipe(rename('style.min.css'))
	.pipe(autoprefixer({
		overrideBrowserslist: ['last 10 versions'],
		grid: true
	}))
	.pipe(cleanCSS(({ level: { 1: { specialComments: 0 } } })))
	.pipe(dest('app/css'))
	.pipe(browserSync.stream())	
}

const images = () => {
	return src('app/images/**/*')
	.pipe(newer('dist/images'))
	.pipe(imagemin())
	.pipe(dest('dist/images'))
	.pipe(browserSync.stream())
} 

const cleanimg = () => {
	return del('dist/images/**/*', { force: true })
}

const icons = () => {
	return src('app/icons/**/*')
	.pipe(dest('dist/icons'))
	.pipe(browserSync.stream())
}

const fonts = () => {
	return src('app/fonts/**/*')
	.pipe(dest('dist/fonts'))
	.pipe(browserSync.stream())
}

const cleansass = () => {
	return del('app/sass/*.css');
}

const watcher = () => {
	watch('app/*.html').on('change', parallel(html))
	watch('app/sass/*.sass', series(styles, cleansass))
	watch(['app/**/*.js', '!app/**/*.min.js'], scripts)
	watch('app/images/**/*', images)
	watch('app/icons/**/*', icons)
	watch('app/fonts/**/*', fonts)
}

const build = parallel(html, scripts, styles, images, icons, fonts, server, watcher, cleansass)

exports.server    = server
exports.watcher   = watcher
exports.html      = html
exports.scripts   = scripts
exports.styles    = styles
exports.images    = images
exports.fonts     = fonts
exports.cleansass = cleansass
exports.cleanimg  = cleanimg

exports.default = build