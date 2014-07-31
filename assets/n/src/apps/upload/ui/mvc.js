define( function( require, exports, module ) {
	
	var Backbone = require( 'gallery.backbone' );
	var template = require( 'gallery.art-template' );
	var models = require( 'cloud.models' );
	var Scroller = require( 'cloud.scroller' );

	var Material = require( 'ndi.material' );
	var Map = require( 'ndi.map' )

	var Views = exports.Views = {};
	var Models = exports.Models = {};
	var Collections = exports.Collections = {};
	Models.Message = models.Message;
	Models.Editor = models.Editor;
	Models.Material = models.Material;
	Collections.Materials = models.Materials;
	Models.Map = models.Map;
	Collections.Maps = models.Maps;

	// ========== ========== ========== ========== ========== //
	// 						   Message
	// ========== ========== ========== ========== ========== //
	Views.Message = Backbone.View.extend( {

		el: '#message',
		id: 'message',

		contentDom: '#msgContent',
		progressDom: '#msgProgress',
		events: {
			'click': 'close'
		},
	
		msgColor : '#990000',
		msgOverColor : '#0000CC',

		status: {

			root: {
				open: {
					opacity:1,
				},
				close: {
					opacity:0,
					display:'block'
				}
			},
			progress: {
				open: {
					width: '100%',
					left: '0'
				},
				close: {
					width: '0',
					left: '50%'
				}
			}

		},

		isShow : false,

		template: template.render,
		initialize: function( ){

			var data = this.model.toJSON( );
			this.$el.html( this.template( this.id + 'Template', { content: data.content } ) );
			
			this.model.bind( 'change:content', this.content.bind( this ) );
			this.model.bind( 'change:progress', this.progress.bind( this ) );

		},
		show: function( ){

			if( this.isShow ){ return this; }
			this.isShow = true;

			var __this__ = this,
				type = this.model.get( 'type' );

			var rootStatus = this.status.root,
				progressStatus = this.status.progress;

			// 打开主窗口
			function openRoot( callback ){

				__this__.$el
						.css( rootStatus.close )
						.animate( rootStatus.open, callback );

			}

			if( type === 'text' ){

				openRoot( );

			}else if( type === 'progress' ){

				openRoot( function( ){

					__this__.$( __this__.progressDom )
							.css( progressStatus.close )
							.animate( progressStatus.open );

				} );

			}

			return this;

		},
		close: function( callback ){

			if( typeof( callback !== 'function' ) ){
				callback = undefined;
			}

			if( !this.isShow ){ return this; }
			var __this__ = this,
				type = this.model.get( 'type' ),
				progress = this.model.get( 'progress' );

			var rootStatus = this.status.root,
				progressStatus = this.status.progress;

			// 关闭主MSG窗口
			function closeRoot( ){

				__this__.$el
						.css( rootStatus.open )
						.animate( rootStatus.close, 100, function( ){

							$( this ).hide( );
							__this__.isShow = false;
							__this__.model.set( 'progress', 0 );
							callback && callback( );

						} );

			}

			if( type === 'text' ){

				closeRoot( );

			}else if( type === 'progress' && progress === 1 ){

				this.$( this.progressDom )
					.css( progressStatus.open )
					.animate( progressStatus.close, 160, closeRoot );

			}

			return this;

		},
		content: function( ){

			this.show( ).$( this.contentDom ).html( this.model.get( 'content' ) );
		
		},
		progress: function( ){
		
			var progress = this.model.get( 'progress' );
			this.$( this.progressDom + ' span' ).css( {
				background: this.msgColor,
				width: progress * 100 + '%' 
			} );
			if( this.model.get( 'progress' ) === 1 ){
				this.$( this.progressDom + ' span' ).css( 'background', this.msgOverColor );
			}
		
		}

	} );



	// ========== ========== ========== ========== ========== //
	// 						   Editor
	// ========== ========== ========== ========== ========== //
	Views.Editor = Backbone.View.extend( {

		el: '#editor',
		id: 'editor',
		template: template.render,
		nameDom: '#editorName',
		showDom: '#editorShow',
		materialsDom: '#materials',
		mapsDom: '#maps',
		// imagesContainer: '#images',
		// imagesDom: '#imageContent',

		events: {
			'click #editorClose': 'close',
			'click #editorShow': 'show',

			// 顶级tab
			'click .tab-basic': 'tab',
			// 顶级
			'click .listing h3': 'toggle',
			// 二级
			'click .item h4': 'toggle',

			// 'click .tab-image': 'tabImage',
			// 文本框
			'change .attrValue input[type="text"]': 'textChange',
			// 复选框
			'change .attrValue input[type="checkbox"]': 'checkboxChange',
			// 选择
			'change .attrValue select': 'selectChange',
			// 数字
			'change .attrValue input[type="number"]': 'selectChange',
			// 颜色
			'change .attrValue input[type="color"]': 'colorChange',

			// 
			// 'click .image input[type="text"]': 'selectImage',

			// 'click .img': 'changeImg',

			// 'click .sure': 'setUrl',

			// 云同步选项
			'click .cloudUpload': 'cloudUpload',

			// 
			'click .selectMap': 'showMapPanel',
		},

		isShow : false,
		status: {

			root: {
				open: {
					right: 0,
				},
				close: {
					right: -400
				}
			}

		},

		initialize: function( ){

			var model = this.model;
			var materials = this.materials = this.options.materials;
			var maps = this.maps = this.options.maps;

			var data = model.toJSON( );
				data.materials = materials.toJSON( );
				data.maps = maps.toJSON( );

			this.$el.html( this.template( this.id + 'Template', data ) );

			// 滚动条
			var scroller = new Scroller( 0 );
			var view = this.$( '#editorContent' )[0];
			this.scroller = new Scroller.View( scroller, view, this.$( '.ulBasic' )[0], this.$( '#editorContent' )[0], this.$( '#dragger' )[0], 'ver' );
			this.scroller.enableMouseWheel( view );
			this.scroller.speed = 2;

			// Model 事件
			model.bind( 'change:name', this.name.bind( this ) );
			materials.bind( 'init', this.renderMats.bind( this ) );
			maps.bind( 'init', this.renderMaps.bind( this ) );
			materials.bind( 'change', this.render.bind( this, 'materials', Material ) );
			maps.bind( 'change', this.render.bind( this, 'maps', Map ) );

		},

		name: function( model, name ){

			this.$( this.nameDom ).val( name );

		},

		show: function( callback ){

			if( this.isShow ){ return this; }
			this.isShow = true;
			var __this__ = this;
			var rootStatus = this.status.root;

			this.$el
				.show( )
				.css( rootStatus.close )
				.animate( rootStatus.open, function( ){

					__this__.resizeScroller( );
					callback && callback( );
				} );

			this.$( this.showDom ).hide( );

		},

		close: function( callback ){

			if( !this.isShow ){ return this; }
			var __this__ = this;

			var rootStatus = this.status.root;

			this.$el
				.css( rootStatus.open )
				.animate( rootStatus.close, 100, function( ){

					__this__.isShow = false;
					__this__.$( __this__.showDom ).show( );
					typeof callback === 'function' && callback( );

				} );

		},

		resizeScroller: function( ){
			this.scroller.resize( );
		},

		toggle: function( event ) {

			var item = this.$( event.currentTarget ).parent( );
			item.hasClass( 'toggled' ) ? item.removeClass( 'toggled' ) : item.addClass( 'toggled' );
			this.resizeScroller( );

		},

		valueChange: function( event, type ){

			var element = event.srcElement || event.originalEvent.srcElement,
				item 	= this.$( element ),
				tmp 	= element.id.split( '_' );

			var list 	= 	tmp[ 0 ],
				name 	= 	tmp[ 1 ],
				index 	= + tmp[ 2 ],
				value 	= 	item.val( );

			var result = {};

			switch( type ){
				case 'text':
					break;
				case 'check':
					value = item.prop( 'checked' );
					break;
				case 'select':
					break;
				case 'color':
					value = + ( '0x' + value.split( '#' )[ 1 ] );
					break;
			}
			
			result[ name ] = value;

			// 写入 Model
			this[ list ].at( index ).set( result );

		},

		textChange: function( event ){ this.valueChange( event, 'text' ); },
		checkboxChange: function( event ){ this.valueChange( event, 'check' ); },
		selectChange: function( event ){ this.valueChange( event, 'select' ); },
		colorChange: function( event ){ this.valueChange( event, 'color' ); },

		renderMats: function( ){

			this.$( this.materialsDom )
				.html( this.template( 'materialsTemplate', {
					materials: this.materials.toJSON( ), mapping: Material.config
				} ) );

		},

		renderMaps: function( ) {

			this.$( this.mapsDom )
				.html( this.template( 'mapsTemplate', {
					maps: this.maps.toJSON( ), mapping: Map.config
				} ) );

		},

		// selectImage: function( event ) {

		// 	var element = event.srcElement || event.originalEvent.srcElement,
		// 		item 	= this.$( element ),
		// 		tmp 	= element.id.split( '_' );

		// 	var index = this.imageIndex = + tmp[ 2 ];

		// 	this.$( this.imagesContainer ).show( );

		// 	this.$( '.tab-selected' ).html( this.template( 'imagesTemplate', {  images: this.mapData.images || [] } ) )

		// },

		render: function( listType, Class, model ){

			var index = model.collection.indexOf( model ),
				changed = model.changedAttributes( ),
				name, value, type, child;

			changed._id && delete changed._id;

			for( n in changed ){
				
				name = n;
				value = changed[ name ];
				type = Class.config.hash[ name ].type;
				child = Class.config.hash[ name ].children;

				// 改变标题
				if( name === 'name' ){
					$( '#' + listType + '_title_' + index + ' .titleText' ).text( value );
				}

				switch( type ){
					case 'boolean' :
						var attrValue = this.$( '#' + listType + '_item_' + index + ' .' + name + ' .attrValue' ),
							icon = attrValue.children( 'i' );
						if( value ){
							icon.removeClass( 'icon-check-empty' ).addClass( 'icon-check' )
							attrValue.addClass( 'checked' );
						}else{
							icon.removeClass( 'icon-check' ).addClass( 'icon-check-empty' );
							attrValue.removeClass( 'checked' );
						}
						child && this.foldBoolean( index, value, name, type );
						break;
					case 'select' :
						child && this.foldSelect( index, value, name, type );
						break;
				}

			}


		},

		foldBoolean: function( index, value, name, type ){

			var child = this.$( '.' + name + '_child' );
			value ? child.show( ) : child.hide( );
			this.resizeScroller( );

		},

		foldSelect: function( index, value, name, type ){

			var __this__ = this;
			this.$( '#item_' + index + ' .' + name + '_child' ).hide( );
			Material.config.matAttrs[ value ].forEach( function( x ) {
				__this__.$( '#item_' + index + ' .' + x ).show( );
			} );
			this.resizeScroller( );

		},

		tab: function( event ) {

			var $this = this.$( event.currentTarget );

			if( $this.hasClass( 'active' ) ) return;

			this.$( '.tab-basic.active' ).removeClass( 'active' )
			$this.addClass( 'active' );

			var index = $this.index( );

			this.$( '.ulBasic' ).css( { left: -index * 400, top: 0 } );
			this.resizeScroller( );

		},

		// tabImage: function( event ) {

		// 	var $this = this.$( event.currentTarget );

		// 	if( $this.hasClass( 'active' ) ) return;

		// 	this.$( '.tab-image.active' ).removeClass( 'active' )
		// 	$this.addClass( 'active' );

		// 	var index = $this.index( );

		// 	this.$( '#imageContent' ).css( { left: -index * 400} );

		// },

		// changeImg: function( event ) {

		// 	var $this = this.$( event.currentTarget )[0];

		// 	this.selectedImg = $this.src;

		// },

		// setUrl: function( ) {

		// 	this.closeOverlay( );

		// 	this.maps.at( this.imageIndex ).set( {
		// 		image: this.selectedImg
		// 	} );

		// },

		cloudUpload: function( event ){

			var $this = this.$( event.target ).hide( );

			var item = $this.parent( ).parent( );

			var tmp = item[ 0 ].id.split( '_' );
			var list 	= 	tmp[ 0 ],
				index 	= + tmp[ 2 ];

			var $refresh = this.$( '#' + list + '_item_' + index + ' .cloudRefresh' ).show( ),
				$cloudIcon = this.$( '#' + list + '_item_' + index + ' .cloudIcon' );

			this[ list ].at( index ).save( null, {

				success: function( data ){
					console.log( data );
					$refresh.hide( );
					$cloudIcon.show( );
				},
				error: function( model, xhr ){
					console.log( xhr );
					alert( xhr.responseJSON.msg );
					$refresh.hide( );
					$this.show( );
				},

			} );

			return false;

		},

		showMapPanel: function( event ){

			var tmp = event.currentTarget.id.split( '_' );
			this.trigger( 'showMapPanel', tmp[ 2 ], tmp[ 1 ] );

		},

		showImagePanel: function( ){

			this.trigger( 'showImagePanel' );

		}

	} );

	Views.Materials = Backbone.View.extend( {

		initialize: function( ){
			this.materials = this.options.materials;
			this.model3D = this.options.model3D;

			this.model.bind( 'change', this.render.bind( this ) );
		},
		render: function( model ){

			var index = model.collection.indexOf( model );
			
			this.materials[ index ].set( model.changed );
			model.changed.hasOwnProperty( 'renderType' ) && this.model3D.updateMaterial( );

		}

	} );

	Views.Maps = Backbone.View.extend( {

		initialize: function( ){
			this.maps = this.options.maps;

			this.model.bind( 'change', this.render.bind( this ) );
		},
		render: function( model ){

			var index = model.collection.indexOf( model );
			var changed = model.changedAttributes( );

			changed._id && delete changed._id;

			this.maps[ index ].set( changed );

		}


	} );
	

	Views.OverlayMaps = Backbone.View.extend( {
		
		el: '#mapsPanel',
		id: 'editor',

		index: 0,
		type: 'map',

		template: template.render,

		events: {

			'click .map': 'changeMap'

		},

		initialize: function( ){

			this.images = this.options.images;
			this.materials = this.options.materials;

			this.renderPanel( );

		},
		renderPanel: function( ){

			var hash = {};
			this.images.forEach( function( x ){
				hash[ x.name ] = x.src;
			} );
			this.$el.html( this.template( 'mapsPanelTemplate', { maps: this.model.toJSON( ), images: hash } ) );

		},
		show: function( ){

			this.$el.show( );

		},
		hide: function( ){

			this.$el.hide( );

		},
		changeMap: function( event ) {

			var index = this.$( event.currentTarget ).parent( ).index( );
			console.log( index );
			var result = {};
			result[ this.type ] = this.model.at( index ).toJSON( );
			this.materials.at( this.index ).set( result );
			event.preventDefault( );

		}

	} );

} );