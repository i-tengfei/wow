define( function( require, exports, module ) {

	var RENDER = require( 'ndi.render' ),
		Base = require( 'ndi.base' );
	
	function Material( nid, app, options ){

		this.defaults = {
			type: 'Phong',
			visible: true,
			color: 0xFFFFFF,
			ambient: 0xFFFFFF,
			emissive: 0x000000,
			specular: 0x111111,
			shininess: 30,
			opacity: 1,
			transparent: false,
			metal: false,
			perPixel: true,
			map: null,
			bumpMap: null,
			lightMap: null,
			normalMap: null,
			specularMap: null,
			envMap: null,
			bumpScale: 1,
			normalScale: [ 1,1 ],
			side: RENDER.FrontSide,
			wireframe: false,
			wireframeLinewidth: 1,
			wireframeLinecap: 'round',
			wireframeLinejoin: 'round',
			reflectivity: 1,
			refractionRatio: 0.98,
			alphaTest: 0,
			fog: true,
			vertexColors: RENDER.NoColors,
			shading: RENDER.NoShading,
			blending: RENDER.NormalBlending,
			blendSrc: RENDER.SrcAlphaFactor,
			blendEquation: RENDER.AddEquation,
			depthTest: true,
			depthWrite: true,
			polygonOffset: false,
			polygonOffsetFactor: 0,
			polygonOffsetUnits: 0,
			combine: RENDER.MultiplyOperation,
			wrapAround: false,
			wrapRGB: [1,1,1],
			skinning: false,
			morphTargets: false,
			morphNormals: false,
		};
		Base.call( this, nid, app, options );

		var options = this.options;
		var material = new RENDER[ 'Mesh' + options.type + 'Material' ]( options );

		this.current = material;

	}
	Material.prototype = Object.create( Base.prototype );

	module.exports = Material;
	
} );