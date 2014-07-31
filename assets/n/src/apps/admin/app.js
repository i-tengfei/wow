define( function( require, exports, module ) {

    var Backbone = require( 'gallery.backbone' );
    var models = require( 'cloud.models' );
    var template = require( 'gallery.art-template' );

    var materials = new models.Materials( );
    var maps = new models.Maps( );

	var MaterialView = Backbone.View.extend( {
        el: '#admin',
        id: 'admin',
        model : materials,
        template: template.render,
        events: {
            'click #materialsBtn': 'renderMaterials',
            'click .btnMaterialDel': 'delMaterial'
        },
        renderMaterials: function( ){
            setSeletedBg.apply(this,[event]);
            mView.model.fetch( {
                success:function( model, result ){
                    result.title="材质列表"
                    this.$( '#content' ).html( this.template( 'renderMaterials', { list:result } ) );
                }
            } );
        },
        delMaterial:function( event ){
            var $this=this.$( event.target );
            this.model.get( $this.parent()[ 0 ].id ).destroy( {
                success:function(model,response){
                    $this.parent().remove();
                },
                error:function(a,b,c){
                    console.log(a,b,c);
                }
            } );
        }
    } );

    var TextureView = Backbone.View.extend( {
        el: '#admin',
        id: 'admin',
        model : maps,
        template: template.render,
        events: {
            'click #textureBtn': 'renderTexture',
            'click .btnTextureDel': 'delTexture'
        },
        renderTexture: function( event ){
            setSeletedBg.apply(this,[event]);
            tView.model.fetch( {
                success:function( model, result ){
                    result.title="贴图列表"
                    this.$( '#content' ).html( this.template( 'renderTexture', { list:result } ) );
                }
            } );
        },
        delTexture:function( event ){
            var $this=this.$( event.target );
            this.model.get( $this.parent()[ 0 ].id ).destroy( {
                success:function(model,response){
                    $this.parent().remove();
                },
                error:function(a,b,c){
                    console.log(a,b,c);
                }
            } );
        }
    } );

    var mView = new MaterialView( );
    var tView = new TextureView();

    //------------------------------------------------------------------------------------------------------------------
    //公用函数
    //------------------------------------------------------------------------------------------------------------------
    function setSeletedBg(event){
        this.$(".selected").removeClass("selected");
        this.$(event.target).parent().addClass("selected");
    }

} );