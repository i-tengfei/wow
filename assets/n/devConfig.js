var module = module || { exports:{} };
var seajs = seajs || { config:function ( ) { } }
module.exports = {
	alias:{
		'ndi.ndi'		: 'dev/../../src/modules/ndi/src/ndi',
		'ndi.events'	: 'dev/../../src/modules/events/src/events',
		'ndi.base'		: 'dev/../../src/modules/base/src/base',
		'ndi.view'		: 'dev/../../src/modules/view/src/view',
		'ndi.render'	: 'dev/../../src/modules/render/src/render',
		'ndi.sensor'	: 'dev/../../src/modules/sensor/src/sensor',
		'ndi.geometry'	: 'dev/../../src/modules/geometry/src/geometry',
		
        'ndi.o3d' : 'dev/../../src/modules/o3d/src/o3d',
		'ndi.model' : 'dev/../../src/modules/model/src/model',
		'ndi.key-manager' : 'dev/../../src/modules/key-manager/src/key-manager',
		'ndi.event-listener' : 'dev/../../src/modules/event-listener/src/event-listener',
		'ndi.orbit-camera' : 'dev/../../src/modules/orbit-camera/src/orbit-camera',
		'ndi.math' : 'dev/../../src/modules/math/src/math',
		'ndi.async' : 'dev/../../src/modules/async/src/async',
		'ndi.material' : 'dev/../../src/modules/material/src/material',
		'ndi.tween' : 'dev/../../src/modules/tween/src/tween',
		'ndi.render-extend' : 'dev/../../src/modules/render-extend/src/render-extend',
		'ndi.map' : 'dev/../../src/modules/map/src/map',
		'ndi.touch' : 'dev/../../src/modules/touch/src/touch',
		'ndi.loader' : 'dev/../../src/modules/loader/src/loader',

		'jquery.jquery' : 'jquery/jquery/2.0.2/jquery',
		'gallery.backbone' : 'gallery/backbone/1.0.0/backbone',
		'gallery.art-template' : 'gallery/art-template/2.0.1/art-template',


		'cloud.models' : 'dev/../../src/modules/models/src/models',
		'cloud.range' : 'dev/../../src/modules/range/src/range',
		'cloud.scroller' : 'dev/../../src/modules/scroller/src/scroller',
		'cloud.tga'	: 'dev/../../src/modules/tga/src/tga'
	},
	debug:1
};

seajs && seajs.config( module.exports ); 