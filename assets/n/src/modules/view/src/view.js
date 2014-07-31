define( function( require, exports, module ) {

    var Base = require( 'ndi.base' ),
        RENDER = require( 'ndi.render' ),
        OrbitCamera = require( 'ndi.orbit-camera' ),
        Sensor = require( 'ndi.sensor' );

    function View( nid, app, options ){

        RENDER.Scene.call( this );

        var element = document.getElementById( nid ) || document.createElement( 'canvas' );
        element.id = nid;
        if( element.tagName.toLowerCase( ) !== 'canvas' ){
            throw( new Error( '指定的ID不是canvas标签！' ) );
        }
        this.defaults = {
            container: document.body,
            operator: null,
            renderer: 'WebGLRenderer',
            rendererOptions: {
                antialias: true,
                alpha: false
            },
            disableSelection: true,
            autostart: true,
            autorun: true,
            fullwindow: true
        };

        Base.call( this, nid, app, options );

        options = this.options;
        
        // 如果父标签不存在，则插入到指定的容器中
        var container = typeof options.container === 'string' ? document.getElementById( options.container ) : options.container;
        if( !element.parentNode ){
            container.appendChild( element );
        }
        var operator = typeof options.operator === 'string' ? document.getElementById( options.operator ) : ( options.container || container );
        // 初始化Renderer
        var renderer = options.renderer,
            rendererOptions = options.rendererOptions;
        if( typeof renderer === 'string' ){
            rendererOptions.canvas = element;
            renderer = new RENDER[ renderer ]( rendererOptions );
        }
        this.renderer = renderer;
        // 初始化Camera
        var size = this.size( );
        this._camera = new RENDER.PerspectiveCamera( 80, size.x / size.y, 0.1, 100000 );

        this.clock = new RENDER.Clock( );
        // 绑定窗口大小改变事件
        window.addEventListener( 'resize', this.resize.bind( this ) );
        // 模拟resize事件以初始化大小
        this.resize( );

        this.sensor = new Sensor( operator );

        if( options.autostart ){
            this.start( );
        }
        // 禁用文字选择
        if( options.disableSelection ){
            var os = operator.style;
            os.webkitUserSelect = 'none';
            os.mozUserSelect = 'none';
            os.msUserSelect = 'none';
            os.userSelect = 'none';
        }

    }

    var viewProto = Object.create( RENDER.Scene.prototype );
    Object.keys( Base.prototype ).forEach( function( attr ){
        viewProto[ attr ] = Base.prototype[ attr ];
    } );
    View.prototype = viewProto;

    View.prototype.constructor = View;
    View.prototype.resize = function( callback ){

        if( callback && typeof callback === 'function' ){

            this.on( 'view.resize', callback );

        }else{

            var container = this.options.container;
            this.options.fullwindow ? this.size( { x: window.innerWidth, y: window.innerHeight } ) :
            this.size( { x: container.offsetWidth, y: container.offsetHeight } );

        }
        return this;
    
    };

    View.prototype.size = function( size ){

        if( size ){

            var w = size.x,
                h = size.y;

            this.renderer.setSize( w, h );
            this._camera.aspect = w / h;
            this._camera.updateProjectionMatrix( );

            this.trigger( 'view.resize', w, h );

        }else{
            var canvas = this.renderer.domElement;
            return { x: canvas.offsetWidth, y: canvas.offsetHeight };
        }

        // return this; // TODO: 更改为 width height 属性

    };
    View.prototype.run = function( callback ){
        this.on( 'view.run', callback );
        return this;
    };
    View.prototype.render = function( ){

        var camera = this._camera;
        this.options.autorun && requestAnimationFrame( this.render.bind( this ) );
        var delta = this.clock.getDelta( );

        this.trigger( 'view.run', delta );

        if( this.cameraProxy ){
            camera.position.val( this.cameraProxy.positionWorld );
            camera.rotation.val( this.cameraProxy.rotationWorld );
        }

        this.renderer.render( this, camera );

        return this;

    };
    View.prototype.start = function( ){
        this.render( );
        return this;
    };
    View.prototype.camera = function( nid, options ){
        this.cameraProxy = this.app.get( nid ) || new OrbitCamera( nid, this, options );
        return this.cameraProxy;
    };

    module.exports = View;

} );