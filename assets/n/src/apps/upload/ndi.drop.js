define( function( require, exports, module ) {

	var dragenter, dragover, dragleave, dropped;

	function drop( NDI ){

		NDI.drop = {
			ENTER: 'enter',
			OVER: 'over',
			OUT: 'out',
			DROPPED: 'dropped'
		}

		NDI.createAction( 'drop', function( options, data, callback ){

			var element = options.element || this.attributes.operator;
			this.__bindDrop( element );
			if( options.dropped ){

				options.dropped.commands.unshift( {
					action: '__dropped',
					options: { 
						element : element,
						inherit: 'all'
					}
				} );
				this.cmd( options.dropped, data );

			}else{

				this.__dropped( { element : element }, callback );

			}

		} );

		NDI.createAction( '__dropped', function( options, data, callback ){

			var __this__ = this;
			this.on( NDI.drop.DROPPED, function( files ){
				callback && callback( { files: files } );
				__this__.__unbindDrop( options.element );
			} );


		} );

		NDI.prototype.__bindDrop = ( function( ){

			var dropBound = false;
			return function( dom ){

				if( dropBound ){
					return;
				}
				dropBound = true;
				var __this__ = this;
				dragenter = function( event ){

					event.preventDefault( );
					__this__.trigger( NDI.drop.ENTER, event );

				};
				dragover = function( event ){

					event.preventDefault( );
					__this__.trigger( NDI.drop.OVER, event );

				};
				dragleave = function( event ){

					event.preventDefault( );
					__this__.trigger( NDI.drop.OUT, event );

				};
				dropped = function( event ){

					event.preventDefault( );
					__this__.trigger( NDI.drop.DROPPED, event.dataTransfer.files );

				};

				dom.addEventListener( 'dragenter', dragenter );
				dom.addEventListener( 'dragover', dragover );
				dom.addEventListener( 'dragleave', dragleave );
				dom.addEventListener( 'drop', dropped );
			
			}

		} )( );

		NDI.prototype.__unbindDrop = function( dom ){
			
			dom.removeEventListener( 'dragenter', dragenter  );
			dom.removeEventListener( 'dragover', dragover );
			dom.removeEventListener( 'dragleave', dragleave );
			dom.removeEventListener( 'drop', dropped );

		};

	}

	module.exports = drop;

} );