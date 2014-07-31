'use strict';

var Parser = require( './parser' ),
    zlib = require( './zlib' );

function ADT( terrain, texture ){

    this.headers = [];
    this.terrain = [];
    this.textures = [];
    this.layers = [];
    this.normals = [];

    this.read( terrain );
    this.read( texture );

}

ADT.prototype = Object.create( Parser.prototype );

ADT.prototype.size = 533.33333;

ADT.prototype.readMHDR = function( buffer ){
    // TODO: Header( 貌似已经弃用。。都是0 )
};

ADT.prototype.readMH2O = function( buffer ){
    // TODO: 貌似这里是解析水的。。。。
    // var bfs = this.unpack( buffer.slice( 0, 12 ), '<3I' );
    // var information = bfs[ 0 ],
    //     layerCount = bfs[ 1 ],
    //     ofsRender = bfs[ 2 ];
    // console.log( buffer.slice( 0, 256 ) );
};

ADT.prototype.readMFBO = function( buffer ){
    // TODO:
};


ADT.prototype.readMAMP = function( buffer ){
    this.unpack( buffer, '<I' );
};

ADT.prototype.readMTEX = function( buffer ){
    this.textures = buffer.toString( ).split( '\u0000' ).filter( function( x ){
        return !!x;
    } ).map( function( x ){
        return zlib.deflateSync( new Buffer( x ) ).toString( 'base64' ).replace( /\//g,'-' );
    } );
};

ADT.prototype.readMTXP = function( buffer ){

};

ADT.prototype.readMCNK = function( buffer ){

    var block = { next:0 };
    if( this.headers.length < 256 ){

        var header = this.unpack( buffer.slice( 0, 128 ), '<16I2H9I3f3I' );
        this.headers.push( {
            area: header[ 13 ],
            x: header[ 28 ],
            y: header[ 29 ],
            z: header[ 27 ]
        } );
        
        block = { next:128 };

    }

    var terrain = this.terrain,
        layers = this.layers,
        normals = this.normals;

    while( block.next < buffer.length ){
        block = this.readBlock( buffer, block.next );
        switch( block.name ){
            case 'MCVT':
                this.terrain = this.terrain.concat( this.readMCVT( block.data ) );
                break;
            case 'MCLY':
                layers.push( this.readMCLY( block.data ) );
                break;
            case 'MCAL':
                break;
            case 'MCSH':
                break;
            case 'MCNR':
                normals.push( this.readMCNR( block.data ) );
                break;
            case 'MCSE':
                break;
            case 'MCCV':
                break;
            case 'MCLV':
                break;
            default:
                console.log( block.name );
                break;
        }
    }

};

ADT.prototype.readMCVT = function( buffer ){

    return this.unpack( buffer, '<145f' );

};

ADT.prototype.readMCNR = function( buffer ){
    return this.unpack( buffer, '<3b' ).map( function( x ){
        return x / 127;
    } );
};

ADT.prototype.readMCLY = function( buffer ){
    return this.unpack( buffer, '<3Ii' );
};

ADT.prototype.readMCAL = function( buffer ){
    //Alpha maps for additional texture layers.
};

ADT.prototype.readMCSH = function( buffer ){
    // 阴影图 shadow map
};

ADT.prototype.readMCSE = function( buffer ){
    // 声音
};

ADT.prototype.readMCCV = function( buffer ){
    // 亮化顶点？
};

ADT.prototype.readMCLV = function( buffer ){
    // 亮化顶点？
};

module.exports = ADT;