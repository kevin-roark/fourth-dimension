build:
	browserify js/main.js -t babelify -o js/build.js

watch:
	watchify js/main.js -v -t babelify -o js/build.js

prod:
	browserify js/main.js -t babelify -o js/build.js
	minify js/build.js > js/build.min.js
	minify css/main.css > css/main.min.css

serve:
	serve -p 4004 ./

beef:
	beefy js/main.js 4005 -t babelify -o js/build.js --live
