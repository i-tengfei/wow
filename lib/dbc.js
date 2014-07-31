'use strict';

var Parser = require( './parser' );

var DBC_TYPES = {
    MAP: {
        // 249, 19
        format:     [ '<', '10I',                                                                                                                             'f',                'I',                  '2f',                               '5I'                                                                               ].join( '\n' ),
        records:    [      'ID', 'directory', 'instancetype', 'flags', 'isPVP', 'localName', 'areaTableID', 'hordeIntro', 'allianceIntro', 'loadingScreenID', 'miniMapIconScale', 'ghostEntranceMapID', 'ghostEntranceX', 'ghostEntranceY', 'timeOfDayOverride', 'expansionID', 'maxPlayers', 'numberOfPlayers', 'parentMapID' ],
        string:     [            1,                                             5,                          7,            8 ]
    },
    AREA_TABLE: {
        // 3764, 28
        format:     [ '<', '4I',                         '4A', '7I',                                 'f', '6I',                                    '2f',                                '6I',                                 '4A' ].join( '\n' ),
        records:    [      'ID', 'mapID', 'areaID', 'a', 'b',  'c', 'd', 'e', 'f', 'g', 'name', 'h', 'j', 'localName', 'k', 'l', 'text', 'm', 'n', 'minElevation', 'ambientMultiplier', 'text2', 'q', 'text3', 'r', 's', 't', 'u'  ],
        string:     [                                                                   10,               13  ]
    },
    WORLD_MAP_AREA : {
        // 258, 14
        format:     '<4I6f4I',
        records:    [ 'ID', 'mapID', 'areaID', 'areaName', 'locLeft', 'locRight', 'locTop', 'locBottom' ],
        string:     [ 3 ]
    },
    WORLD_MAP_CONTINENT : {
        // 6, 14
        format:     '<6I7f1I',
        records:    [ 'ID', 'mapID', 'leftBoundary', 'rightBoundary', 'topBoundary', 'bottomBoundary', 'continentOffsetX', 'continentOffsetY', 'scale', 'taxiMinX', 'taxiMinY', 'taxiMaxX', 'taxiMaxY' ],
        string:     [ ]
    }
};

function DBC( buffer, type ){

    var bfs = this.unpack( buffer.slice( 0, 20 ), '<4s4I' );

    this.magic          = bfs[ 0 ];
    this.recordCount    = bfs[ 1 ];
    this.fieldCount     = bfs[ 2 ];
    this.recordSize     = bfs[ 3 ];
    this.stringBlockSize= bfs[ 4 ];

    var recordCount = this.recordCount,
        recordSize = this.recordSize;

    var vl = recordCount * this.recordSize;
    
    var stringBlockOffset = 20 + vl;
    var table = this.table = [];
    var type = DBC_TYPES[ type ];
    this.records = type.records;
    for( var i = 0; i < recordCount; i++ ){
        var offset = 20 + i * recordSize;
        table.push( this.unpack( buffer.slice( offset, offset + recordSize ), type.format ) );
    }
    var stringBlock = buffer.slice( stringBlockOffset, stringBlockOffset + this.stringBlockSize );

    for( var i = 0; i < recordCount; i++ ){
        for( var j = 0, jl = type.string.length; j < jl; j++ ){
            var ind = type.string[ j ];
            var start = table[ i ][ ind ];
            table[ i ][ ind ] = stringBlock.slice( start, this.end( stringBlock, start ) ).toString( );
        }
    }

}

DBC.prototype = Object.create( Parser.prototype );

DBC.prototype.end = function( buffer, start ){

    for ( var  i = start, len = buffer.length; i < len; i++ ) {
        if ( buffer[ i ] == 0 ) {
            return i;
        }
    }

};

module.exports = DBC;