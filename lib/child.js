var MPQ = require( './mpq' );

process.on( 'message', function( data ){

	switch( data.type ){
		case 'mpq':
			mpq( data.data );
			break;
	}

} );

function mpq( data ){
	var mpq = new MPQ( data.path, data.priority );
	mpq.parse( function( ){
		process.send( {
			type: 'mpq',
			data: mpq
		} );
	} );
}