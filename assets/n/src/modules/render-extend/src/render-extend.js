define( function( require, exports, module ) {

	var RENDER = require( 'ndi.render' );
    
    function isNum( x ){
        return typeof x === 'number';
    }
    
    function isVec2( v ){
        return v && isNum( v.x ) && isNum( v.y );
    }
    
    function isVec3( v ){
        return v && isNum( v.x ) && isNum( v.y ) && isNum( v.z );
    }
    
    var vec3Extend = {

		val: function( x,y,z ){

			if( isNum( x ) && isNum( y ) && isNum( z ) ){

				this.x = x;
				this.y = y;
				this.z = z;
				
				return this;

			}else if( Array.isArray( x ) && x.length === 3 && y === undefined ){

				return this.val( x[ 0 ], x[ 1 ], x[ 2 ] );

			}else if( isVec3( x ) && y === undefined ){

				return this.val( x.x, x.y, x.z );

			}else if( x === undefined ){

				return [ this.x, this.y, this.z ];

			}

		},

		mul: function( x,y,z ){

			if( isNum( x ) && isNum( y ) && isNum( z ) ){

				this.x *= x;
				this.y *= y;
				this.z *= z;

				return this;

			}else if( isVec3( x ) && isVec3( y ) && z === undefined ){

				return this.val( x ).mul( y );

			}else if( isVec3( x ) && y === undefined ){

				return this.mul( x.x, x.y, x.z );

			}else if( isNum( x ) && y === undefined ){

				return this.mul( x, x, x );

			}

		}
	};

	RENDER.extend( RENDER.Color.prototype, {
        
		val: function( ){

			return this.getHex( );

		}
        
	} );

	RENDER.extend( RENDER.Vector2.prototype, {
        
		val: function( x,y ){

			if( isNum( x ) && isNum( y ) ){

				this.x = x;
				this.y = y;
				
				return this;

			}else if( Array.isArray( x ) && x.length === 2 && y === undefined ){

				return this.val( x[ 0 ], x[ 1 ] );

			}else if( isVec2( x ) && y === undefined ){

				return this.val( x.x, x.y );

			}else if( x === undefined ){

				return [ this.x, this.y ];

			}
		}

	} );

	RENDER.extend( RENDER.Euler.prototype, vec3Extend );

	RENDER.extend( RENDER.Vector3.prototype, vec3Extend );
    
    var __add__ = RENDER.Object3D.prototype.add;

	RENDER.extend( RENDER.Object3D.prototype, {
        
        pos: function( x,y,z ){
            
            this.position.val( x,y,z );
            if( x === undefined ){
                return this.position;
            }else{
                return this;
            }
            
        },
        
        rot: function( x,y,z ){
            
            this.rotation.val( x,y,z );
            if( x === undefined ){
                return this.rotation;
            }else{
                return this;
            }
            
        },
        
        add: function( child ){
            
            __add__.call( this, typeof child === 'string' ? this.app.get( child ) : child );
            return this;
            
        }
        
    } );

} );