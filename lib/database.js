'use strict';

var async = require( 'async' );

var fileSystem = require( './filesystem' ),
	DBC = require( './dbc' );

var dbc = {
	MAP: 				'DBFilesClient\\Map.dbc',
	AREA_TABLE: 		'DBFilesClient\\AreaTable.dbc',
	WORLD_MAP_AREA: 	'DBFilesClient\\WorldMapArea.dbc',
	WORLD_MAP_CONTINENT:'DBFilesClient\\WorldMapContinent.dbc'
};

var db = {
	playerCreateInfo: 'playercreateinfo.json'
};


var database = module.exports = {

	start: function ( callback ) {

		Object.keys( db ).forEach( function( type ){

			db[ type ] = require( __dirname + '/../database/' + db[ type ] );

		} );

		async.each( Object.keys( dbc ), function( type, next ){

			fileSystem.find( dbc[ type ], function( err, data ){

				if( data ){
					dbc[ type ] = new DBC( data, type );
				}else{
					console.log( '未找到数据库: ' + type );
				}
				next( null );

			} );

		}, callback );

	},

	query: function( name, id ){

		var data = dbc[ name ];
		var table = data.table,
			records = data.records;

		for( var i = 0, il = table.length; i < il; i++ ){
			if( table[ i ][ 0 ] == id ){
				var result = {};
				table[ i ].forEach( function( x, ind ){
					result[ records[ ind ] ] = x;
				} );
				return result;
			}
		}

	}

};