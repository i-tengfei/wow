module.exports = function( grunt ) {

	var pkg = grunt.file.readJSON( 'package.json' );
	var alias = require( './devConfig' ).alias;

	for( m in alias ){
		pkg.spm.alias[ m ] = pkg.spm.alias[ m ] || alias[ m ].replace( 'dev/../../src/modules', pkg.name );
	}

	var apps = [ 'index' ];

	// ---------- ---------- | Qunit | ---------- ---------- //
	var qunit = {
		modules: [ 'src/modules/**/tests/*.html' ]
	};

	apps.forEach( function( x ){
		var app = qunit[ x ] = [ './tests/' + x + '.html' ]
	} );


	// ---------- ---------- | Transport | ---------- ---------- //
	var transport = {
		options : {
			paths : [ 'sea-modules' ],
			alias : pkg.spm.alias,
			debug : false
		},
		modules : {
			options : {
				idleading: '<%= pkg.name %>/'
			},
			files : [ {
				cwd : 'src/modules',
				src : [
					'async/src/async.js',
					'tween/src/tween.js',
					'events/src/events.js',
					'render/src/render.js',
					'math/src/math.js',
					'model/src/model.js',
					'material/src/material.js',
					'event-listener/src/event-listener.js',
					'key-manager/src/key-manager.js',
					'mouse-manager/src/mouse-manager.js',
					'orbit-camera/src/orbit-camera.js',
					'ndi/src/ndi.js'
				],
				dest : 'sea-modules/<%= pkg.name %>/'
			} ]
		}
	};

	apps.forEach( function( x ){
		var app = transport[ x ] = {};
		var files = app.files = [ {
			cwd : 'src/apps',
			dest : '.build/apps'
		} ];
		files[ 0 ].src = x + '/*';
	} );

	// ---------- ---------- | Concat | ---------- ---------- //
	var concat = {
		options : {
			paths : [ 'sea-modules' ],
			include : 'all'
		}
	};

	apps.forEach( function( x ){
		var app = concat[ x ] = {};
		app.options = {
			footer: ';seajs.use( "' + x + '/app" );'
		};
		var files = app.files = {};
		files[ '.build/assets/' + x + '/app.js' ] = [ '.build/apps/' + x + '/*.js' ];
	} );

	// ---------- ---------- | Uglify | ---------- ---------- //
	var uglify = {};
	apps.forEach( function( x ){
		var app = uglify[ x ] = { };
		app.src = '.build/assets/' + x + '/app.js';
		app.dest = '.build/assets/' + x + '/app-min.js';
	} );
	// ---------- ---------- | Less | ---------- ---------- //
	var less = {};
	apps.forEach( function( x ){
		var app = less[ x ] = { files : { } };
		app.files[ '.build/src/css/' + x + '.css' ] = 'src/less/' + x + '.less';
	} );

	// ---------- ---------- | CSSMin | ---------- ---------- //
	var cssmin = {};
	apps.forEach( function( x ){
		var app = cssmin[ x ] = { files : {} };
		app.files[ '.build/css/' + x + '.css' ] = [ '.build/src/css/' + x + '.css' ];
	} );

	// ---------- ---------- | HtmlBuild | ---------- ---------- //
	var htmlBuild = {};
	apps.forEach( function( x ){

		var app = htmlBuild[ x ] = {};
		app.src = 'src/html/' + x + '.html',
		app.dest = 'assets/' + x + '/index.html',
		app.options = {
			scripts: {
				app: [
					'sea-modules/<%= pkg.spm.alias.seajs %>.js',
					'.build/assets/' + x + '/app-min.js'
				]
			},
			styles: {
				app: [
					'.build/css/' + x + '.css'
				]
			}
		}

	} );


	// ---------- ---------- | Config | ---------- ---------- //
	grunt.initConfig( {

		pkg: pkg,
		qunit: qunit,
		transport : transport,
		concat : concat,
		uglify : uglify,
		less : less,
		cssmin : cssmin,
		htmlbuild: htmlBuild,
		clean : [ 'sea-modules/<%= pkg.name %>/', '.build' ]

	} );

	// ---------- ---------- | Load | ---------- ---------- //
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-cmd-transport' );
	grunt.loadNpmTasks( 'grunt-cmd-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-less' );
	grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
	grunt.loadNpmTasks( 'grunt-html-build' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );

	// ---------- ---------- | Register | ---------- ---------- //
	apps.forEach( function( x ){

		grunt.registerTask( x, [ 'qunit:' + x, 'transport:' + x, 'concat:' + x, 'uglify:' + x, 'less:' + x, 'cssmin', 'htmlbuild:' + x, 'clean' ] );

	} );

	grunt.registerTask( 'modules', [ 'qunit:modules', 'transport:modules', 'clean' ] );
	grunt.registerTask( 'notests', [ 'transport', 'concat', 'uglify', 'less', 'cssmin', 'htmlbuild', 'clean' ] );
	grunt.registerTask( 'default', [ 'qunit', 'transport', 'concat', 'uglify', 'less', 'cssmin', 'htmlbuild', 'clean' ] );


};