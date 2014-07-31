define( function( require, exports, module ) {

	var RENDER = require( 'ndi.render' ),
		Base = require( 'ndi.base' );


	var loader = new RENDER.JSONLoader( );

	function Geometry( nid, app, options ){
		
		RENDER.Geometry.call( this );

		this.defaults = {
			shape: undefined,
			attrs: undefined,

			vertices: undefined,
			normals: undefined,
			colors: undefined,
			uvs: undefined,
			faces: undefined,
		};
		Base.call( this, nid, app, options );

		var shape = this.options.shape,
			attrs = this.options.attrs;

		if( shape ){
			RENDER[ shape + 'Geometry' ].apply( this, attrs );
		}else{
			var geometry = loader.parse( options ).geometry;
			Object.keys( geometry ).forEach( function( x ){
				this[ x ] = geometry[ x ];
			}.bind( this ) );
		}

	}

	var geometryProto = Object.create( RENDER.Geometry.prototype );
	Object.keys( Base.prototype ).forEach( function( attr ){
		geometryProto[ attr ] = Base.prototype[ attr ];
	} );
	Geometry.prototype = geometryProto;

	module.exports = Geometry;
	
} );