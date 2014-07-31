define( function( require, exports, module ) {

    var Events = require( 'ndi.events' );

    function mix( d, o ){
        var options = {};
        Object.keys( d ).forEach( function( attr ){
            options[ attr ] = ( o[ attr ] === undefined ? d[ attr ] : o[ attr ] );
        } );
        return options;
    }

    function Base( nid, app, options ){

        app.__resource__[ nid ] = this;
        this.app = app;
        this.options = mix( this.defaults || {}, options || {} );
        this.nid = nid;

    }

    Events.mixTo( Base );

    Base.prototype.end = function( ){
        return this.app;
    };
    
    Base.prototype.view = function( ){
        return this.app.view( );
    };

    module.exports = Base;
	
} );