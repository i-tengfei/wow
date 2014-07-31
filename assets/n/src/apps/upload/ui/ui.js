define( function( require, exports, module ) {

	var mvc = require( './mvc' );


	function ui( NDI ){

		// 初始化 UI 框架
		NDI.createAction( 'ui', function( options, data, callback ){

			var ui = { models: {}, views: {}, collections: {} };

			// 提示框
			var msgModel = new mvc.Models.Message( {
				type: 'text',
				content: '亲，请注意~',
				progress: 0
			} );
			var msgView = new mvc.Views.Message( {
				model: msgModel
			} );

			ui.models.msg = msgModel;
			ui.views.msg = msgView;

			// 编辑器
			var editorModel = new mvc.Models.Editor( {
				name: '给它起个名字吧'
			} );
			var materials = new mvc.Collections.Materials( ),
				maps = new mvc.Collections.Maps( );
			var editorView = new mvc.Views.Editor( {
				model: editorModel,
				materials: materials,
				maps: maps
			} );

			ui.models.editor = editorModel;
			ui.views.editor = editorView;
			ui.collections.materials = materials;
			ui.collections.maps = maps;


			callback && callback( { ui:ui } );

		} );

		// 延时提示
		NDI.createAction( 'msgTime', function( options, data, callback ){

			var rootData = data.rootData;

			var files = rootData.modelFiles.map( function( x ){
				return x.name;
			} ).join( ' ' );

			rootData.ui.models.msg.set( {
				type: 'progress',
				progress: data.progress,
				content: '<span class="msgRed">' + ( data.total - data.number ) + '</span> 秒后自动上传原始文件: <span style="font-weight: bold; color:#660000">' + files + '</span>'
			} );

			callback && callback( );

		} );

		// 压缩进度提示
		NDI.createAction( 'msgZip', function( options, data, callback ){

			var rootData = data.rootData;

			rootData.ui.models.msg.set( {
				type: 'progress',
				progress: data.progress,
				content: '正在压缩 <span class="msgRed">' + data.name + '</span>'
			} );

			callback && callback( );

		} );

		// 上传进度提示
		NDI.createAction( 'msgUpload', function( options, data, callback ){

			var rootData = data.rootData;

			rootData.ui.models.msg.set( {
				type: 'progress',
				progress: data.progress,
				content: '正在上传资源文件，请稍候…'
			} );

			callback && callback( );

		} );

		// 关闭提示框
		NDI.createAction( 'closeMsg', function( options, data, callback ){

			data.ui.views.msg.close( function( ){
				callback && callback( );
			} );

		} );

		// 显示编辑器
		NDI.createAction( 'showEditor', function( options, data, callback ){

			data.ui.views.editor.show( function( ){
				callback && callback( );
			} );

		} );

		// 关闭编辑器
		NDI.createAction( 'closeEditor', function( options, data, callback ){

			data.ui.views.editor.close( function( ){
				callback && callback( );
			} );

		} );

		// 读取模型数据
		NDI.createAction( 'readModel', function( options, data, callback ){

			var materials = data.ui.collections.materials;
			var maps = data.ui.collections.maps;

			// 将图片files传给集合，方便上传图片文件！
			maps.images = data.images;

			data.materials.forEach( function( material ){
				
				materials.push( material.val( ) );

			} );

			data.maps.forEach( function( map ){
				maps.push( map.val( ) );
			} );

			materials.trigger( 'init' );
			maps.trigger( 'init' );

			// 3D Material
			var materialsView = new mvc.Views.Materials( {
				materials: data.materials,
				model: materials,
				model3D: data.model
			} );

			// 3D Map
			var mapsView = new mvc.Views.Maps( {
				maps: data.maps,
				model: maps
			} );

			// 2D Map
			var overlayMapsView = new mvc.Views.OverlayMaps( {
				maps: data.maps,
				model: maps,
				images: data.images,
				materials: materials
			} );

			data.ui.views.editor.bind( 'showMapPanel', function( index, type ){
				console.log( index, type );
				overlayMapsView.index = index;
				overlayMapsView.type = type;
				overlayMapsView.show( );
			} );

			callback && callback( );

		} );

	}

	module.exports = ui;

} );