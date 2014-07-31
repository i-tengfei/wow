define( function( require, exports, module ) {

	var ndi = require( 'ndi.ndi' );
	var RENDER = require( 'ndi.render' );
	var KeyManager = require( 'ndi.key-manager' );
	var async = require( 'ndi.async' );

	var documentKeyManager = new KeyManager( document );

	documentKeyManager.bindKey( 87, 'up' );
	documentKeyManager.bindKey( 83, 'down' );
	documentKeyManager.bindKey( 65, 'left' );
	documentKeyManager.bindKey( 68, 'right' );
    
    function pack( r,g,b,a ){
        return r + g * 256 + b * 256 * 256 + a * 256 * 256 * 256;
    }

	function parseBLP( buffer ) {

		var texture = new RENDER.CompressedTexture( );
		texture.needsUpdate = true;
		texture.mipmaps = [];

		var arr;
		var magic = String.fromCharCode.apply( null, new Uint8Array( buffer, 0, 4 ) );
		var type = new Uint32Array( buffer, 4, 1 )[ 0 ];
		arr = new Uint8Array( buffer, 8, 4 );
		var compression = arr[ 0 ];
		var alphaDepth = arr[ 1 ];
		var alphaEncoding = arr[ 2 ];
		var hasMipMaps = arr[ 3 ];
		arr = new Uint32Array( buffer, 12, 2 );
		var width = texture.image.width = arr[ 0 ];
		var height = texture.image.height = arr[ 1 ];

		var mipMapsOffsets = [].filter.call( new Uint32Array( buffer, 20, 16 ), function( x ){
			return !!x;
		} );
		var mipMapsSizes = [].filter.call( new Uint32Array( buffer, 20 + 16 * 4, 16 ), function( x ){
			return !!x;
		} );
		var palette = new Uint32Array( buffer, 20 + 16 * 4 * 2, 256 );

		if( compression === 2 ){
			switch( alphaDepth ){
				case 0:
				case 1:
					texture.format = RENDER.RGBA_S3TC_DXT1_Format;
					break;
				case 4:
				case 8:
					if( alphaEncoding === 1 ){
						texture.format = RENDER.RGBA_S3TC_DXT3_Format;
					}else if( alphaEncoding === 7 ){
						texture.format = RENDER.RGBA_S3TC_DXT5_Format;
					}
					break;

			}
		}else if( compression === 1 ){
			console.log( '未压缩！' );
		}

		for ( var i = 0; i < mipMapsOffsets.length; i ++ ) {
			
			var byteArray = new Uint8Array( buffer, mipMapsOffsets[ i ], mipMapsSizes[ i ] );
			var mipmap = { "data": byteArray, "width": width, "height": height };
			texture.mipmaps.push( mipmap );

			width = Math.max( width * 0.5, 1 );
			height = Math.max( height * 0.5, 1 );

		}

		texture.wrapS = RENDER.RepeatWrapping;
		texture.wrapT = RENDER.RepeatWrapping;

		return texture;

	};


	function Map( id, x, z, level, scene, callback ){

		var tx = Math.floor( ( 32 - ( x / this.size ) ) ),
			tz = Math.floor( ( 32 - ( z / this.size ) ) );

		this.x = x; this.z = z;
		this.tx = tx; this.tz = tz;

		this.scene = scene;

		this.level = level;

		var tiles = this.tiles = this.createGrids( tx, tz, 'loading' );
        
        var __this__ = this;
		ndi
			.load( '/map/' + id + '/' + x + '/' + z + '/' + level, {
				type: 'json'
			} )
			.progress( function( ){
				console.log( '地图加载中…' );
			} )
			.fail( function( ){
				console.log( '地图加载出错！' );
			} )
			.done( function( data ){
				
				console.log( '地图加载完成！' );

				var rows = level * 2 - 1;
				for( var i = 0; i < rows; i++ )
				for( var j = 0; j < rows; j++ ){
					var nx = ( tx + ( i - level + 1 ) ),
						nz = ( tz + ( j - level + 1 ) );
					var tileData = data[ i ][ j ];
					var tile = tiles[ nx ][ nz ] = Tile( tileData.terrain, tileData.headers, tileData.textures, tileData.layers );
				    scene.add( tile );
				}
				__this__.currentTile = tiles[ tx ][ tz ];
				callback( );

			} );

	}

	Map.prototype.size = 533.33333;

	Map.prototype.update = function( x, z ){

		this.x = x; this.z = z;

		var tx = Math.floor( ( 32 - ( x / this.size ) ) ),
			tz = Math.floor( ( 32 - ( z / this.size ) ) );

		this.tx = tx; this.tz = tz;

		this.currentTile = this.tiles[ tx ][ tz ];

		var rows = this.level * 2 - 1;

		var tiles = this.tiles;
		this.createGrids( tx, tz, 'loading' ).forEach( function( arr, i ){
			arr.forEach( function( x, j ){
				if( x === 'none' ){
					this.scene.remove( tiles[ i ][ j ] );
					tiles[ i ][ j ] = x;
				}
			} );
		} );

		for( var i = 0; i < rows; i++ )
		for( var j = 0; j < rows; j++ ){
			var nx = ( tx + ( i - level + 1 ) ),
				nz = ( tz + ( j - level + 1 ) );
			if( nx <= 64 && nx > 0 && nz <= 64 && nz > 0 ){
				switch( this.tiles[ nx ][ nz ] ){
					case 'none':
						console.log( 'none' )
						tiles[ tx ][ tz ] = 'loading';
						ndi.load( '/map/' + id + '/' + x + '/' + z + '/1', {
							type: 'json'
						} )
						.done( function( data ){
							var tileData = data[ 0 ][ 0 ];
                            var tile = tiles[ tx ][ tz ] = Tile( tileData.terrain, tileData.headers, tileData.textures, tileData.layers );
							this.scene.add( tile );
						} )
						break;
					case 'loading':
						console.log( 'loading' )
						break;
					case 'complete':
						console.log( 'complete' )
						break;
				}
			}
		}

	};

	Map.prototype.createGrids = function( tx, tz, type ){

		var grids = [];
		for( var i = 0; i < 64; i++ ){
			var gs = grids[ i ] = [];
			for( var j = 0; j < 64; j++ ){
				gs[ j ] = 'none';
			}
		}

		var rows = this.level * 2 - 1;

		for( var i = 0; i < rows; i++ )
		for( var j = 0; j < rows; j++ ){
			var nx = ( tx + ( i - this.level + 1 ) ),
				nz = ( tz + ( j - this.level + 1 ) );
			if( nx <= 64 && nx > 0 && nz <= 64 && nz > 0 ){
				grids[ nx ][ nz ] = type
			}
		}

		return grids;

	};

	function Tile( heights, headers, textures, layers, callback ){
        
        var geometry = new RENDER.BufferGeometry( );

        var indexes = [], numbers = [];
        var num = 0;
        for( var n = 0; n < 256; n++ ){
            for( var i = 9; i < 145; i+=17 ){
                for( j = 0; j < 8; j++ ){
                    var lod = i + j + n * 145;
                    indexes.push( lod, lod - 8, lod - 9 );
                    indexes.push( lod, lod + 9, lod - 8 );
                    indexes.push( lod, lod + 8, lod + 9 );
                    indexes.push( lod, lod - 9, lod + 8 );
                    num+= 4;
                }
            }
        }

        var numbers = heights.map( function( x, i ){
            return i;
        } );

        var position = [];
        headers.forEach( function( x ){
            for( var i = 0; i < 145; i++ ){
                position.push( x.x, x.y, x.z );
            }
        } );
        // var position = [];
        // numbers.forEach( function( x ){
        // 	var a = x % 145;
        // 	var b = a % 17;
        // 	var header = headers[ Math.floor( x / 145 ) ];
        // 	if( b < 9 ){
        // 		position.push( header.x + b * -533.33333 / 16 / 8, header.y + heights[ x ], header.z + Math.floor( a / 17 ) * -533.33333 / 16 / 8 );
        // 	}else{
        // 		position.push( header.x + ( 0.5 + b % 9 ) * -533.33333 / 16 / 8, header.y + heights[ x ], header.z + ( Math.floor( a / 17 ) + 0.5 ) * -533.33333 / 16 / 8 )
        // 	}
        // } )

        geometry.attributes = {
            index: {
                itemSize: 1,
                array: new Uint16Array( indexes )
            },
            heights: {
                itemSize: 1,
                array: new Float32Array( heights )
            },
            numbers: {
                itemSize: 1,
                array: new Float32Array( numbers )
            },
            position: {
                itemSize: 3,
                array: new Float32Array( position )
            }
        };

        geometry.offsets = [];

        geometry.offsets.push( {
            start: 0,
            index: 0,
            count: num * 3
        } );

        var material = new RENDER.ShaderMaterial( {

            uniforms: RENDER.UniformsUtils.merge( [

                {
                    map: { type: 't', value: null }
                },

                RENDER.UniformsLib[ "common" ],
                RENDER.UniformsLib[ "fog" ],
                RENDER.UniformsLib[ "shadowmap" ]

            ] ),

            attributes: {
                heights: true,
                numbers: true
            },

            vertexShader: Tile.vertexShader,

            fragmentShader: [

                "uniform vec3 diffuse;",
                "uniform float opacity;",

                RENDER.ShaderChunk[ "color_pars_fragment" ],
                RENDER.ShaderChunk[ "map_pars_fragment" ],
                RENDER.ShaderChunk[ "lightmap_pars_fragment" ],
                RENDER.ShaderChunk[ "envmap_pars_fragment" ],
                RENDER.ShaderChunk[ "fog_pars_fragment" ],
                RENDER.ShaderChunk[ "shadowmap_pars_fragment" ],
                RENDER.ShaderChunk[ "specularmap_pars_fragment" ],

//                'uniform sampler2D textures[ 1 ];',

                "void main() {",

                    "gl_FragColor = vec4( diffuse, opacity );",

                    // RENDER.ShaderChunk[ "map_fragment" ],

                    "vec4 texelColor = texture2D( map, vUv );",
                    "gl_FragColor = gl_FragColor * texelColor;",

                    RENDER.ShaderChunk[ "alphatest_fragment" ],
                    RENDER.ShaderChunk[ "specularmap_fragment" ],
                    RENDER.ShaderChunk[ "lightmap_fragment" ],
                    RENDER.ShaderChunk[ "color_fragment" ],
                    RENDER.ShaderChunk[ "envmap_fragment" ],
                    RENDER.ShaderChunk[ "shadowmap_fragment" ],

                    RENDER.ShaderChunk[ "linear_to_gamma_fragment" ],

                    RENDER.ShaderChunk[ "fog_fragment" ],
//                    "gl_FragColor = vec4( 1.0,1.0,0.0, 1.0 );",

                "}"

            ].join( '\n' )

        } );

        material.fog = true;
        material.map = true;
        
        var tileMesh = new RENDER.Mesh( geometry, material );
        
		async.map( textures, function( x, next ){

			ndi.load( '/image/' + x, {
				type: 'arraybuffer'
			} ).done( function( mapData ){
				next( null, mapData )
			} );

		}, function( err, results ){

			textures = results.map( function( x ){
				return x ? parseBLP( x ) : null;
			} );
            
            material.uniforms.map.value = textures[0];
			
		} )

        return tileMesh;

	}
    
    Tile.vertexShader = [

        RENDER.ShaderChunk[ "map_pars_vertex" ],
        RENDER.ShaderChunk[ "lightmap_pars_vertex" ],
        RENDER.ShaderChunk[ "envmap_pars_vertex" ],
        RENDER.ShaderChunk[ "color_pars_vertex" ],
        RENDER.ShaderChunk[ "morphtarget_pars_vertex" ],
        RENDER.ShaderChunk[ "skinning_pars_vertex" ],
        RENDER.ShaderChunk[ "shadowmap_pars_vertex" ],

        'attribute float numbers;',
        'attribute float heights;',
        'float size = -533.34333 / 16.0 / 8.0;',
        'void main( ) {',

            // RENDER.ShaderChunk[ "map_vertex" ],
            
            'vec3 mapPosition;',
            'vec2 mapUV;',
            
            'float a = mod( numbers, 145.0 );',
            'float b = mod( a, 17.0 );',
            
            'mapPosition.y = heights;',
            
            'if( b < 9.0 ){',
                'mapPosition.x = b * size;',
                'mapPosition.z = floor( a / 17.0 ) * size;',
                'mapUV.x = b;',
                'mapUV.y = floor( a / 17.0 );',
            '}else{',
                'mapPosition.x = ( 0.5 + mod( b, 9.0 ) ) * size;',
                'mapPosition.z = ( 0.5 + floor( a / 17.0 ) ) * size;',
                'mapUV.x = ( 0.5 + mod( b, 9.0 ) );',
                'mapUV.y = ( 0.5 + floor( a / 17.0 ) );',
            '}',

            'vUv = mapUV * offsetRepeat.zw + offsetRepeat.xy;',

            'mapPosition = mapPosition + position;',

            'gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( mapPosition, 1.0 );',

        '}'

    ].join( '\n' );


	ndi( function( ){

		var app = this;

		app
			.view( 'testView' )
				.camera( 'testCamera', { r: 4 } );

		var map = new Map( 0, -132.493, -8949.95, 2, app.view( ), function( ){

			app
				.geometry( 'cube', {
					shape: 'Cube',
					attrs: [ 1,1,1 ]
				} ).end( )
				.material( 'forHero', {
					type: 'Basic',
					color: 0xFF0000
				} ).end( )
				.model( 'hero', {
					geometry: 'cube',
					material: 'forHero'
				} ).end( )
                .o3d( 'player', {
                    position: [-132.493, 83.56, -8949.95]
                } )
                    .add( 'testCamera' )
                    .add( 'hero' )
				.view( )
                    .add( 'player' ).view( )
					.fog = new RENDER.FogExp2( 0xFFFFFF, 0.004 );
            

            
            var pickingTexture = new RENDER.WebGLRenderTarget( window.innerWidth, window.innerHeight );
            pickingTexture.generateMipmaps = false;
            var pickingScene = new RENDER.Scene( );
            
            var oldMat = map.currentTile.material;
            var mat = new RENDER.ShaderMaterial( {
                
                uniforms: oldMat.uniforms,
                attributes: oldMat.attributes,
                
                vertexShader:  [
            
                    'attribute float numbers;',
                    'attribute float heights;',
                    'varying float vHeights;',
                    'float size = -533.34333 / 16.0 / 8.0;',
                    'void main( ) {',
                        'vec3 mapPosition;',
                        
                        'float a = mod( numbers, 145.0 );',
                        'float b = mod( a, 17.0 );',
                        
                        'mapPosition.y = heights;',
                        
                        'if( b < 9.0 ){',
                            'mapPosition.x = b * size;',
                            'mapPosition.z = floor( a / 17.0 ) * size;',
                        '}else{',
                            'mapPosition.x = ( 0.5 + mod( b, 9.0 ) ) * size;',
                            'mapPosition.z = ( 0.5 + floor( a / 17.0 ) ) * size;',
                        '}',
            
                        'mapPosition = mapPosition + position;',
                        
                        'vHeights = mapPosition.y;',
            
                        'gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( mapPosition, 1.0 );',
            
                    '}'
            
                ].join( '\n' ),
                
                fragmentShader: [
                    'vec4 unpack( float f )  {',
                        'float a = floor( f / ( 256.0 * 256.0 * 256.0 ) );',
                        'float b = floor( ( f - a * 256.0 * 256.0 * 256.0 ) / ( 256.0 * 256.0 ) );',
                        'float g = floor( ( f - b * 256.0 * 256.0 - a * 256.0 * 256.0 * 256.0 ) / ( 256.0 ) );',
                        'float r = mod( f, 256.0 );',
                        'return vec4( r,g,b,a ) / 256.0;',
                    '}',
                    
                    'varying float vHeights;',
                    
                    'void main( ) {',
    
                        'gl_FragColor = unpack( vHeights * 100.0 );',
    
                    '}'
    
                ].join( '\n' )
                
            } );
            
            pickingScene.add( new RENDER.Mesh( map.currentTile.geometry, mat ) );
            
			app.view( ).run( function( a ){

				if( documentKeyManager.isContainedOne( 'up' ) ){
                    
                    app.get( 'player' ).pos( ).x += .1;

				}

				if( documentKeyManager.isContainedOne( 'down' ) ){
                    
                    app.get( 'player' ).pos( ).x -= .1;

				}
                
                // 检测高度
                app.view( ).renderer.render( pickingScene, app.view( )._camera, pickingTexture );
                var pixelBuffer = new Uint8Array( 4 );
                var gl = app.view( ).renderer.getContext();
				gl.readPixels( 1, pickingTexture.height - 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelBuffer );
                
                console.log( pack.apply( null, pixelBuffer ) / 100 );
                

			} );

		} );

	} );

} );