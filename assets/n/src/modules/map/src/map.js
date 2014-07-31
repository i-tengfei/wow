define( function( require, exports, module ) {

	var RENDER = require( 'ndi.render' );
	var Loader = require( 'ndi.loader' );
	var math = require( 'ndi.math' );

	function mix( from ){
		for( attr in hash ){
			from[ attr ] = ( from[ attr ] === undefined ? hash[ attr ].default : from[ attr ] );
		}
	}

	function Map( options, app, callback ){

		if ( typeof this === 'object' && !( this instanceof Map ) ) {
			return new Map( options, app, callback );
		}

		this.app = app;
		this.callback = callback;
		this.id = options.id;
		this.id || console.error( 'ID 不得为空！' );
		var isyun = RegExp( app.get( 'yunid' ) ).test( this.id );

		this.render = null;

		this.loaded = false;

		this.attributes = { };
		this.val( options );
		isyun && this.yun( ); 
	}

	Map.prototype.__init__ = function( ){

		var texture,
			attrs = this.attributes;

		var __this__ = this;

		var image = new Image( );
		
		image.src = attrs.image;
		image.onload = function( ){
			texture.needsUpdate = true;
			if( !__this__.loaded ){
				__this__.callback( __this__ );
				__this__.loaded = true;
			}
		};
		
		texture = new RENDER.Texture( image, this.getTextureValue( 'mapping' ), this.getTextureValue( 'wrapS' ), this.getTextureValue( 'wrapT' ), this.getTextureValue( 'magFilter' ), this.getTextureValue( 'minFilter' ), this.getTextureValue( 'format' ), this.getTextureValue( 'type' ), this.getTextureValue( 'anisotropy' ) );
		texture.name = this.getTextureValue( 'name' );
		texture.mipmaps = this.getTextureValue( 'mipmaps' );
		texture.offset = this.getTextureValue( 'offset' );
		texture.repeat = this.getTextureValue( 'repeat' );
		texture.generateMipmaps = this.getTextureValue( 'generateMipmaps' );
		texture.premultiplyAlpha = this.getTextureValue( 'premultiplyAlpha' );
		texture.flipY = this.getTextureValue( 'flipY' );
		texture.unpackAlignment = this.getTextureValue( 'unpackAlignment' );
		texture.sourceFile = this.getTextureValue( 'sourceFile' );

		this.render = texture;

	};

	Map.prototype.yun = function ( ) {
		
		var loader = new Loader( {
			url: this.app.get( 'yunHost' ) + '/map/' + this.id
		} );

		var __this__ = this;
		loader.on( 'complete', function( event ){
			
			__this__.val( event.data );

		} );
		loader.load( );

	};

	Map.prototype.val = function( options ) {

		var __this__ = this;
		var attrs = this.attributes;

		if( options !== undefined ){

			mix( options );
			this.set( options );
			this.__init__( );

		}else{

			var result = {};
			Object.keys( hash ).forEach( function( name ){
				result[ name ] = __this__.get( name );
			} );
			return result;

		}

	};

	Map.prototype.get = function( name ){

		return this.attributes[ name ];

	};

	Map.prototype.getTextureValue = function( name ){

		var result;

		var type = hash[ name ].setType;
		
		switch( type ){
			case 'value':
			case 'image':
				result = this.get( name );
				break;
			case 'const':
				result = hash[ name ].constant[ this.get( name ) ];
				break;
			case 'newConst':
				result = new hash[ name ].constant[ this.newConstName( name ) ];
				break;
			case 'vec2':
				result = math.arr2vec2( this.get( name ) );
				break;
		}

		return result;

	};

	Map.prototype.set = function( name, value ){

		if( typeof name === 'object' ){

			for( n in name ){
				this.set( n, name[ n ] )
			}

		}else{

			if( !hash.hasOwnProperty( name ) ){
				return this;
			}

			var result;
			
			var type = hash[ name ].setType;

			switch( type ){

				case 'value':
				case 'image':
					result = value;
					break;
				case 'const':
					result = hash[ name ].constant[ value ];
					break;
				case 'newConst':
					result = new hash[ name ].constant[ this.newConstName( name ) ];
					break;
				case 'vec2':
					result = math.arr2vec2( value );
					break;
			}

			var texture = this.render;
			if( texture ){

				if( texture.image && type === 'image' ){
					
					texture.image.src = result;

				}else{

					texture[ name ] = result
					texture.needsUpdate = true;

				}

			}

			this.attributes[ name ] = value;

		}

		return this;

	};


	Map.prototype.constName = function( type ){
		var value = this.attributes[ type ];
		var con = hash[ type ].constant;
		for( c in con ){
			if( con[ c ] === value ){
				return c;
			}
		}
	};

	Map.prototype.newConstName = function( type ){

		var value = this.attributes[ type ];
		var con = hash[ type ].constant;
		for( c in con ){
			if( value instanceof con[ c ] ){
				return c;
			}
		}
		return hash[ type ].default;

	};


	Map.config = [

		{
			name: 'name',
			cname: '名称',
			default: '',
			type: 'string',
			setType: 'value'
		},{
			name: 'image',
			cname: '图片',
			default: '',
			type: 'image',
			setType: 'image'
		},{
			name: 'mipmaps',
			cname: 'mipmaps',
			default: [],
			type: 'array',
			setType: 'value'
		},{
			name: 'mapping',
			cname: 'mapping',
			default: 'uv',
			type: 'select',
			setType: 'newConst',
			constant: {
				uv: RENDER.UVMapping,
				cubeReflection: RENDER.CubeReflectionMapping,
				cubeRefraction: RENDER.CubeRefractionMapping,
				sphericalReflection: RENDER.SphericalReflectionMapping,
				sphericalRefraction: RENDER.SphericalRefractionMapping
			},
			options: [
				{
					name: 'uv',
					value: 'uv'
				},{
					name: 'cubeReflection',
					value: 'cubeReflection'
				},{
					name: 'cubeRefraction',
					value: 'cubeRefraction'
				},{
					name: 'sphericalReflection',
					value: 'sphericalReflection'
				},{
					name: 'sphericalRefraction',
					value: 'sphericalRefraction'
				}
			]
		},{
			name: 'wrapS',
			cname: 'wrapS',
			default: 'clampToEdge',
			type: 'select',
			setType: 'const',
			constant: {
				repeat: RENDER.RepeatWrapping,
				clampToEdge: RENDER.ClampToEdgeWrapping,
				mirroredRepeat: RENDER.MirroredRepeatWrapping
			},
			options: [
				{
					name: 'repeat',
					value: 'repeat'
				},{
					name: 'clampToEdge',
					value: 'clampToEdge'
				},{
					name: 'mirroredRepeat',
					value: 'mirroredRepeat'
				}
			]
		},{
			name: 'wrapT',
			cname: 'wrapT',
			default: 'clampToEdge',
			type: 'select',
			setType: 'const',
			constant: {
				repeat: RENDER.RepeatWrapping,
				clampToEdge: RENDER.ClampToEdgeWrapping,
				mirroredRepeat: RENDER.MirroredRepeatWrapping
			},
			options: [
				{
					name: 'repeat',
					value: 'repeat'
				},{
					name: 'clampToEdge',
					value: 'clampToEdge'
				},{
					name: 'mirroredRepeat',
					value: 'mirroredRepeat'
				}
			]
		},{
			name: 'magFilter',
			cname: 'magFilter',
			default: 'linear',
			type: 'select',
			setType: 'const',
			constant: {
				nearest: RENDER.NearestFilter,
				nearestMipMapNearest: RENDER.NearestMipMapNearestFilter,
				nearestMipMapLinear: RENDER.NearestMipMapLinearFilter,
				linear: RENDER.LinearFilter,
				linearMipMapNearest: RENDER.LinearMipMapNearestFilter,
				linearMipMapLinear: RENDER.LinearMipMapLinearFilter
			},
			options: [
				{
					name: 'nearest',
					value: 'nearest'
				},{
					name: 'nearestMipMapNearest',
					value: 'nearestMipMapNearest'
				},{
					name: 'nearestMipMapLinear',
					value: 'nearestMipMapLinear'
				},{
					name: 'linear',
					value: 'linear'
				},{
					name: 'linearMipMapNearest',
					value: 'linearMipMapNearest'
				},{
					name: 'linearMipMapLinear',
					value: 'linearMipMapLinear'
				}
			]
		},{
			name: 'minFilter',
			cname: 'minFilter',
			default: 'linearMipMapLinear',
			type: 'select',
			setType: 'const',
			constant: {
				nearest: RENDER.NearestFilter,
				nearestMipMapNearest: RENDER.NearestMipMapNearestFilter,
				nearestMipMapLinear: RENDER.NearestMipMapLinearFilter,
				linear: RENDER.LinearFilter,
				linearMipMapNearest: RENDER.LinearMipMapNearestFilter,
				linearMipMapLinear: RENDER.LinearMipMapLinearFilter
			},
			options: [
				{
					name: 'nearest',
					value: 'nearest'
				},{
					name: 'nearestMipMapNearest',
					value: 'nearestMipMapNearest'
				},{
					name: 'nearestMipMapLinear',
					value: 'nearestMipMapLinear'
				},{
					name: 'linear',
					value: 'linear'
				},{
					name: 'linearMipMapNearest',
					value: 'linearMipMapNearest'
				},{
					name: 'linearMipMapLinear',
					value: 'linearMipMapLinear'
				}
			]
		},{
			name: 'anisotropy',
			cname: 'anisotropy',
			default: 1,
			type: 'number',
			setType: 'value'
		},{
			name: 'format',
			cname: '格式',
			default: 'RGBA',
			type: 'select',
			setType: 'const',
			constant: {
				alpha: RENDER.AlphaFormat,
				RGB: RENDER.RGBFormat,
				RGBA: RENDER.RGBAFormat,
				luminance: RENDER.LuminanceFormat,
				luminanceAlpha: RENDER.LuminanceAlphaFormat
			},
			options: [
				{
					name: 'alpha',
					value: 'alpha'
				},{
					name: 'RGB',
					value: 'RGB'
				},{
					name: 'RGBA',
					value: 'RGBA'
				},{
					name: 'luminance',
					value: 'luminance'
				},{
					name: 'luminanceAlpha',
					value: 'luminanceAlpha'
				}
			]
		},{
			name: 'type',
			cname: '类型',
			default: 'unsignedByte',
			type: 'select',
			setType: 'const',
			constant: {
				unsignedByte: RENDER.UnsignedByteType,
				byte: RENDER.ByteType,
				short: RENDER.ShortType,
				unsignedShort: RENDER.UnsignedShortType,
				int: RENDER.IntType,
				unsignedInt: RENDER.UnsignedIntType,
				float: RENDER.FloatType
			},
			options: [
				{
					name: 'unsignedByte',
					value: 'unsignedByte'
				},{
					name: 'byte',
					value: 'byte'
				},{
					name: 'short',
					value: 'short'
				},{
					name: 'unsignedShort',
					value: 'unsignedShort'
				},{
					name: 'int',
					value: 'int'
				},{
					name: 'unsignedInt',
					value: 'unsignedInt'
				},{
					name: 'float',
					value: 'float'
				}
			]
		},{
			name: 'offset',
			cname: '偏移',
			default: [0,0],
			type: 'array',
			setType: 'vec2'
		},{
			name: 'repeat',
			cname: '重复',
			default: [1,1],
			type: 'array',
			setType: 'vec2'
		},{
			name: 'generateMipmaps',
			cname: 'generateMipmaps',
			default: true,
			type: 'boolean',
			setType: 'value'
		},{
			name: 'premultiplyAlpha',
			cname: '预乘Alpha',
			default: false,
			type: 'boolean',
			setType: 'value'
		},{
			name: 'flipY',
			cname: '翻转',
			default: true,
			type: 'boolean',
			setType: 'value'
		},{
			name: 'unpackAlignment',
			cname: '解压对齐',
			default: 4,
			type: 'number',
			setType: 'value'
		},{
			name: 'sourceFile',
			cname: '源文件',
			default: '',
			type: 'string',
			setType: 'value'
		}

	];

	var hash = Map.config.hash = {};
	( function child( arr ){

		arr.forEach( function( x ){
			
			hash[ x.name ] = x;
			if( x.children && x.children.length ){
				child( x.children );
			}

		} );

	} )( Map.config );

	module.exports = Map;
	
} );