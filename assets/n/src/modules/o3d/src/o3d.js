define( function( require, exports, module ) {

	var RENDER = require( 'ndi.render' ),
		Base = require( 'ndi.base' );

	function O3d( nid, app, options ){

		this.defaults = {
            position: [0,0,0],
            rotation: [0,0,0]
		};
		Base.call( this, nid, app, options );
		
		options = this.options;

		RENDER.Object3D.call( this );
        
        this.pos( options.position );
        this.rot( options.rotation );
	}

	var o3dProto = Object.create( RENDER.Object3D.prototype );
	Object.keys( Base.prototype ).forEach( function( attr ){
		o3dProto[ attr ] = Base.prototype[ attr ];
	} );
	O3d.prototype = o3dProto;

	module.exports = O3d;
	
} );