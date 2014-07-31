'use strict';

var Parser = require( './parser' );

function WDT( buffer, type ){

    this.tiles = [];
    this.read( buffer );

}

WDT.prototype = Object.create( Parser.prototype );

WDT.prototype.readMPHD = function( buffer ){
    // 头部
    this.unpack( buffer, '<8I' );
};

WDT.prototype.readMAIN = function( buffer ){
    var tiles = this.tiles;
    for( var i = 0; i < 64; i ++ ){
        var tile = tiles[ i ] = [];
        for( var j = 0; j < 64; j ++ ){
            var arr = this.unpack( buffer.slice( i * 64 + j * 8, i * 64 + j * 8 + 8 ), '<2I' );
            tile.push( arr[ 0 ] );
        }
    }
};

module.exports = WDT;