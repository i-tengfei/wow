'use strict';

var fs = require( 'fs-extra' ),
    async = require( 'async' ),
    os = require( 'os' ),
    bigint = require( 'bigint' );

var Parser = require( './parser' ),
    zlib = require( './zlib' );

var FORMATS = {
    FILE_HEADER: '<4s2I2H4I',
    FILE_HEADER_EXT: 'q2h',
    USER_DATA_HEADER: '<4s3I',
    HASH_TABLE: '2I2HI',
    BLOCK_TABLE: '4I'
};

var HASH_TYPES = {
    'TABLE_OFFSET': 0,
    'HASH_A': 1,
    'HASH_B': 2,
    'TABLE': 3
};

var MPQ_FILE_IMPLODE = 0x00000100;
var MPQ_FILE_COMPRESS = 0x00000200;
var MPQ_FILE_ENCRYPTED = 0x00010000;
var MPQ_FILE_FIX_KEY = 0x00020000;
var MPQ_FILE_SINGLE_UNIT = 0x01000000;
var MPQ_FILE_DELETE_MARKER = 0x02000000;
var MPQ_FILE_SECTOR_CRC = 0x04000000;
var MPQ_FILE_EXISTS = 0x80000000;

function MPQ( path, priority ){
    // TODO: path 格式化
    this.priority = priority;
    this.path = path;
    this.fd = fs.openSync( this.path, 'r' );

}

MPQ.prototype = Object.create( Parser.prototype );

MPQ.prototype.parse = function( callback ){

    async.series( [
        this.readHeader.bind( this ),
        this.readHashTable.bind( this ),
        this.readBlockTable.bind( this )
    ], function( err, results ){
        callback && callback.call( results[ 3 ] );
    } )

};

MPQ.prototype.read = function( fd, options, callback ){
    var buffer = new Buffer( options.length );
    fs.read( fd, buffer, options.offset || 0, options.length, options.start || 0, callback );
};

MPQ.prototype.getHashEntry = function( filename ) {

    var hashTable = this.hashTable;

    var hash_a = this.hash( filename, 'HASH_A' );
    var hash_b = this.hash( filename, 'HASH_B' );

    for ( var i in hashTable ) {
        if ( hash_a === hashTable[ i ].hashA && hash_b === hashTable[ i ].hashB ) {
            return hashTable[ i ];
        }
    }
    return null;

};

MPQ.prototype.readMagic = function( callback ){

    this.read( this.fd, {
        length: 4
    }, function( err, bytes, buffer ){

        this.magic = buffer.toString( );
        callback( this.magic );

    }.bind( this ) )

};

MPQ.prototype.readUserDataHeader = function( callback ){

    this.read( this.fd, {
        length: 16
    }, function( err, bytes, buffer ){

        var unpacked = packer.unpack( buffer, FORMATS.USER_DATA_HEADER );
                
        this.userDataHeader = {
            magic:          unpacked[ 0 ],
            size:           unpacked[ 1 ],
            headerOffset:   unpacked[ 2 ],
            headerSize:     unpacked[ 3 ]
        };

        callback( this.userDataHeader )

    } )

};

MPQ.prototype.readFileHeader = function( callback, start ){

    this.read( this.fd, {
        start: start || 0,
        length: 32
    }, function( err, bytes, buffer ){

        var unpacked = this.unpack( buffer, FORMATS.FILE_HEADER );
        this.fileHeader = {
            magic:                  unpacked[ 0 ],
            size:                   unpacked[ 1 ],
            archived:               unpacked[ 2 ],
            formatVersion:          unpacked[ 3 ],
            sectorSizeShift:        unpacked[ 4 ],
            hashTableOffset:        unpacked[ 5 ],
            blockTableOffset:       unpacked[ 6 ],
            hashTableEntryCount:    unpacked[ 7 ],
            blockTableEntryCount:   unpacked[ 8 ],
        };
        callback( null, this.fileHeader );

    }.bind( this ) )

};

MPQ.prototype.readHeader = function( callback ){

    console.log( '正在读取文件头…' );

    this.readMagic( function( magic ){

        if( magic === 'MPQ\x1a' ){

            this.readFileHeader( callback );

        }else if( magic === 'MPQ\x1b' ){

            this.readUserDataHeader( function( userDataHeader ){

                this.readFileHeader( callback, userDataHeader.headerOffset );

            } );

        }

    }.bind( this ) );

};

