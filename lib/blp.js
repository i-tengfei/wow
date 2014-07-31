'use strict';

var Parser = require( './parser' );

function BLP( buffer ){

    var bfs = this.unpack( buffer.slice( 0, 20 ), '<4sI4B2I' );
    console.log( bfs );

    this.magic 			= bfs[ 0 ];
    this.type 			= bfs[ 1 ];
    this.compression	= bfs[ 2 ];
    this.alphaDepth 	= bfs[ 3 ];
    this.alphaEncoding	= bfs[ 4 ];
    this.hasMipMaps		= bfs[ 5 ];
    this.x				= bfs[ 6 ];
    this.y				= bfs[ 7 ];

    this.mipMapsOffsets = this.unpack( buffer.slice( 20, 20 + 4 * 16 ), '<16I' );
    this.mipMapsSizes = this.unpack( buffer.slice( 20 + 4 * 16, 20 + 4 * 16 * 2 ), '<16I' );
    this.palette = this.unpack( buffer.slice( 20 + 4 * 16 * 2, 20 + 4 * 16 * 2 + 256 * 4 ), '<256I' );

    console.log( this.mipMapsOffsets );
    console.log( this.mipMapsSizes );

}

BLP.prototype = Object.create( Parser.prototype );

BLP.prototype.toRGBA = function( ){
    
	if( this.compression === 1 ){

	}else if( this.compression === 2 ){
		
	}

};

module.exports = BLP;