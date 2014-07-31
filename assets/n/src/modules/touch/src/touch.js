define( function( require, exports, module ) {

	var RENDER = require( 'ndi.render' );

	function touch( NDI ){
		
		NDI.prototype.events.touch = {
			LEFT_DOWN: 'touchLeftDown',
			LEFT_UP: 'touchLeftUp',
			LEFT_CLICK: 'touchLeftClick',
			RIGHT: 'rightTouch',
			OVER: 'touchOver',
			MOVE: 'touchMove',
			OUT: 'touchOut'
		}

		NDI.createAction( 'touch', function( options, data, callback ){

			var app = this;

			var abouts = [ ],
				events = this.events.touch,
				values = this.values = this.values || { },
				models = options.models.map( function( m ){
					var mod = app.getHash( m );
					abouts.push( mod )
					return mod.render;
				} );

			var mouseManager = this.enableMouse( ).mouseManager;

			var projector = this.__projector__ = new RENDER.Projector( ),
				raycaster = this.__raycaster__ = new RENDER.Raycaster( );

			mouseManager.on( mouseManager.MOVE, function( event ){

				var camera = app.__render__.camera,
					vector = new RENDER.Vector3( ( event.offsetX / app.width ) * 2 - 1, - ( event.offsetY / app.height ) * 2 + 1, -1 );

				projector.unprojectVector( vector, camera );
				
				raycaster.set( camera.position, vector.sub( camera.position ).normalize( ) );
				var intersects = raycaster.intersectObjects( models );
				
				if( intersects.length > 0 ){
					
					var event3D = app.__event3D__ = intersects[ 0 ];
					var obj = event3D.object;

					models.forEach( function( x, i ){
						
						var value = values[ x.id ] = values[ x.id ] || {},
							model = abouts[ i ];

						// OVER
						if( x === obj && !value.isOver ){
							value.isOver = true;
							model.trigger( events.OVER, event3D, event );
						}

						// MOVE
						if( x === obj ){
							model.trigger( events.MOVE, event3D, event );
						}

						// ELSE OUT
						if( x !== obj && value.isOver ){
							value.isOver = false;
							model.trigger( events.OUT, event3D, event );
						}

					} );

				}else{
					
					models.forEach( function( x, i ){

						var value = values[ x.id ] = values[ x.id ] || {},
							model = abouts[ i ];

						// ALL OUT
						if( value.isOver ){
							value.isOver = false;
							model.trigger( events.OUT, app.__event3D__, event );
						}

					} );

				}
			
			} );



			mouseManager.on( mouseManager.LEFT_DOWN, function( event ){

				models.forEach( function( x, i ){

					var value = values[ x.id ] = values[ x.id ] || {},
						model = abouts[ i ];

					// LEFT_DOWN
					if( value.isOver ){
						value.isDown = true;
						model.trigger( events.LEFT_DOWN, app.__event3D__, event );
					}

				} );

			} );

			mouseManager.on( mouseManager.LEFT_UP, function( event ){

				models.forEach( function( x, i ){

					var value = values[ x.id ] = values[ x.id ] || {},
						model = abouts[ i ];

					// LEFT_UP
					model.trigger( events.LEFT_UP, app.__event3D__, event );

					// LEFT_CLICK
					if( value.isOver ){
						if( value.isDown ){
							model.trigger( events.LEFT_CLICK, app.__event3D__, event );
						}
						value.isDown = false;
					}

				} );

			} );
			
			callback && callback( );

			return this;

		} );

	}

	module.exports = touch;
	
} );