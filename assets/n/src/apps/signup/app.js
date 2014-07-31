define( function( require, exports, module ) {

	var models = require( 'cloud.models' );
	var Backbone = require( 'gallery.backbone' );

	var user = new models.User( );

	var View = Backbone.View.extend( {

		el: '#signup',
		id: 'signup',

		usernameDom: '#username',
		passwordDom: '#password',
		emailDom: '#email',
		submitDom: '#submit',

		model: user,
		events: {
			'change #username': 'username',
			'change #password': 'password',
			'change #email': 'email',
			'click #submit': 'signup',
			'click #remove': 'remove'
		},
		username: function( ){

			var value = this.$( this.usernameDom ).val( );

			this.model.set( {
				username : value
			} );

		},
		password: function( ){

			var value = this.$( this.passwordDom ).val( );

			this.model.set( {
				password : value
			} );

		},
		email: function( ){

			var value = this.$( this.emailDom ).val( );

			this.model.set( {
				email : value
			} );

		},
		signup: function( ){

			this.model.save( { provider: 'local' } );

		},
		remove: function( ){

			this.model.set( {
				_id: this.$( '#mid' ).val( )
			} );
			this.model.destroy( {
				success: function( model, response ){
					console.log( model, response );
				}
			} );
		
		}

	} );

	var view = new View( );

} );