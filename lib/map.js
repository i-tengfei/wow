'use strict';

var async = require( 'async' );

var fileSystem = require( './filesystem' ),
	database = require( './database' ),
	ADT = require( './adt' ),
	WDT = require( './wdt' );

function Map( id ){
	
	var directory = this.directory = database.query( 'MAP', id ).directory;

	var wdtFile = 'World\\Maps\\' + directory + '\\' + directory + '.wdt';

	this.__fns__ = [];

	fileSystem.find( wdtFile, function( err, data ){
		this.tiles = ( new WDT( data ) ).tiles;
		this.__ready__ = true;
		this.__fns__.forEach( function( fn ){
			fn( );
		} );
		this.__fns__ = [];
	}.bind( this ) );

}

Map.prototype.load = function( x, z, level, callback ){

	if( typeof level === 'function' ){
		callback = level;
		level = 2;
	}

	if( this.__ready__ ){

		if( level === 0 ){ level = 1; }

		var files = [];

		var rows = level * 2 - 1;
		for( var i = 0; i < rows; i++ ){
			var fs = files[ i ] = [];
			for( var j = 0; j < rows; j++ ){
				var nx = ( x + ( i - level + 1 ) ),
					nz = ( z + ( j - level + 1 ) );
				var base = 'World\\Maps\\' + this.directory + '\\' + this.directory + '_' + nx + '_' + nz;
				fs.push( this.tiles[ nx ][ nz ] ?
					{ 
						terrain: base + '.adt',
						texture: base + '_tex0.adt'//,
						// texture1: base + '_tex1.adt'
					} :
					false 
				);
			}
		}

		var cnum = 0;
		( function next( i, j ){
			
			var terrain = files[ i ][ j ].terrain,
				texture = files[ i ][ j ].texture;

			files[ i ][ j ] = false;
			cnum ++;

			async.map( [ terrain, texture ], fileSystem.find.bind( fileSystem ), function( err, results ){

				files[ i ][ j ] = results ? new ADT( results[ 0 ], results[ 1 ] ) : false;
				
				i = i - 1;	// 探索左侧
				i >= 0	&& files[ i ][ j ] && typeof files[ i ][ j ].terrain === 'string' && next( i, j );

				i = i + 2;	// 探索右侧
				i < rows&& files[ i ][ j ] && typeof files[ i ][ j ].terrain === 'string' && next( i, j );
				
				i--;
				j = j - 1;	// 探索上侧
				j >= 0 	&& files[ i ][ j ] && typeof files[ i ][ j ].terrain === 'string' && next( i, j );
				
				j = j + 2;	// 探索下侧
				j < rows&& files[ i ][ j ] && typeof files[ i ][ j ].terrain === 'string' && next( i, j );

				if( !--cnum ){
					callback( files );
				}

			} );

		} )( level - 1, level - 1 );


	}else{
		this.__fns__.push( this.load.bind( this, x, z, level, callback ) )
	}

};

module.exports = Map;