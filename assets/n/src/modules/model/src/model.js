define( function( require, exports, module ) {

	var RENDER = require( 'ndi.render' ),
		Base = require( 'ndi.base' );

	function Model( nid, app, options ){

		this.defaults = {
			geometry: undefined,
			material: undefined,
            position: [0,0,0],
            rotation: [0,0,0]
		};
		Base.call( this, nid, app, options );
		
		options = this.options;
		var geometry = app.geometry( options.geometry );

		if( Array.isArray( options.material ) ){
			material = new RENDER.MeshFaceMaterial( options.material.map( function( x ){
				material = app.material( x );
				material.on( 'change', function( ){
					this.updateFaceMaterial( );
				}.bind( this ) );
				return material.current;
			} ) )
		}else{
			material = app.material( this.options.material );

			material.on( 'change', function( ){
				this.updateMaterial( );
			}.bind( this ) );
		}

		var mat = material.current,
			geo = geometry;

		RENDER.Mesh.call( this, geo, mat );
        
        this.pos( options.position );
        this.rot( options.rotation );

	}

	var modelProto = Object.create( RENDER.Mesh.prototype );
	Object.keys( Base.prototype ).forEach( function( attr ){
		modelProto[ attr ] = Base.prototype[ attr ];
	} );
	Model.prototype = modelProto;

	Model.prototype.animation = function( ){
		console.log( '模型' + this.nid + '做了一个动画！' )
	};
	Model.prototype.updateMaterial = function( ){
		
		return this;
	};
	Model.prototype.updateFaceMaterial = function( ){
		return this;
	};

	module.exports = Model;
	
} );