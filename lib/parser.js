'use strict';

var jspack = require( 'jspack' ).jspack;

function reverse( str ){
    return str.split( '' ).reverse( ).join( '' );
};

function Parser( ){

}

Parser.prototype.unpack = function( buffer, format ){
    return jspack.Unpack( format, buffer, 0 );
};

Parser.prototype.pack = function( buffer, format ){
    return jspack.Pack( format, buffer, 0 );
};

Parser.prototype.readBlock = function( buffer, start ){

    var bfs = this.unpack( buffer.slice( start, start + 8 ), '<4sI' ),
        size = bfs[ 1 ],
        next = start + 8 + size;

    return {
        name: reverse( bfs[ 0 ] ),
        size: size,
        data: buffer.slice( next - size, next ),
        next: next
    };

};

Parser.prototype.readMVER = function( buffer ){
    this.unpack( buffer, '<I' );
};

Parser.prototype.read = function( buffer ){

    var block = { next:0 };
    while( block.next < buffer.length ){
        block = this.readBlock( buffer, block.next );
        this[ 'read' + block.name ]( block.data );
    }

};

module.exports = Parser;