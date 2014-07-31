define( function( require, exports, module ) {

    require( 'ndi.render-extend' );
    
    var Events = require( 'ndi.events' ),
        View = require( 'ndi.view' ),
        Geometry = require( 'ndi.geometry' ),
        Material = require( 'ndi.material' ),
        O3d = require( 'ndi.o3d' ),
        Model = require( 'ndi.model' );

    function ndi( options, fn ){
        return new ndi.fn.init( options, fn );
    }

    var readyList,
        document = window.document,
        class2type = {},
        core_deletedIds = [],
        core_hasOwn = class2type.hasOwnProperty,
        core_slice = core_deletedIds.slice,
        core_rnotwhite = /\S+/g,
        completed = function( event ) {

            if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
                detach();
                ndi.ready();
            }
        },
        detach = function() {
            if ( document.addEventListener ) {
                document.removeEventListener( "DOMContentLoaded", completed, false );
                window.removeEventListener( "load", completed, false );

            } else {
                document.detachEvent( "onreadystatechange", completed );
                window.detachEvent( "onload", completed );
            }
        };

    ndi.fn = ndi.prototype = {

        constructor: ndi,

        init: function( options, fn ) {
            if( typeof options === 'function' && !fn ){
                fn = options;
                options = undefined;
            }
            if( options ){
                this.view( options );
            }
            this.__resource__ = {};
            if( fn ){
                this.ready( fn.bind( this ) );
            }
            return this;
        },

        ready: function( fn ) {
            ndi.ready.promise( ).done( fn );
            return this;
        }

    };

    ndi.fn.init.prototype = ndi.fn;

    ndi.extend = ndi.fn.extend = function( ) {
        var src, copyIsArray, copy, name, options, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        if ( typeof target === "boolean" ) {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }

        if ( typeof target !== "object" && !ndi.isFunction(target) ) {
            target = {};
        }

        if ( length === i ) {
            target = this;
            --i;
        }

        for ( ; i < length; i++ ) {
            if ( (options = arguments[ i ]) != null ) {
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    if ( target === copy ) {
                        continue;
                    }

                    if ( deep && copy && ( ndi.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) ) ) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];

                        } else {
                            clone = src && ndi.isPlainObject(src) ? src : {};
                        }

                        target[ name ] = ndi.extend( deep, clone, copy );

                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }

        return target;
    };

    ndi.extend( {

        isReady: false,

        ready: function( ) {

            if ( !document.body ) {
                return setTimeout( ndi.ready );
            }

            ndi.isReady = true;

            readyList.resolve( ndi );

            if ( ndi.fn.trigger ) {
                ndi( ).trigger( 'ready' ).off( 'ready' );
            }

        },
        isPlainObject: function( obj ) {
            var key;
            if ( !obj || typeof obj !== "object" || obj.nodeType || obj === window ) {
                return false;
            }

            try {
                if ( obj.constructor &&
                    !core_hasOwn.call(obj, "constructor") &&
                    !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
                    return false;
                }
            } catch ( e ) {
                return false;
            }

            for ( key in obj ) {}

            return key === undefined || core_hasOwn.call( obj, key );
        },

    });

    ndi.ready.promise = function( obj ) {
        if ( !readyList ) {

            readyList = ndi.Deferred( );
            if ( document.readyState === "complete" ) {
                setTimeout( ndi.ready );
            } else if ( document.addEventListener ) {
                document.addEventListener( "DOMContentLoaded", completed, false );
                window.addEventListener( "load", completed, false );
            } else {
                document.attachEvent( "onreadystatechange", completed );
                window.attachEvent( "onload", completed );
                var top = false;

                try {
                    top = window.frameElement == null && document.documentElement;
                } catch( e ) { }

                if ( top && top.doScroll ) {
                    ( function doScrollCheck( ) {
                        if ( !ndi.isReady ) {

                            try {
                                top.doScroll( "left" );
                            } catch(e) {
                                return setTimeout( doScrollCheck, 50 );
                            }

                            detach( );

                            ndi.ready( );
                        }
                    } )( );
                }
            }
        }
        return readyList.promise( obj );
    };

    var optionsCache = {};
    function createOptions( options ) {
        var object = optionsCache[ options ] = {};
        ( options.match( core_rnotwhite ) || [] ).forEach( function( flag ){
            object[ flag ] = true;
        } )
        return object;
    }
    ndi.Callbacks = function( options ) {

        options = typeof options === "string" ?
            ( optionsCache[ options ] || createOptions( options ) ) :
            ndi.extend( {}, options );

        var // Flag to know if list is currently firing
            firing,
            // Last fire value (for non-forgettable lists)
            memory,
            // Flag to know if list was already fired
            fired,
            // End of the loop when firing
            firingLength,
            // Index of currently firing callback (modified by remove if needed)
            firingIndex,
            // First callback to fire (used internally by add and fireWith)
            firingStart,
            // Actual callback list
            list = [],
            // Stack of fire calls for repeatable lists
            stack = !options.once && [],
            // Fire callbacks
            fire = function( data ) {
                memory = options.memory && data;
                fired = true;
                firingIndex = firingStart || 0;
                firingStart = 0;
                firingLength = list.length;
                firing = true;
                for ( ; list && firingIndex < firingLength; firingIndex++ ) {
                    if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
                        memory = false; // To prevent further calls using add
                        break;
                    }
                }
                firing = false;
                if ( list ) {
                    if ( stack ) {
                        if ( stack.length ) {
                            fire( stack.shift() );
                        }
                    } else if ( memory ) {
                        list = [];
                    } else {
                        self.disable();
                    }
                }
            },

            self = {
                add: function() {
                    if ( list ) {
                        // First, we save the current length
                        var start = list.length;
                        (function add( args ) {
                            [].slice.call( args ).forEach( function( arg ){
                                var type = typeof arg;
                                if ( type === "function" ) {
                                    if ( !options.unique || !self.has( arg ) ) {
                                        list.push( arg );
                                    }
                                } else if ( arg && arg.length && type !== "string" ) {
                                    // Inspect recursively
                                    add( arg );
                                }
                            } );
                        })( arguments );
                        // Do we need to add the callbacks to the
                        // current firing batch?
                        if ( firing ) {
                            firingLength = list.length;
                        // With memory, if we're not firing then
                        // we should call right away
                        } else if ( memory ) {
                            firingStart = start;
                            fire( memory );
                        }
                    }
                    return this;
                },
                // Remove a callback from the list
                remove: function() {
                    if ( list ) {
                        ndi.each( arguments, function( _, arg ) {
                            var index;
                            while( ( index = ndi.inArray( arg, list, index ) ) > -1 ) {
                                list.splice( index, 1 );
                                // Handle firing indexes
                                if ( firing ) {
                                    if ( index <= firingLength ) {
                                        firingLength--;
                                    }
                                    if ( index <= firingIndex ) {
                                        firingIndex--;
                                    }
                                }
                            }
                        });
                    }
                    return this;
                },
                has: function( fn ) {
                    return fn ? ndi.inArray( fn, list ) > -1 : !!( list && list.length );
                },
                empty: function() {
                    list = [];
                    firingLength = 0;
                    return this;
                },
                disable: function() {
                    list = stack = memory = undefined;
                    return this;
                },
                disabled: function() {
                    return !list;
                },
                lock: function() {
                    stack = undefined;
                    if ( !memory ) {
                        self.disable();
                    }
                    return this;
                },
                locked: function() {
                    return !stack;
                },
                fireWith: function( context, args ) {
                    if ( list && ( !fired || stack ) ) {
                        args = args || [];
                        args = [ context, args.slice ? args.slice() : args ];
                        if ( firing ) {
                            stack.push( args );
                        } else {
                            fire( args );
                        }
                    }
                    return this;
                },
                fire: function() {
                    self.fireWith( this, arguments );
                    return this;
                },
                fired: function() {
                    return !!fired;
                }
            };

        return self;
    };
    ndi.extend( {

        Deferred: function( func ) {
            var tuples = [
                    [ "resolve", "done", ndi.Callbacks("once memory"), "resolved" ],
                    [ "reject", "fail", ndi.Callbacks("once memory"), "rejected" ],
                    [ "notify", "progress", ndi.Callbacks("memory") ]
                ],
                state = "pending",
                promise = {
                    state: function() {
                        return state;
                    },
                    always: function() {
                        deferred.done( arguments ).fail( arguments );
                        return this;
                    },
                    then: function( /* fnDone, fnFail, fnProgress */ ) {
                        var fns = arguments;
                        return ndi.Deferred(function( newDefer ) {
                            ndi.each( tuples, function( i, tuple ) {
                                var action = tuple[ 0 ],
                                    fn = ndi.isFunction( fns[ i ] ) && fns[ i ];
                                // deferred[ done | fail | progress ] for forwarding actions to newDefer
                                deferred[ tuple[1] ](function() {
                                    var returned = fn && fn.apply( this, arguments );
                                    if ( returned && ndi.isFunction( returned.promise ) ) {
                                        returned.promise()
                                            .done( newDefer.resolve )
                                            .fail( newDefer.reject )
                                            .progress( newDefer.notify );
                                    } else {
                                        newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
                                    }
                                });
                            });
                            fns = null;
                        }).promise();
                    },
                    promise: function( obj ) {
                        return obj != null ? ndi.extend( obj, promise ) : promise;
                    }
                },
                deferred = {};

            promise.pipe = promise.then;

            tuples.forEach( function( tuple, i ){
                var list = tuple[ 2 ],
                    stateString = tuple[ 3 ];

                promise[ tuple[1] ] = list.add;

                if ( stateString ) {
                    list.add(function() {
                        state = stateString;

                    }, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
                }

                deferred[ tuple[0] ] = function() {
                    deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
                    return this;
                };
                deferred[ tuple[0] + "With" ] = list.fireWith;

            } )

            promise.promise( deferred );

            if ( func ) {
                func.call( deferred, deferred );
            }

            return deferred;
        },

        when: function( subordinate /* , ..., subordinateN */ ) {
            var i = 0,
                resolveValues = core_slice.call( arguments ),
                length = resolveValues.length,

                remaining = length !== 1 || ( subordinate && ndi.isFunction( subordinate.promise ) ) ? length : 0,

                deferred = remaining === 1 ? subordinate : ndi.Deferred(),

                updateFunc = function( i, contexts, values ) {
                    return function( value ) {
                        contexts[ i ] = this;
                        values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
                        if( values === progressValues ) {
                            deferred.notifyWith( contexts, values );
                        } else if ( !( --remaining ) ) {
                            deferred.resolveWith( contexts, values );
                        }
                    };
                },

                progressValues, progressContexts, resolveContexts;

            if ( length > 1 ) {
                progressValues = new Array( length );
                progressContexts = new Array( length );
                resolveContexts = new Array( length );
                for ( ; i < length; i++ ) {
                    if ( resolveValues[ i ] && typeof resolveValues[ i ].promise === 'function' ) {
                        resolveValues[ i ].promise()
                            .done( updateFunc( i, resolveContexts, resolveValues ) )
                            .fail( deferred.reject )
                            .progress( updateFunc( i, progressContexts, progressValues ) );
                    } else {
                        --remaining;
                    }
                }
            }

            if ( !remaining ) {
                deferred.resolveWith( resolveContexts, resolveValues );
            }

            return deferred.promise();
        }
    } );

    ( function( ){

        Events.mixTo( ndi.fn );

        ndi.extend( {
            'Events': Events
        } );

    } )( ndi );


    ( function( ndi ){

        ndi.extend( {

            load: function( url, options ){

                options = options || {
                    type: 'json'
                };

                var deferred = ndi.Deferred( );

                var request = new XMLHttpRequest( ),
                    result;

                request.addEventListener( 'load', function ( event ) {

                    switch( options.type.toLowerCase( ) ){
                        case 'json':
                            result = JSON.parse( event.target.responseText );
                            break;
                        case 'arraybuffer':
                            result = event.target.response;
                            break;
                        default:
                            result = event.target.responseText;
                    }
                    deferred.resolve( result );

                }, false );


                request.addEventListener( 'progress', function ( event ) {

                    // onProgress( event );
                    deferred.notify( event );

                }, false );

                request.addEventListener( 'error', function ( event ) {

                    deferred.reject( );

                }, false );

                // if ( this.crossOrigin !== undefined ) request.crossOrigin = this.crossOrigin;
                if( options.type.toLowerCase( ) === 'arraybuffer' ){
                    request.responseType = 'arraybuffer';
                }
                request.open( 'GET', url, true );
                request.send( );

                return deferred.promise( );

            },

            yun: function( type, yunid ){
                return this.load( 'http://xxx.xxx.xxx/' + type + '/' + yunid );
            },

            delay: function( s ){

                var deferred = ndi.Deferred( );

                setTimeout( function( ){
                    
                    deferred.resolve( );

                }, s * 1000 )

                return deferred.promise( );

            }

        } )
        
    } )( ndi )


    ndi.fn.extend( {
        view: function( nid, options ){
            nid = nid || this.__viewname__;
            this.__viewname__ = nid;
            return this.get( nid ) || new View( nid, this, options );
        },
        geometry: function( nid, options ){
            return this.get( nid ) || new Geometry( nid, this, options );
        },
        material: function( nid, options ){
            return this.get( nid ) || new Material( nid, this, options );
        },
        o3d: function( nid, options ){
            return this.get( nid ) || new O3d( nid, this, options );
        },
        model: function( nid, options ){
            return this.get( nid ) || new Model( nid, this, options );
        },
        get: function( nid ){
            return this.__resource__[ nid ];
        },
        run: function( callback ){
            this.on( 'ndi.run', callback );
            return this;
        }
    } );















































    // var RENDER = require( 'ndi.render' );
    // var Model = require( 'ndi.model' );
    // var OrbitCamera = require( 'ndi.orbit-camera' );
    // var math = require( 'ndi.math' );
    // var Events = require( 'ndi.events' );
    // var Material = require( 'ndi.material' );
    // var Map = require( 'ndi.map' );
    // var async = require( 'ndi.async' );
    // var TWEEN = require( 'ndi.tween' );
    // var MouseManager = require( 'ndi.mouse-manager' );

    // require( 'ndi.render-extend' );

    // function NDI( options ){

    //     if ( typeof this === 'object' && !( this instanceof NDI ) ) {
    //         return new NDI( options );
    //     }

    //     this.__render__ = {
    //         clock : new RENDER.Clock( ),
    //         scene : new RENDER.Scene( )
    //     };
    //     this.__hash__ = { };

    //     this.attributes = {};
    //     this.canvas = null;
    //     this.cameraProxy = null;
    //     this.width = window.innerWidth;
    //     this.height = window.innerHeight;
    //     this.browser = NDI.browser;
        
    //     this.async = async;

    //     this.val( options || {} );
    //     this.__init__( );

    // }

    // NDI.BEFORE_RENDER = 'beforeRender';
    // NDI.RESIZE = 'resize';
    // NDI.READY = 'ready';
    // NDI.OVER = 'over';

    // NDI.async = async;


    // Events.mixTo( NDI );

    // NDI.prototype.events = {};
    // NDI.prototype.__init__ = function( ){

    //     var attrs = this.attributes;
    //     var renderer = this.__render__.renderer = new RENDER.WebGLRenderer( { antialias: attrs.antialias } );
    //     var camera = this.__render__.camera = new RENDER.PerspectiveCamera( 45, this.width / this.height, 0.1, 100000 );

    //     this.canvas = renderer.domElement;
    //     document.body.appendChild( attrs.container );
    //     attrs.container.appendChild( this.canvas );

    //     attrs.autoSize && window.addEventListener( 'resize', this.resize.bind( this ) );
    //     this.resize( );

    //     attrs.autoStart && this.start( );

    //     if( attrs.userSelect ){
    //         var os = attrs.operator.style;
    //         os.webkitUserSelect = 'none';
    //         os.mozUserSelect = 'none';
    //         os.msUserSelect = 'none';
    //         os.userSelect = 'none';
    //     }

    // };

    // NDI.prototype.val = function( options ){

    //     var attrs = this.attributes;

    //     if( options !== undefined ){
            
    //         attrs.autoRun = math.check( options.autoRun, true );
    //         attrs.autoSize = math.check( options.autoSize, true );
    //         attrs.autoStart = math.check( options.autoStart, true );
    //         attrs.antialias = math.check( options.antialias, true );
    //         attrs.userSelect = math.check( options.userSelect, true );
    //         attrs.fullWindow = math.check( options.fullWindow, true );
    //         attrs.controlType = options.controlType || 'orbit'; // TODO: 支持其他控制类型
    //         attrs.rendererType = options.rendererType || 'webgl'; // TODO: 支持其他渲染类型
    //         attrs.cameraType = options.cameraType || 'perspective';// TODO: 支持其他摄像机类型
    //         attrs.container = options.container ? document.getElementById( options.container ) : document.createElement( 'div' );
    //         attrs.operator = options.operator ? document.getElementById( options.operator ) : attrs.container;
    //         attrs.yunHost = options.yunHost || '/api';
    //         attrs.yunid = options.yunid || '^[a-z0-9]{24}$';

    //     }else{

    //         return {

    //             autoRun : attrs.autoRun,
    //             autoSize : attrs.autoSize,
    //             autoStart : attrs.autoStart,
    //             antialias : attrs.antialias,
    //             userSelect : attrs.userSelect,
    //             fullWindow : attrs.fullWindow,
    //             rendererType : 'webgl', // TODO: 支持其他渲染类型
    //             rendererType : 'perspective', // TODO: 支持其他摄像机类型
    //             container : attrs.container.id,
    //             operator : attrs.operator.id,
    //             yunHost : attrs.yunHost,
    //             yunid: attrs.yunid
            
    //         }

    //     }

    // };

    // NDI.prototype.setHash = function( obj ){

    //     this.__hash__[ obj.id ] = obj;
    //     return this;

    // };

    // NDI.prototype.getHash = function( id ){

    //     return this.__hash__[ id ];

    // };

    // NDI.prototype.run = function( callback ){

    //     this.on( NDI.BEFORE_RENDER, callback );
    //     return this;

    // };

    // NDI.prototype.stop = function( callback ){

    //     this.off( NDI.BEFORE_RENDER, callback );
    //     return this;

    // };

    // NDI.prototype.resize = function( callback ){

    //     if( callback && typeof callback === 'function' ){

    //         this.on( NDI.RESIZE, callback );

    //     }else{

    //         var w, h;
    //         if( this.attributes.fullWindow ){

    //             w = window.innerWidth;
    //             h = window.innerHeight;

    //         }else{

    //             w = this.prototype.container.offsetWidth;
    //             h = this.prototype.container.offsetHeight;
    //         }

    //         this.__render__.renderer.setSize( w, h );
    //         this.__render__.camera.aspect = w / h;
    //         this.__render__.camera.updateProjectionMatrix( );
    //         this.width = w, this.height = h;
    //         this.trigger( NDI.RESIZE, w, h );

    //     }
    //     return this;

    // };

    // NDI.prototype.start = function( ){

    //     this.render( );
    //     return this;

    // };

    // NDI.prototype.get = function( name ){

    //     return this.attributes[ name ];

    // };

    // NDI.prototype.render = function( ){

    //     var render = this.__render__,
    //         camera = render.camera;
    //     this.attributes.autoRun && requestAnimationFrame( this.render.bind( this ) );
    //     var delta = render.clock.getDelta( );

    //     this.trigger( NDI.BEFORE_RENDER, delta );
        
    //     TWEEN.update( );

    //     if( this.cameraProxy ){
    //         camera.position.val( this.cameraProxy.positionWorld );
    //         camera.rotation.val( this.cameraProxy.rotationWorld );
    //     }

    //     render.renderer.render( render.scene, camera );

    //     return this;

    // };

    // NDI.prototype.add = function( o3d ){

    //     if( o3d instanceof RENDER.Object3D ){

    //         this.__render__.scene.add( o3d );

    //     }else{

    //         if( !!o3d.id ){
    //             this.__hash__[ o3d.id ] = o3d;
    //             this.__render__.scene.add( o3d.render );
    //         }else{
    //             this.add( o3d.render );
    //         }


    //     }

    //     return this;

    // };

    // NDI.prototype.enableMouse = function( ){

    //     this.mouseManager = this.mouseManager || new MouseManager( this.get( 'operator' ) );

    //     return this;

    // };

    // NDI.createAction = function( name, func ){

    //     if( NDI.prototype[ name ] ){

    //         console.error( '该动作名称已存在！' );

    //     }else{

    //         NDI.prototype[ name ] = function( options, data, callback ){

    //             var ndata = {};
    //             if( typeof data === 'function' ){
    //                 callback = data;
    //                 data = undefined;
    //             }
                
    //             // 过滤
    //             var filter = options.filter || [ ];
    //             if( data && filter === 'all' ){
    //                 ndata = undefined;
    //             }else{
    //                 for( d in data ){
    //                     if( filter.indexOf( d ) === -1 ){
    //                         ndata[ d ] = data[ d ];
    //                     }
    //                 }
    //             }

    //             // 继承
    //             var inherit = { };
    //             if( ndata && options.inherit === 'all' ){
                    
    //                 for( d in ndata ){
    //                     inherit[ d ] = d;
    //                 }

    //             }else if( Array.isArray( options.inherit ) ){
                
    //                 options.inherit.forEach( function( x ){
    //                     inherit[ x ] = x;
    //                 } );
                
    //             }else{

    //                 inherit = options.inherit;

    //             }

    //             func.call( this, options, ndata, function( nextData ){
                    
    //                 nextData = nextData || {};

    //                 for( d in inherit ){
    //                     nextData[ inherit[ d ] ] = ndata[ d ];
    //                 }

    //                 callback && callback( null, nextData );

    //             } );

    //             return this;

    //         };

    //     }

    // };


    // // 命令行 支持以命令行形式执行
    // NDI.createAction( 'cmd', function( options, data, callback ){

    //     var type = options.type || 'waterfall';

    //     var __this__ = this;
    //     if( !Array.isArray( options.commands ) ){

    //         if( typeof options.commands === 'object' && options.commands.action ){
    //             options.commands = [ options.commands ];
    //         }else{
    //             console.error( 'commands 不正确！' )
    //         }

    //     }

    //     var commands = options.commands.map( function( x ){

    //         return ( function( args, attr ){
    //             var insert = args[ 0 ].insert;
    //             return function( ){

    //                 for( var i = 0, il = arguments.length; i < il; i++ ){
    //                     // 上一个 data 插入 下一个 options
    //                     if( insert && i === 0 ){

    //                         for( var ii = 0, iil = insert.length; ii < iil; ii++ ){
    //                             var at = insert[ ii ];
    //                             args[ 0 ][ at ] = arguments[ 0 ][ at ];
    //                         }

    //                     }
    //                     args.push( arguments[ i ] );
    //                 }
    //                 __this__[ attr ].apply( __this__, args );
    //             }
    //         } )( [ x.options || {} ], x.action );

    //     } );

    //     data && type === 'waterfall' && commands.unshift( function( next ){
    //         next( null, data );
    //     } );

    //     async[ type ]( commands, function( ){
    //         callback && callback( );
    //     } );

    // } );


    // // 分支执行
    // NDI.createAction( 'branch', function( options, data, callback ){

    //     var __this__ = this;
    //     options.commands.forEach( function( x ){

    //         __this__.cmd( x, data );

    //     } );

    //     callback && callback( );

    // } );


    // // 延迟
    // NDI.createAction( 'delay', function( options, data, callback ){

    //     var __this__ = this;
    //     var time = options.time || 2;
    //     var start = Date.now( );
        
    //     function run ( delta ){

    //         var current = Math.min( ( Date.now( ) - start ) * .001, time ),
    //             progress = Math.min( current / time, 1 ),
    //             number = Math.floor( current );
    //         __this__.cmd( options.progress, {
    //             start: start, 
    //             end: start + time * 1000, 
    //             progress: progress, 
    //             current: current, 
    //             number: number, 
    //             total: time, 
    //             rootData: data 
    //         } );
    //         progress === 1 && __this__.stop( run );

    //     }
        
    //     options.progress && this.run( run );

    //     setTimeout( callback, time * 1000 );

    // } );


    // // 添加 Mesh
    // NDI.createAction( 'mesh', function( options, data, callback ){

    //     var __this__ = this;
    //     options.renderType = 'mesh';
    //     Model( options, this, function( ){

    //         __this__.add( this );
    //         callback && callback( { model: this } );

    //     } );

    // } );


    // // 新建材质
    // NDI.createAction( 'material', function( options, data, callback ){

    //     var material = this.getHash( options.id );
    //     var __this__ = this;

    //     if( material ){

    //         callback && callback( { material: material } );

    //     }else{

    //         Material( options, this, function( ){

    //             __this__.setHash( this );
    //             callback && callback( { material: this } );

    //         } );

    //     }

    // } );


    // // 新建贴图
    // NDI.createAction( 'map', function( options, data, callback ){

    //     var map = this.getHash( options.id );
    //     var __this__ = this;

    //     if( map ){

    //         callback && callback( { map: map } );

    //     }else{

    //         Map( options, this, function( ){

    //             __this__.setHash( this );
    //             callback && callback( { map: this } );

    //         } );

    //     }

    // } );


    // // 设置相机
    // NDI.createAction( 'camera', function( options, data, callback ){

    //     this.cameraProxy = this.__hash__[ options.id ] = this.__hash__[ options.id ] || new OrbitCamera( options, this );
    //     callback && callback( this.cameraProxy );

    // } );


    // // 添加灯光
    // NDI.createAction( 'light', function( options, data, callback ){

    //     var light;
    //     switch( options.type ){
    //         case 'ambient':
    //             light = new RENDER.AmbientLight( options.color || 0xFFFFFF, options.intensity || 1 );
    //             break;
    //         case 'directional':
    //             var light = new RENDER.DirectionalLight( options.color || 0xFFFFFF, options.intensity || 1 );
    //             light.position.val( options.position || [ 0,0,0 ] );
    //             break;
    //     }
    //     this.add( light );
    //     this.__hash__[ options.id ] = light;
    //     callback && callback( light );

    // } );


    // // 重置参数
    // NDI.createAction( 'set', function( options, data, callback ){

    //     var id = options.id,
    //         values = options.values;
    //     var obj;

    //     if( id === 'camera' ){
    //         obj = this.cameraProxy;
    //     }else{
    //         obj = this.__hash__[ options.id ];
    //     }

    //     for ( v in values ){

    //         obj.set( v, values[ v ] );
        
    //     }

    //     callback && callback( );

    // } );


    // // 动画
    // NDI.createAction( 'animate', function( options, data, callback ){

    //     var id = options.id,
    //         values = options.values;
    //     var obj;

    //     if( id === 'camera' ){
    //         obj = this.cameraProxy;
    //     }else{
    //         obj = this.__hash__[ options.id ];
    //     }
    //     var ovs = obj.val( )

    //     var tween = new TWEEN.Tween( { animate:0 } )
    //         .to( { animate:1 }, ( options.time || 1 ) * 1000 )
    //         .easing( TWEEN.Easing[ options.easing || 'Linear' ][ options.type || 'None' ] )
    //         .onUpdate( update )
    //         .onComplete( function( ){
    //             callback && callback( );
    //         } )
    //         .start( );

    //     function update( ){

    //         var __this__ = this;

    //         for ( v in values ){

    //             var ov = ovs[ v ],
    //                 nv = values[ v ];

    //             if( Array.isArray( nv ) ){
    //                 nv = nv.map( function( x, i ){
    //                     return ov[ i ] + ( x - ov[ i ] ) * __this__.animate;
    //                 } );
    //             }else{
    //                 nv = ov + ( nv - ov ) * __this__.animate;
    //             }
    //             obj.set( v, nv );
                
    //         }

    //     }

    // } );

    // // 删除
    // NDI.createAction( 'remove', function( options, data, callback ){

    //     var model = this.getHash( options.id );
    //     if( model ){

    //         var rm = model.render;
    //         rm.parent.remove( rm );
    //         delete this.__hash__[ options.id ];

    //     }
    //     callback && callback( );

    // } );


    // NDI.ready = ( function( ){
    //     var event = new Events( );
    //     return function( callback ){

    //         if( typeof callback === 'function' ){
    //             event.on( 'ready', callback );
    //         }else{
    //             event.trigger( 'ready' );
    //         }

    //     };

    // } )( );

    // ( function( ){

    //     // A fallback to window.onload, that will always work
    //     function addLoadEvent( func ) {
    //         var oldonload = window.onload;
    //         if ( typeof window.onload != 'function' ) {
    //             window.onload = func;
    //         } else {
    //             window.onload = function( ) {
    //                 if ( oldonload ) {
    //                     oldonload( );
    //                 }
    //                 func( );
    //             }
    //         }
    //     };

    //     function domReady( ){
    //         if( !isReady ) {
    //             isReady = true;
    //             NDI.ready( );
    //         }
    //     }

    //     var userAgent = navigator.userAgent.toLowerCase( );
    //     var browser = NDI.browser = {
    //         version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1],
    //         safari: /webkit/.test(userAgent),
    //         opera: /opera/.test(userAgent),
    //         msie: (/msie/.test(userAgent)) && (!/opera/.test( userAgent )),
    //         mozilla: (/mozilla/.test(userAgent)) && (!/(compatible|webkit)/.test(userAgent))
    //     };

    //     var isReady = false, readyBound = false;

    //     if( readyBound ) {
    //         return;
    //     }

    //     readyBound = true;

    //     // Mozilla, Opera (see further below for it) and webkit nightlies currently support this event
    //     if ( document.addEventListener && !browser.opera ) {
    //         // Use the handy event callback
    //         document.addEventListener( 'DOMContentLoaded', domReady, false );
    //     }

    //     // If IE is used and is not in a frame
    //     // Continually check to see if the document is ready
    //     if ( browser.msie && window == top ) ( function( ){

    //         if ( isReady ) return;
    //         try {
    //             // If IE is used, use the trick by Diego Perini
    //             // http://javascript.nwbox.com/IEContentLoaded/
    //             document.documentElement.doScroll( 'left' );
    //         } catch( error ) {
    //             setTimeout( arguments.callee, 0 );
    //             return;
    //         }
    //         // and execute any waiting functions
    //         domReady( );

    //     } )( );

    //     if( browser.opera ) {
    //         document.addEventListener( 'DOMContentLoaded', function ( ) {
    //             if ( isReady ) return;
    //             for ( var i = 0; i < document.styleSheets.length; i++ )
    //                 if ( document.styleSheets[ i ].disabled ) {
    //                 setTimeout( arguments.callee, 0 );
    //                 return;
    //             }
    //             // and execute any waiting functions
    //             domReady( );
    //         }, false);
    //     }

    //     if( browser.safari ) {
    //         var numStyles;
    //         ( function( ){
    //             if ( isReady ) return;
    //             if ( document.readyState != 'loaded' && document.readyState != 'complete' ) {
    //                 setTimeout( arguments.callee, 0 );
    //                 return;
    //             }
    //             if ( numStyles === undefined ) {
    //                 var links = document.getElementsByTagName( 'link' );
    //                 for ( var i = 0; i < links.length; i++ ) {
    //                     if( links[ i ].getAttribute( 'rel' ) == 'stylesheet' ) {
    //                         numStyles++;
    //                     }
    //                 }
    //                 var styles = document.getElementsByTagName( 'style' );
    //                 numStyles += styles.length;
    //             }
    //             if ( document.styleSheets.length != numStyles ) {
    //                 setTimeout( arguments.callee, 0 );
    //                 return;
    //             }

    //             // and execute any waiting functions
    //             domReady( );

    //         } )( );
    //     }

    //     addLoadEvent( domReady );

    // } )( );

    module.exports = ndi;

} );