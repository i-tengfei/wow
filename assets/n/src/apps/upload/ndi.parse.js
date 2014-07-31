define( function( require, exports, module ) {

	var objConverter = require( './objConverter' );
	var daeConverter = require( './daeConverter' );
	var threedsConverter = require( './3DSConverter' );
	var TGA = require( 'cloud.tga' ).TGA;

	function parse( NDI ){

		NDI.createAction( 'filter', function ( options, data, callback ){

			var types = options.types || [
				'jpg', 'png', 'gif', 'tga',
				'obj', 'mtl',
				'dae', '3ds'
			];
			var mapReadLimit = options.mapReadLimit || 10;


			var files = data.files;

			function dataURL2BlobURL( dataURL ) {

				var sa = dataURL.split(',');
				var byteString = atob( sa[1] );

				var mimeString = sa[0].split(':')[1].split(';')[0];

				var ab = new ArrayBuffer(byteString.length);
				var ia = new Uint8Array(ab);

				for (var i = 0; i < byteString.length; i++) {
					ia[i] = byteString.charCodeAt(i);
				}

				return makeURL( ab, mimeString );

			}

			function makeURL( blob, type ) {

				if( blob instanceof ArrayBuffer ){

					var blob = new Blob( [ new DataView( blob ) ], { type: type } );
				
				}else if( blob instanceof Blob ){

				}else{
					console.error( '格式不正确！' );
				}
				return URL.createObjectURL( blob );

			}

			function readImage( file, callback ){

				if( file ){

					if( file.loadtype === 'tga' ){

						var tga = new TGA( );
						var reader = new FileReader( );
						reader.readAsArrayBuffer( file );
						reader.onload = function( ){

							callback( null, {
								name: file.name,
								url: dataURL2BlobURL( tga.getDataURL( 'image/png' ) )
							} );
							
						}

					}else{

						var reader = new FileReader( );
						reader.readAsArrayBuffer( file );
						reader.onload = function( ){

							callback( null, {
								name: file.name,
								url: makeURL( this.result )
							} );

						}

					}

				}else{

					callback( null, undefined );
					
				}


			}
			// 读取文本
			function readText( file, callback ){

				if( file ){

					var reader = new FileReader( );
					reader.readAsText( file );
					reader.onload = function( ){
						callback( null, this.result )
					}

				}else{

					callback( null, undefined );
					
				}

			}

			function readBinaryString( file, callback ){

				if( file ){

					var reader = new FileReader( );
					reader.readAsBinaryString( file );
					reader.onload = function( ){
						callback( null, this.result )
					}

				}else{

					callback( null, undefined );
					
				}

			}



			var list = {}, out = { files:[] };

			if( !files.length ){

				console.warn( '未读取到任何内容！' );
				return false;

			}

			for( var i = 0, il = files.length; i < il; i++ ){

				var file = files[ i ];
				var type = file.name.toLowerCase( ).split( '.' );

				type = type[ type.length-1 ];

				if( types.indexOf( type ) === -1 ){
					console.warn( '部分文件格式不支持！' );
					continue ;
				}else{
					out.files.push( file );
				}

				if( type === 'jpg' || type === 'png' || type === 'gif' || type === 'tga' ){
					file.loadtype = type;
					type = 'maps';
				}

				var arr = list[ type ] = list[ type ] || [ ];
				arr.push( file );

			}

			if( 
				( list[ 'obj' ] && list[ 'obj' ].length > 1 ) || 
				( list[ 'dae' ] && list[ 'dae' ].length > 1 ) || 
				( list[ '3ds' ] && list[ '3ds' ].length > 1 ) 
			){
				console.warn( '每次只能导入一个模型！' );
			}

			if( list[ 'obj' ] || list[ 'dae' ] || list[ '3ds' ] ){

				var maps = list.maps || [];
				// 解析图片
				NDI.async.mapLimit( maps || [], mapReadLimit, readImage, function( err, newMaps ){

					var newMapsHash = {};
					newMaps.forEach( function( x ){
						newMapsHash[ x.name ] = x.url;
					} );

					var hash = maps.hash = {};
					var urlHash = maps.urlHash = {};
					maps.forEach( function( x ){
						var url = newMapsHash[ x.name ];
						x.src = url;
						hash[ x.name ] = x;
						urlHash[ url ] = x;
					} );

					out.images = maps;
					out.modelFiles = [];

					// 解析obj文件
					if( list[ 'obj' ] ){

						var model = list[ 'obj' ][ 0 ];
						var material = list.mtl && list.mtl[ 0 ];

						out.type = 'obj';
						out.modelFiles.push( model );
						material && out.modelFiles.push( material );

						NDI.async.map( [ model, material ], readText, function( err, results ){

							out.model = results[ 0 ];
							out.material = results[ 1 ];

							callback && callback( out );

						} );

					// 解析dae文件
					}else if( list[ 'dae' ] ){

						var model = list[ 'dae' ][ 0 ];

						out.type = 'dae';
						out.modelFiles.push( model );

						NDI.async.map( [ model ], readText, function( err, results ){

							out.model = results[ 0 ];

							callback && callback( out );

						} );

					} else if( list[ '3ds' ] ) {

						var model = list[ '3ds' ][ 0 ];

						out.type = '3ds';
						out.modelFiles.push( model );

						NDI.async.map( [ model ], readBinaryString, function( err, results ){

							out.model = results[ 0 ];

							callback && callback( out );

						} );

					}

				} );

			}else{
				
				console.warn( '格式暂不支持即时解析！' );
				// TODO: 返回结果 并 上传服务器解析！
			}

		} );

		NDI.createAction( 'parse', function( options, data, callback ){

			var json;
			switch( data.type ){
				case 'obj':
					json = objConverter( data.model, data.material );
					break;
				case 'dae':
					json = daeConverter( ( new DOMParser( ) ).parseFromString( data.model, 'application/xml' ) );
					break;
				case '3ds':
					json = threedsConverter( data.model, data.material );
					break;

			}
			callback && callback( { json: json } );

		} );

		NDI.createAction( 'setMaterial', function( options, data, callback ){

			var images = data.images,
				mids = data.model.get( 'materials' ),
				mapTypes = [ 'map', 'lightMap', 'normalMap', 'specularMap', 'bumpMap' ];


			// 设置阴影
			if( options.shadow ){
				var mesh = data.model.render;
				mesh.castShadow = true;
				mesh.receiveShadow = true;
			}



			var materials = data.model.materials;
			var maps = [];

			for( var i = 0, len = materials.length; i < len; i ++ ){

				var attrs = materials[ i ].attributes;

				for( var j = 0; j < mapTypes.length; j++ ){

					var t = mapTypes[ j ];
					var map = attrs[ t ];

					if( map && images.hash[ map ] ) {

						maps.push( { name: map, index: i, type: t, url: images.hash[ map ].src } );

					}

				}

			}


			// 根据 ID 和 URL 创建新 Map 对象
			var __this__ = this;
			this.async.map( maps, function( map, next ){

				__this__.map( { id: map.name, image: map.url }, function( options, result ){

					materials[ map.index ].set( map.type, map.name );
					data.model.updateMap( );
					next( null, result.map );

				} );

			}, function( err, maps ){
				var hash = maps.hash = {};
				maps.forEach( function( x ){
					hash[ x.id ] = x;
				} );
				callback && callback( { maps: maps, materials: materials } );

			} );


		} );

	}

	module.exports = parse;

} );