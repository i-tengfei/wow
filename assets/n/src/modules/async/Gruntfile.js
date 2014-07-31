module.exports = function( grunt ) {

	grunt.initConfig( {

		pkg: grunt.file.readJSON( 'package.json' ),
		target: grunt.option('target') || 'dev',

		scp: {
			options: {
				port: 16386,
				host: grunt.option('host') || 'source.ndijs.com',
				username: grunt.option('username') || 'test',
				password: grunt.option('password') || 'test',
				log: function( o ) {
					var dest = o.destination.replace( '/opt/source', '' );
					grunt.log.writeln( 'online ' + dest );
				}
			},
			assets: {
				files: [ {
					cwd: 'dist',
					src: '**/*',
					filter: 'isFile',
					dest: '/opt/source/<%= pkg.family %>/<%= pkg.name %>/<%= pkg.version %>'
				} ]
			}
		}

	} );

	grunt.loadGlobalTasks( 'spm-deploy' );
	grunt.registerTask( 'deploy', [ 'scp' ] );

};