MPQ.prototype.readTable = function( type, callback ){

    var format,
        offset,
        entryCount;
    var fileHeader = this.fileHeader;
    var userDataOffset = this.userDataHeader ? this.userDataHeader.headerOffset : 0
    if( type === 'hash' ){
        format = FORMATS.HASH_TABLE;
        offset = fileHeader.hashTableOffset + userDataOffset;
        entryCount = fileHeader.hashTableEntryCount;
    }else if( type === 'block' ){
        format = FORMATS.BLOCK_TABLE;
        offset = fileHeader.blockTableOffset + userDataOffset;
        entryCount = fileHeader.blockTableEntryCount;
    }

    var hashId = '(' + type + ' table)';
    var key = this.hash( hashId, 'TABLE' );

    this.read( this.fd, {
        start: offset,
        length: entryCount * 16
    }, function( err, bytes, rawData ){
        // TODO: 建立 cache 减轻CPU负担
        var cache = os.tmpdir( ) + '/' + encodeURIComponent( this.path + type );
        if( fs.existsSync( cache ) ){
            var data = fs.readFileSync( cache );
        }else{
            var data = this.decrypt( rawData, key );
            fs.outputFileSync( cache, data );
        }
        var ret = [];
        for ( var i = 0; i < entryCount; i++ ) {
            ret[ i ] = this.unpack( data.slice( i * 16, i * 16 + 16 ), format );
        }
        callback( ret );
    }.bind( this ) );

};

MPQ.prototype.encryptionTable = ( function ( ) {

    var seed = 0x00100001
    var table = {};

    for ( var i = 0; i < 256; i++ ) {
        var index = i;
        for ( var j = 0; j < 5; j++ ) {
            seed = ( seed * 125 + 3 ) % 0x2AAAAB;
            var temp1 = bigint( ( seed & 0xFFFF ) << 0x10 );

            seed = ( seed * 125 + 3 ) % 0x2AAAAB;
            var temp2 = bigint( seed & 0xFFFF );

            table[ index ] = bigint( temp1 | temp2 ).toNumber( );
            index += 0x100;
        }
    }

    return table;

} )( );

MPQ.prototype.hash = function( string, hashType ) {

    var seed1 = 0x7FED7FED;
    var seed2 = 0xEEEEEEEE;

    string = string.toUpperCase( );

    for ( var i in string ) {
        var chr = string.charAt( i ).charCodeAt( );
        var value = this.encryptionTable[ ( HASH_TYPES[ hashType ] << 8 ) + chr ];
        seed1 = bigint( value ).xor( seed1 + seed2 ).and( 0xFFFFFFFF ).toNumber( );
        seed2 = chr + seed1 + seed2 + ( seed2 << 5 ) + 3 & 0xFFFFFFFF;
    }
    return seed1;

};

MPQ.prototype.decrypt = function( dataBuffer, key ) {

    var encryptionTable = this.encryptionTable;

    var seed1 = bigint( key );
    var seed2 = bigint( 0xEEEEEEEE );

    var result = new Buffer( dataBuffer.length );
    result.fill( ' ' );

    var count = 0;

    var now = Date.now( );
    console.log( '耗效率开始…' );

    for ( var i = 0, len = dataBuffer.length / 4; i < len; i++ ) {
        seed2 = seed2.add( encryptionTable[ 0x400 + ( seed1 & 0xFF ) ] );
        seed2 = seed2.and( 0xFFFFFFFF );

        var value = bigint( this.unpack( dataBuffer.slice( i * 4, ( i + 1 ) * 4 ), "<I" )[ 0 ] );
        value = ( value.xor( seed1.add( seed2 ) ) ).and( 0xFFFFFFFF );

        seed1 = ( ( ( seed1.xor( - 1 ).shiftLeft( 0x15 ) ).add( 0x11111111 ) ).or( seed1.shiftRight( 0x0B ) ) );
        seed1 = seed1.and( 0xFFFFFFFF );
        seed2 = value.add( seed2 ).add( seed2.shiftLeft( 5 ) ).add( 3 ).and( 0xFFFFFFFF );

        result.writeUInt32BE( value.toNumber( ), count );
        count += 4;
    }

    console.log( '耗效率结束！用时:' + ( Date.now( ) - now ) / 1000 );

    return result;

};

MPQ.prototype.readHashTable = function( callback ){

    console.log( '正在读取HashTable…' );

    var hashTable = this.hashTable = [];
    this.readTable( 'hash', function( data ){
        for ( var i in data ) {
            var item = data[i];
            hashTable.push( {
                hashA:              item[0],
                hashB:              item[1],
                locale:             item[2],
                platform:           item[3],
                blockTableIndex:    item[4],
            } );
        }
        callback( null, hashTable );
    }.bind( this ) );

};

