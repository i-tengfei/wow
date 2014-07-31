define( function( require, exports, module ) {

	var Events = require( 'ndi.events' );

	var elements = {};
	var eid = 0;

	function EventListener( element ){

		element.id || ( element.id = 'EventListener' + eid );
		var basis = element.id;
		var el = elements[ basis ];
		if( !el ){
			el = elements[ basis ] = new DomEvents( element );
			eid++;
		}
		return el;

	}

	EventListener.CONTEXT_MENU	= 'contextMenu';
	EventListener.MOUSE_WHEEL	= 'mouseWheel';

	EventListener.MOUSE_MOVE	= 'mouseMove';
	EventListener.MOUSE_DOWN	= 'mouseDown';
	EventListener.MOUSE_UP	= 'mouseUp';
	EventListener.MOUSE_OUT	= 'mouseOut';

	EventListener.KEY_DOWN	= 'keyDown';
	EventListener.KEY_UP		= 'keyUp';



	EventListener.TOUCH_START = 'touchStart';
	EventListener.TOUCH_MOVE = 'touchMove';
	EventListener.TOUCH_END = 'touchEnd';

	// --------------- Key Down --------------- //
	document.addEventListener( 'keydown', function( event ) {

		for( dom in elements ){
			var __this__ = elements[ dom ];
			__this__.__event.elementEvent = event;
			__this__.trigger( EventListener.KEY_DOWN, __this__.__event );
		}
	
	} );

	// --------------- Key Up --------------- //
	document.addEventListener( 'keyup', function( event ) {

		for( dom in elements ){
			var __this__ = elements[ dom ];
			__this__.__event.elementEvent = event;
			__this__.trigger( EventListener.KEY_UP, __this__.__event );
		}
		
	} );

	function DomEvents( element ) {
	
		this.element = element;
		this.__event = {};

		var __this__ = this;
		
		// --------------- Context Menu --------------- //
		element.addEventListener( 'contextmenu', function( event ) {

			event.preventDefault( );
			__this__.__event.elementEvent = event;
			__this__.trigger( EventListener.CONTEXT_MENU, __this__.__event );
	
		} );

		// --------------- MouseMove --------------- //
		element.addEventListener( 'mousemove', function( event ) {
			
			var e = __this__.__event;
			e.elementEvent = event;
			var nx = e.pageX = event.pageX, ny = e.pageY = event.pageY;
			
			e.screenX = event.screenX; e.screenY = event.screenY;
			e.offsetX = event.offsetX; e.offsetY = event.offsetY;

			e.dx = nx - e.ox;	e.dy = ny - e.oy;

			__this__.trigger( EventListener.MOUSE_MOVE, e );
			
			e.ox = nx;	e.oy = ny;
		
		} );

		// --------------- MouseWheel --------------- //
		// Chrome
		element.addEventListener( 'mousewheel', function( event ) {

			__this__.trigger( EventListener.MOUSE_WHEEL, event.wheelDelta > 0 ? 1 : -1, event );
		
		} );
		// FF
		element.addEventListener( 'DOMMouseScroll', function( event ) {

			__this__.trigger( EventListener.MOUSE_WHEEL, -event.detail > 0 ? 1 : -1, event );
		
		} );

		// --------------- Mouse Out --------------- //
		element.addEventListener( 'mouseout', function( event ) {

			if( __this__.checkFather( event ) ){
				__this__.__event.elementEvent = event;
				__this__.trigger( EventListener.MOUSE_OUT, __this__.__event );
			}
		
		} );

		// --------------- Mouse Down --------------- //
		element.addEventListener( 'mousedown', function( event ) {

			__this__.__event.elementEvent = event;
			__this__.trigger( EventListener.MOUSE_DOWN, __this__.__event );

		} );

		// --------------- Mouse Up --------------- //
		element.addEventListener( 'mouseup', function( event ) {

			__this__.__event.elementEvent = event;
			__this__.trigger( EventListener.MOUSE_UP, __this__.__event );
		
		} );


		// --------------- Touch --------------- //
		if( 'createTouch' in document ){

			element.addEventListener( 'touchstart', function( event ){

				event.preventDefault( );
				var e = __this__.__event;
				e.elementEvent = event;
				e.ox = event.touches[ 0 ].pageX;
				e.oy = event.touches[ 0 ].pageY;
				__this__.trigger( EventListener.TOUCH_START, e );

			}, false );

			element.addEventListener( 'touchmove', function( event ){

				event.preventDefault( );
				var e = __this__.__event;
				e.elementEvent = event;

				event = event.touches[ 0 ];

				var nx = e.pageX = event.pageX, ny = e.pageY = event.pageY;
				
				e.screenX = event.screenX; e.screenY = event.screenY;
				e.offsetX = event.offsetX; e.offsetY = event.offsetY;

				e.dx = nx - e.ox;	e.dy = ny - e.oy;

				__this__.trigger( EventListener.TOUCH_MOVE, e );
				
				e.ox = nx;	e.oy = ny;

			}, false );

			element.addEventListener( 'touchend', function( event ){

				event.preventDefault( );
				__this__.__event.elementEvent = event;
				__this__.trigger( EventListener.TOUCH_END, __this__.__event );

			}, false );

		}

	}

	Events.mixTo( DomEvents );

	DomEvents.prototype.getEvent = function( ){
		return this.__event;
	};

	DomEvents.prototype.checkFather = function( e ){

		var parent = e.relatedTarget,
		element = this.element;
		
		try {
			while ( parent && parent !== element ) {
				parent = parent.parentNode; 
			}
			return (parent !== element);
		} catch( e ) { }

	};

	module.exports = EventListener;

} );