'use strict';

var fs = require( 'fs' ),
	async = require( 'async' ),
	express = require( 'express' );

var fileSystem = require( './lib/filesystem' ),
	database = require( './lib/database' ),
	zlib = require( './lib/zlib' ),
	Map = require( './lib/map' ),
	BLP = require( './lib/blp' );

var size = require( './lib/adt' ).prototype.size;

function Client( callback ){

	this.maps = [];

	fileSystem.start( function( ){

		console.log( '资源载入完毕！' );
		
		database.start( function( ){

			console.log( '数据库载入完毕！' );
			this.startServer( );
			callback && callback( );

		}.bind( this ) );

	}.bind( this ) );


}

Client.prototype.readMap = function( id, x, z, level, callback ){

	var maps = this.maps,
		map = maps[ id ] = maps[ id ] || new Map( id );

	map.load( x, z, level, callback );

};

Client.prototype.startServer = function( ){

	var __this__ = this;

	var app = this.app = express( );

	app.configure( function ( ) {
			
		app.use( express.static( __dirname + '/assets' ) );

	} );

	app.get( '/map/:map/:x/:z/:level', function( req, res ){
        
		var x = Math.floor( ( 32 - ( req.params.x / size ) ) ),
			z = Math.floor( ( 32 - ( req.params.z / size ) ) );

		__this__.readMap( req.params.map, x, z, req.params.level, res.send.bind( res ) );

	} );

	app.get( '/area/:id', function( req, res ){

		res.send( database.query( 'AREA_TABLE', req.params.id ) );

	} );

	app.get( '/image/:url', function( req, res ){
		
		fileSystem.find( zlib.inflateSync( new Buffer( req.params.url.replace( /-/g,'/' ), 'base64' ) ).toString( ), function( err, data ){
			res.send( data );
		} );

	} );

	// app.get( '/test/:map', function( req, res ){

	// 	__this__.readMapObject( mapValue.directory );

	// } )

	app.listen( 3000 );

};

module.exports = Client;