MPQ.prototype.readBlockTable = function( callback ){

    console.log( '正在读取BlockTable…' );

    var blockTable = this.blockTable = [];
    this.readTable( 'block', function( data ) {
        for ( var i in data ) {
            var item = data[i];
            blockTable.push( {
                offset:     item[0],
                archived:   item[1],
                size:       item[2],
                flags:      item[3],
            } );
        }
        callback( null, blockTable );
    }.bind( this ) );

};

MPQ.prototype.readFile = function( filename, callback ){

    var buffers = [];

    var blockTable = this.blockTable,
        fileHeader = this.fileHeader;

    var hashEntry = this.getHashEntry( filename );
    
    if ( !hashEntry ) {
        callback( null );
        return;
    }

    var blockEntry = blockTable[ hashEntry.blockTableIndex ];

    if ( blockEntry.flags & MPQ_FILE_EXISTS ) {

        if ( blockEntry.archived === 0 ) {
            callback( null );
            return;
        }
        if ( blockEntry.flags & MPQ_FILE_ENCRYPTED ) {
            callback( 'encryption not supported' );
            return;
        }

        var userDataOffset = this.userDataHeader ? this.userDataHeader.headerOffset : 0
        var offset = blockEntry.offset + userDataOffset;
        this.read( this.fd, {
            start: offset,
            length: blockEntry.archived
        },
        function( err, bytes, buffer ) {
            if ( ! ( blockEntry.flags & MPQ_FILE_SINGLE_UNIT ) ) {
                var sectorSize = 512 << fileHeader.sectorSizeShift;
                var sectors = Math.floor( blockEntry.size / sectorSize ) + 1;
                var crc = false;
                if ( blockEntry.flags & MPQ_FILE_SECTOR_CRC ) {
                    crc = true;
                    sectors += 1;
                }

                var positions = this.unpack( buffer.slice( 0, 4 * ( sectors + 1 ) ), '<' + ( sectors + 1 ) + 'I' );
                if( positions ){
                    for ( var i = 0; i < positions.length - ( crc ? 2 : 1 ); i++ ) {
                        var sector = buffer.slice( positions[ i ], positions[ i + 1 ] );
                        if( sector.length && ( blockEntry.flags & MPQ_FILE_COMPRESS ) && ( blockEntry.size > blockEntry.archived ) ){
                            sector = this.decompress( sector );
                            sector && buffers.push( sector );
                        }
                    }
                    callback( buffers.length ? Buffer.concat( buffers ) : null );
                }else{
                    callback( null );
                }
            } else {
                if( ( blockEntry.flags & MPQ_FILE_COMPRESS ) && ( blockEntry.size > blockEntry.archived ) ) {
                    buffer = this.decompress( buffer );
                }
                callback( buffer );
            };
        }.bind( this ) );
    } else {
        callback( null );
    };
};

MPQ.prototype.readFiles = function( callback ){

    console.log( '正在读取文件列表…' );

    if ( this.hashTable && this.blockTable ) {

        this.readFile( '(listfile)', function( buffer ){
            callback( null, buffer.toString( ).split( '\r\n' ) );
        }.bind( this ) )

    }

};

MPQ.prototype.decompress = function( data ){

    var type = data[ 0 ];
    if( type == 0 ){
        return data;
    }else if( type == 2 ){
        return zlib.inflateSync( data.slice( 1 ) );
    }else if( type == 16 ){
        console.log( 'bz2' );
        return null;
    }else{
        console.log( '未知的压缩类型：' + type );
        return null;
    }

};

MPQ.prototype.extract = function( ){

    var self = this;
    this.readFiles( function( err, files ){
        
        fs.mkdir( 'tmp', function( err ) {

            async.eachLimit( files, 10, function( item, callback ){
                
                var targetFile = 'tmp/' + item;

                self.readFile( item, function( data ){

                    if( data ){
                        fs.outputFile( targetFile, data, function( err ) {
                            callback( err );
                        } );
                    }else{
                        callback( );
                    }

                } );

            } );

        } );
        
    } );

};

module.exports = MPQ;

// var mpq = new MPQ( 'D:/wow/Data/base-Win.MPQ' );
// var mpq = new MPQ( 'D:/wow/Data/misc.MPQ' );
// var mpq = new MPQ( 'D:/wow/Data/alternate.MPQ' );
// var mpq = new MPQ( 'D:/wow/Data/expansion2.MPQ' );
// var mpq = new MPQ( 'D:/wow/SetupWin.mpq' );

// mpq.parse( function( ){
//     mpq.extract(  );
// } )