define( function( require, exports, module ) {

	var $ = require( 'jquery.jquery' );
	var zip = require( './zip/zip' );

	function upload( NDI ){

		NDI.createAction( 'uploadFiles', function( options, data, callback ){

			var __this__ = this;

			zip.zipFiles( data.files, function( zipped ){

				console.log( URL.createObjectURL( zipped ) );

				var formData = new FormData( );
				formData.append( 'resources', zipped, 'resources.zip' );

				// $.ajax( {

				// 	url: options.url,
				// 	type: 'POST',
				// 	data: formData,
				// 	dataType: 'json',
				// 	processData: false,
				// 	contentType: false,
				// 	success: function( data ){

						callback && callback( data );

				// 	}

				// } );

				if( options.uploadProgress ){

					// TODO 上传进度扩展！

				}

			}, function( name, current, total ){

				if( options.zipProgress ){
					__this__.cmd( options.zipProgress, {
						name: name,
						progress: Math.min( current / total, 1 ),
						current: current,
						total: total,
						rootData: data
					} );
				}

			} );

		} );

	}

	module.exports = upload;

} );