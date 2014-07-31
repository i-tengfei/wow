define( function( require, exports, module ) {

	var Events = require( 'ndi.events' );
	var KeyManager = require( 'ndi.key-manager' );
	var EventListener = require( 'ndi.event-listener' );

	function Sensor( element ){

		var keyManager = new KeyManager( element );
		keyManager.bindKey( 0, keyManager.LEFT );
		keyManager.bindKey( 1, keyManager.MIDDLE );
		keyManager.bindKey( 2, keyManager.RIGHT );
			
		var domEvents = keyManager.domEvents;

		var documentKeyManager = new KeyManager( document );
		documentKeyManager.bindKey( 0, keyManager.LEFT );
		documentKeyManager.bindKey( 1, keyManager.MIDDLE );
		documentKeyManager.bindKey( 2, keyManager.RIGHT );
		
		var documentEvents = documentKeyManager.domEvents;

		this.leftDown = false;
		this.rightDown = false;
		this.bounds = false;

		var __this__ = this;

		keyManager.on( keyManager.KEY_DOWN, function( name, event ) {

			if ( keyManager.isContainedOne( keyManager.LEFT ) ) {
				__this__.leftDown = true;
				__this__.trigger( 'sensor.left_down', event );
				__this__.trigger( 'sensor.down', event );
			}
		
			if ( keyManager.isContainedOne( keyManager.MIDDLE ) ) {
				__this__.trigger( 'sensor.middle_down', event );
			}
		
			if ( keyManager.isContainedOne( keyManager.RIGHT ) ) {
				__this__.rightDown = true;
				__this__.trigger( 'sensor.right_down', event );
			}
		
		} );

		keyManager.on( keyManager.KEY_UP, function( name, event ) {

			if ( name === keyManager.LEFT ) {
				__this__.trigger( 'sensor.left_up', event );
				__this__.trigger( 'sensor.up', event );
			}
			if ( name === keyManager.RIGHT ) {
				__this__.trigger( 'sensor.right_up', event );
			}
		
		} );

		documentEvents.on( EventListener.MOUSE_MOVE, move );
		documentEvents.on( EventListener.TOUCH_MOVE, move );

		documentKeyManager.on( keyManager.KEY_UP, function( name, event ) {

			if ( name === keyManager.LEFT ) {
				__this__.leftDown = false;
			}
			if ( name === keyManager.RIGHT ) {
				__this__.rightDown = false;
			}
		
		} );

		domEvents.on( EventListener.TOUCH_START, function( event ){

			__this__.leftDown = true;

		} );

		documentEvents.on( EventListener.TOUCH_END, function( event ){

			__this__.leftDown = false;

		} );

		domEvents.on( EventListener.MOUSE_WHEEL, function( delta, event ) {

			__this__.trigger( 'sensor.wheel', delta, event );
			event.preventDefault( );
		
		} );

		function move( event ){

			__this__.trigger( 'sensor.move', event );
			if ( keyManager.isContainedOne( keyManager.LEFT ) ) {
				__this__.trigger( 'sensor.left_drag', event );
				__this__.trigger( 'sensor.drag', event );
			}else if( !__this__.bounds && __this__.leftDown ){
				__this__.trigger( 'sensor.left_drag', event );
				__this__.trigger( 'sensor.drag', event );
			}

			if ( keyManager.isContainedOne( keyManager.RIGHT ) ) {
				__this__.trigger( 'sensor.right_drag', event );
			}else if( !__this__.bounds && __this__.rightDown ){
				__this__.trigger( 'sensor.right_drag', event );
			}

		}
		
	}

	Events.mixTo( Sensor );

	module.exports = Sensor;

} );