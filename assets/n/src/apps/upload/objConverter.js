define( function( require, exports, module ) {

	var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/;

	var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/;

	var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/;

	var face_pattern = /f( +[\d|\/]+)( [\d|\/]+)( [\d|\/]+)( [\d|\/]+)?/;

	var colors = [0xeeeeee, 0xee0000, 0x00ee00, 0x0000ee, 0xeeee00, 0x00eeee, 0xee00ee]

	function checkMat( name, materials ){

		for( var i = 0, il = materials.length; i < il; i++ ){
			if( name === materials[i].DbgName ){
				return i;
			}
		}

	}

	function parseMTL( text, materials ) {

		var lines = text.split( "\n" );
		var info = {};
		var delimiter_pattern = /\s+/;
		var materialsInfo = {};

		var index = 0;

		for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			line = line.trim();

			if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

				continue;

			}

			var pos = line.indexOf( ' ' );

			var key = ( pos >= 0 ) ? line.substring( 0, pos) : line;
			key = key.toLowerCase();

			var value = ( pos >= 0 ) ? line.substring( pos + 1 ) : "";
			value = value.trim();

			if ( key === "newmtl" ) {

				info = { DbgName: value };
				materialsInfo[ value ] = info;

			} else if ( info ) {

				if ( key === "ka" || key === "kd" || key === "ks" ) {

					var ss = value.split( delimiter_pattern, 3 );
					var arr = [ parseFloat( ss[0] ), parseFloat( ss[1] ), parseFloat( ss[2] ) ];

					if( key === "ka" ) {
						info[ 'colorAmbient' ] = arr;
					}

					if( key === "kd" ) {
						info[ 'colorDiffuse' ] = arr;
					}

					if( key === 'ks' ) {
						info[ 'colorSpecular' ] = arr;
					}

				} else if( key === 'map_ka' || key === 'map_kd' ) {

					var sind = ( value = value.replace( /\\/g,'/' ) ).lastIndexOf( '/' ),
						map = '';
					if( sind === -1 ){
						map = value;
					}else{
						map = value.slice( sind+1 );
					}

					if( key === 'map_ka' ) {
						info[ 'mapAmbient' ] = map;
					}

					if( key === 'map_kd' ) {
						info[ 'mapDiffuse' ] = map;
					}					

				} else if( key === 'illum' ) {
					info[ 'illumination' ] = parseFloat( value );
				} else if( key === 'tr' ) {
					info[ 'transparency' ] = parseFloat( value );
				} else if( key === 'ni' ) {
					info[ 'opticalDensity' ] = parseFloat( value );
				} else if( key === 'ns' ) {
					info[ 'specularCoef' ] = parseFloat( value );
				} else if( key === 'd' ) {
					if( value < 1 ) {
						info[ 'transparent' ] = true;
						info[ 'opacity' ] = value;
					}
				}
				// else {
				// 	info[ key ] = value;
				// }

			}

		}

		for( var i = 0; i < materials.length; i ++ ) {

			var material = materials[ i ];

			var name = material.DbgName;

			var mat = materialsInfo[ name ];

			var index = material.DbgIndex;

			var color =  index > colors.length ? 0xFFFFFF * Math.random( ) : colors[ index ]
			material.DbgColor = parseInt( color );

			for( var attr in mat ) {

				if( typeof material[ attr ] === 'undefined' ) {

					material[ attr ] = mat[ attr ]

				} 

			}

		}

	}

	function converter( data, mats ){

		var redata = { uvs:[], materials: [] };

		var currentMat;

		var vertices = redata.vertices = [],
			normals = redata.normals = [],
			uvs = redata.uvs[0] = [],
			faces = redata.faces = [],

			materials = redata.materials = [];

		data = data.replace( /\ \\\r\n/g, '' );

		var lines = data.split( '\n' ),
			verticesCount = 0;

		for ( var i = 0, il = lines.length; i < il; i ++ ) {

			var line = lines[ i ].trim(),
				result;

			if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

				continue;

			} else if ( ( result = vertex_pattern.exec( line ) ) !== null ) {

				// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				vertices.push( 
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )
				);

			} else if ( /^usemtl /.test( line ) ) {

				var matName = line.substring( 7 ).trim( );

				var currentMat = checkMat( matName, materials );

				if( currentMat === undefined ){
					currentMat = materials.length;
					materials.push( { DbgName: matName, DbgIndex: currentMat } );
				}

			} else if ( ( result = normal_pattern.exec( line ) ) !== null ) {

				// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				normals.push(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )
				);

			} else if ( ( result = uv_pattern.exec( line ) ) !== null ) {

				// ["vt 0.1 0.2", "0.1", "0.2"]

				uvs.push(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] )
				);

			} else if ( ( result = face_pattern.exec( line ) ) !== null ){

				
				var v1 = result[1].split( '/' ),
					v2 = result[2].split( '/' ),
					v3 = result[3].split( '/' ),
					v4 = result[4] && result[4].split( '/' );

				var hasMaterial = currentMat !== undefined,
					hasFaceUvs = false,
					hasFaceVertexUvs = v1[1],
					hasFaceNormals = false,
					hasFaceVertexNormals = v1[2],
					hasFaceColors = false,
					hasFaceVertexColors = false;

				var type = 0;

				type = setBit( type, 0, !!v4 );
				type = setBit( type, 1, hasMaterial );
				type = setBit( type, 2, hasFaceUvs );
				type = setBit( type, 3, hasFaceVertexUvs );
				type = setBit( type, 4, hasFaceNormals );
				type = setBit( type, 5, hasFaceVertexNormals );
				type = setBit( type, 6, hasFaceColors );
				type = setBit( type, 7, hasFaceVertexColors );

				faces.push( 
					type, 
					parseInt( v1[ 0 ] ) - 1, 
					parseInt( v2[ 0 ] ) - 1, 
					parseInt( v3[ 0 ] ) - 1 
				);

				v4 && faces.push( parseInt( v4[ 0 ] ) - 1  );

				if( hasMaterial ) {

					faces.push( currentMat );

				}

				if( hasFaceVertexUvs ){

					faces.push( 
						parseInt( v1[ 1 ] ) - 1, 
						parseInt( v2[ 1 ] ) - 1, 
						parseInt( v3[ 1 ] ) - 1 
					);

					v4 && faces.push( parseInt( v4[ 1 ] ) - 1  );

				}

				if( hasFaceVertexNormals ){

					faces.push( 
						parseInt( v1[ 2 ] ) - 1, 
						parseInt( v2[ 2 ] ) - 1, 
						parseInt( v3[ 2 ] ) - 1 
					);

					v4 && faces.push( parseInt( v4[ 2 ] ) - 1  );

				}

			}
		}

		mats && parseMTL( mats, materials );
		console.log( redata );
		return redata;

	}

	function setBit( value, position, bool ){
		return bool ? value |= ( 1 << position ) : value;
	}

	module.exports = converter;

} );