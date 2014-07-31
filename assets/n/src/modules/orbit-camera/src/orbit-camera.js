define( function( require, exports, module ) {

	var RENDER = require( 'ndi.render' );
	var Base = require( 'ndi.base' );
	var math = require( 'ndi.math' );

	var PIXELS_PER_ROUND = 1800;

	function OrbitCamera( nid, view, options ){

		this.defaults = {
			r: 100,
			theta: 0,
			phi: Math.PI * 0.5,
			center: [ 0,0,0 ],
			damp: 0.1,
			rotateSpeed: 1,
			zoomSpeed: 1,
			panSpeed: 1,
		};
		RENDER.Camera.call( this );
		Base.call( this, nid, view.app, options );
		this.container = view.app.o3d( nid + '_container' );
		this.container.add( this );

		var sensor = view.sensor;

		this.attributes = { };
		this.positionWorld = new RENDER.Vector3( );
		this.rotationWorld = new RENDER.Euler( );

		this.val( this.options );

		this.damper = new math.Damper( {
			r: this.attributes.r,
			theta: this.attributes.theta,
			phi: this.attributes.phi,
			center: this.attributes.center
		}, this.attributes.damp );

		var __this__ = this;
		
		sensor.on( 'sensor.drag', function( event ){

			__this__.rotate( event.dx, event.dy );
		
		} );

		sensor.on( 'sensor.wheel', function( delta ){
			
			__this__.zoom( delta );
		
		} );

		sensor.on( 'sensor.right_drag', function( event ){

			__this__.pan( event.dx, event.dy );

		} );

		view.run( this.run.bind( this ) );

	}

	var cameraProto = Object.create( RENDER.Camera.prototype );
	Object.keys( Base.prototype ).forEach( function( attr ){
		cameraProto[ attr ] = Base.prototype[ attr ];
	} );
	OrbitCamera.prototype = cameraProto;

	OrbitCamera.prototype.val = function( options ){

		var attrs = this.attributes;
		if( options !== undefined ){

			attrs.r = math.check( options.r, 10 );
			attrs.theta = math.check( options.theta, 0 );
			attrs.phi = math.check( options.phi, Math.PI * 0.5 );
			attrs.center = new RENDER.Vector3( ).val( options.center || [ 0,0,0 ] );
			attrs.damp = math.check( options.damp, .05 );
			attrs.rotateSpeed = math.check( options.rotateSpeed, 1 );
			attrs.zoomSpeed = math.check( options.zoomSpeed, 1 );
			attrs.panSpeed = math.check( options.panSpeed, 1 );

		}else{

			return {
				
				damp: attrs.damp,
				r: attrs.r,
				theta: attrs.theta,
				phi: attrs.phi,
				center: attrs.center.val( )

			}

		}

	};

	OrbitCamera.prototype.set = function( attr, value ){

		var attrs = this.attributes;
		switch( attr ){
			case 'center':
				attrs[ attr ].val( value );
				break;
			default:
				attrs[ attr ] = value;
				break;
		}

	};

	OrbitCamera.prototype.run = function( camera ) {

		var attrs = this.attributes;
		if ( attrs.r < 0.001 ) return false;
		var minPhi = 0.0001, maxPhi = Math.PI, minTheta, maxTheta;
		attrs.phi = Math.max( minPhi, Math.min( maxPhi, attrs.phi ) );

		this.damper.damp = attrs.damp;
		var out = this.damper.run( attrs );

		var val = math.sph2cart( out.r, out.theta, out.phi );
		this.position.set( val[ 0 ], val[ 1 ], val[ 2 ] );
		this.lookAt( new RENDER.Vector3( ) );

		this.container.position.copy( out.center );
		this.container.updateMatrixWorld( true );

		this.positionWorld.getPositionFromMatrix( this.matrixWorld );
		this.rotationWorld.setFromRotationMatrix( this.matrixWorld );

	};

	OrbitCamera.prototype.rotate = function( x, y ){

		var attrs = this.attributes;

		attrs.theta -= 2 * Math.PI * x / PIXELS_PER_ROUND * attrs.rotateSpeed * 2;
		attrs.phi -= 2 * Math.PI * y / PIXELS_PER_ROUND * attrs.rotateSpeed * 2;

	};

	OrbitCamera.prototype.zoom = function( delta ){

		var attrs = this.attributes;
		var v = Math.pow( 0.95, attrs.zoomSpeed );

		if( delta < 0 ){
			attrs.r /= v;
		}else if( delta > 0 ){
			attrs.r *= v;
		}

	};

	OrbitCamera.prototype.pan = ( function ( x, y ){

		var distance = new RENDER.Vector3( );
		var normalMatrix = new RENDER.Matrix3( );

		return function( x, y ){

			var attrs = this.attributes;
			distance.set( -x, y, 0 );
			normalMatrix.getNormalMatrix( this.matrix );

			distance.applyMatrix3( normalMatrix );
			distance.multiplyScalar( attrs.r * 0.001 * attrs.panSpeed );

			attrs.center.add( distance );

		}

	} )( );

	module.exports = OrbitCamera;
	
} );