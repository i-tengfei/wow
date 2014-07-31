'use strict';

var async = require( 'async' ),
	os = require( 'os' ),
	childProcess = require( 'child_process' );

var MPQ = require( './mpq' );

var path = 'D:/wow';

var MPQFiles = [
	{
		path: path + '/Data/texture.MPQ',
		priority: 1
	},{
		path: path + '/Data/model.MPQ',
		priority: 2
	},{
		path: path + '/Data/misc.MPQ',
		priority: 3
	},{
		path: path + '/Data/itemtexture.MPQ',
		priority: 4
	},{
		path: path + '/Data/interface.MPQ',
		priority: 5
	},{
		path: path + '/Data/sound.MPQ',
		priority: 6
	},{
		path: path + '/Data/world.MPQ',
		priority: 7
	},{
		path: path + '/Data/expansion1.MPQ',
		priority: 8
	},{
		path: path + '/Data/expansion2.MPQ',
		priority: 9
	},{
		path: path + '/Data/expansion3.MPQ',
		priority: 10
	},{
		path: path + '/Data/expansion4.MPQ',
		priority: 11
	},{
		path: path + '/Data/alternate.MPQ',
		priority: 12
	},{
		path: path + '/Data/zhCN/locale-zhCN.MPQ',
		priority: 13
	}
];

var fileSystem = module.exports = {

	start: function( callback ){

		async.mapLimit( MPQFiles, os.cpus( ).length - 1, function( item, next ){

			var child = childProcess.fork( 'lib/child', [ 'test' ] );
			
			child.send( {
				type: 'mpq',
				data: item
			} );

			child.on( 'message', function( data ){
				
				data = data.data;
				delete data.fd;
				var mpq = new MPQ( data.path );
				Object.keys( data ).forEach( function( x ){
					mpq[ x ] = data[ x ];
				} );
				child.kill( );
				next( null, mpq );

			} );

		}, function( err, mpqs ){
	
			fileSystem.archives = mpqs.sort( function( a, b ){
				return b.priority - a.priority;
			} );

			callback( );

		} );

	},

	find: function( file, callback ){

		( function next( ind ){

			fileSystem.archives[ ind ].readFile( file, function( data ){
				if( data ){
					// 有数据则返回
					callback( null, data );
				}else if( ind + 1 >= fileSystem.archives.length ){
					// 所有MPQ检索完毕，返回无数据
					callback( new Error( '未找到文件！' ) );
				}else{
					// 读取下一个MPQ
					next( ind + 1 );
				}
			} );

		} )( 0 );

	}

};