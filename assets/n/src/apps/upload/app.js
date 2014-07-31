define( function( require, exports, module ) {

	var ndi = require( 'ndi.ndi' );
	var drop = require( './ndi.drop' );
	var parse = require( './ndi.parse' );
	var upload = require( './ndi.upload' );
	var RENDER = require( 'ndi.render' );

	var ui = require( './ui/ui' );
	
	drop( ndi );
	parse( ndi );
	upload( ndi );

	ui( ndi );

	// 视图居中
	ndi.createAction( 'center', function( options, data, callback ){

		var model = data.model.render;
		callback && callback( { values: { r: model.geometry.boundingSphere.radius * 2.5 } } );


	} );

	ndi.createAction( 'shadow', function( options, data, callback ){

		var light = this.__hash__[ options.light ];

		var d = 12;

		light.castShadow = true;
		light.shadowMapWidth = 2048;
		light.shadowMapHeight = 2048;

		light.shadowCameraLeft = -d * 2;
		light.shadowCameraRight = d * 2;
		light.shadowCameraTop = d * 1.5;
		light.shadowCameraBottom = -d;
		light.shadowCameraFar = 3500;

		var renderer = this.__render__.renderer;
		renderer.gammaInput = true;
		renderer.gammaOutput = true;
		renderer.physicallyBasedShading = true;
		renderer.shadowMapEnabled = true;


		var ground = new RENDER.Mesh( 
			new RENDER.PlaneGeometry( 16000, 16000 ), 
			new RENDER.MeshPhongMaterial( { emissive: 0xF0F0F0 } ) 
		);
		ground.rotation.x = -Math.PI/2;
		ground.position.y = -0.05;
		ground.receiveShadow = true;
		this.__render__.scene.add( ground );

	} );

	ndi.ready( function( ){

		ndi( )
		.camera( {
			r: 1000,
			damp: .14,
			rotateSpeed: 3,
			zoomSpeed: 2
		} )
		.light( {
			type: 'ambient',
			color: 0x222222
		} )
		.light( {
			id: 'main',
			type: 'directional',
			color: 0xebf3ff,
			intensity: 1.6,
			position: [ 0,30,50 ]
		} )
		.light( {
			type: 'directional',
			color: 0x497f13,
			intensity: 1,
			position: [ 0,-1,0 ]
		} )
		.shadow( {
			light: 'main'
		} )
		.cmd( {
			commands: [
				{
					action: 'ui',
				},{
					action: 'drop',
					options: {
						off: true,
						dropped: {
							commands: [
								{
									action: 'filter',
									options: {
										inherit: [ 'ui' ]
									}
								},{ 
									action: 'parse',
									options: {
										inherit: 'all'
									}
								},{
									action: 'branch',
									options: {
										commands: [
											{
												commands: [
													{
														action: 'mesh',
														options: {
															id: 'drop',
															type: 'json',
															insert: [ 'json' ],
															inherit: 'all',
															filter: [ 'model' ]
														}
													},{
														action: 'setMaterial',
														options: {
															shadow: true,
															inherit: [ 'ui', 'model', 'images' ]
														}
													},{
														action: 'center',
														options: { inherit: 'all' }
													},{
														action: 'set',
														options: {
															id: 'camera',
															insert: [ 'values' ],
															inherit: 'all',
															filter: [ 'values' ]
														}
													},{
														action: 'readModel',
														options: { inherit: 'all' }
													},{
														action: 'showEditor',
														options: { inherit: [ 'ui' ] }
													}
												]
											},{
												commands: [
													{
														action: 'delay',
														options: {
															time: 10,
															progress: {
																commands: {
																	action: 'msgTime'
																}
															},
															inherit: { 'modelFiles' : 'files', 'ui' : 'ui' }
														}
													},{
														action: 'uploadFiles',
														options: {
															url: '',
															zipProgress: {
																commands: {
																	action: 'msgZip'
																}
															},
															uploadProgress: {
																commands: {
																	action: 'msgUpload'
																}
															}
														}
													}
												]
											}

										]
									}
								}
							]
						}
					}
				}
			]
		} )

	} );


} );