define("ndi/material/0.1.0/material-debug", [ "ndi/render/0.58.0/render-debug" ], function(require, exports, module) {
    var RENDER = require("ndi/render/0.58.0/render-debug");
    function Material(options) {
        if (typeof this === "object" && !(this instanceof Material)) {
            return new Material(options);
        }
        options.id !== undefined && (this.id = options.id);
        this.material = null;
        this.attributes = {};
        this.val(options);
        this.__init__();
    }
    Material.prototype.__init__ = function() {
        var attrs = this.attributes;
        // Material
        var matType = "MeshBasicMaterial";
        if (attrs.ambient !== undefined || attrs.emissive !== undefined || attrs.wrapAround !== undefined || attrs.wrapRGB !== undefined || attrs.morphNormals !== undefined) {
            matType = "MeshLambertMaterial";
        }
        if (attrs.specular !== undefined || attrs.shininess !== undefined || attrs.metal !== undefined || attrs.perPixel !== undefined || attrs.bumpMap !== undefined || attrs.skinning !== undefined || attrs.normalMap !== undefined || attrs.normalScale !== undefined) {
            matType = "MeshPhongMaterial";
        }
        this.material = new RENDER[matType](attrs);
    };
    Material.prototype.val = function(options) {
        var attrs = this.attributes;
        if (options !== undefined) {
            attrs.side = options.side;
            attrs.opacity = options.opacity;
            attrs.transparent = options.transparent;
            attrs.blending = options.blending;
            attrs.blendSrc = options.blendSrc;
            attrs.blendEquation = options.blendEquation;
            attrs.depthTest = options.depthTest;
            attrs.depthWrite = options.depthWrite;
            attrs.polygonOffset = options.polygonOffset;
            attrs.polygonOffsetFactor = options.polygonOffsetFactor;
            attrs.polygonOffsetUnits = options.polygonOffsetUnits;
            attrs.alphaTest = options.alphaTest;
            attrs.overdraw = options.overdraw;
            attrs.visible = options.visible;
            attrs.needsUpdate = options.needsUpdate;
            // MeshBasicMaterial
            attrs.color = options.color;
            attrs.map = options.map;
            attrs.lightMap = options.lightMap;
            attrs.specularMap = options.specularMap;
            attrs.envMap = options.envMap;
            attrs.combine = options.combine;
            attrs.reflectivity = options.reflectivity;
            attrs.refractionRatio = options.refractionRatio;
            attrs.fog = options.fog;
            attrs.shading = options.shading;
            attrs.wireframe = options.wireframe;
            attrs.wireframeLinewidth = options.wireframeLinewidth;
            attrs.wireframeLinecap = options.wireframeLinecap;
            attrs.wireframeLinejoin = options.wireframeLinejoin;
            attrs.vertexColors = options.vertexColors;
            attrs.skinning = options.skinning;
            attrs.morphTargets = options.morphTargets;
            // MeshLambertMaterial
            attrs.ambient = options.ambient;
            attrs.emissive = options.emissive;
            attrs.wrapAround = options.wrapAround;
            attrs.wrapRGB = options.wrapRGB;
            attrs.morphNormals = options.morphNormals;
            // MeshPhongMaterial
            attrs.specular = options.specular;
            attrs.shininess = options.shininess;
            attrs.metal = options.metal;
            attrs.perPixel = options.perPixel;
            attrs.bumpMap = options.bumpMap;
            attrs.bumpScale = options.bumpScale;
            attrs.normalMap = options.normalMap;
            attrs.normalScale = options.normalScale;
            for (m in attrs) {
                if (attrs[m] === undefined) {
                    delete attrs[m];
                }
            }
        } else {
            return {
                side: attrs.side,
                opacity: attrs.opacity,
                transparent: attrs.transparent,
                blending: attrs.blending,
                blendSrc: attrs.blendSrc,
                blendEquation: attrs.blendEquation,
                depthTest: attrs.depthTest,
                depthWrite: attrs.depthWrite,
                polygonOffset: attrs.polygonOffset,
                polygonOffsetFactor: attrs.polygonOffsetFactor,
                polygonOffsetUnits: attrs.polygonOffsetUnits,
                alphaTest: attrs.alphaTest,
                overdraw: attrs.overdraw,
                visible: attrs.visible,
                needsUpdate: attrs.needsUpdate,
                color: attrs.color,
                map: attrs.map,
                lightMap: attrs.lightMap,
                specularMap: attrs.specularMap,
                envMap: attrs.envMap,
                combine: attrs.combine,
                reflectivity: attrs.reflectivity,
                refractionRatio: attrs.refractionRatio,
                fog: attrs.fog,
                shading: attrs.shading,
                wireframe: attrs.wireframe,
                wireframeLinewidth: attrs.wireframeLinewidth,
                wireframeLinecap: attrs.wireframeLinecap,
                wireframeLinejoin: attrs.wireframeLinejoin,
                vertexColors: attrs.vertexColors,
                skinning: attrs.skinning,
                morphTargets: attrs.morphTargets,
                ambient: attrs.ambient,
                emissive: attrs.emissive,
                wrapAround: attrs.wrapAround,
                wrapRGB: attrs.wrapRGB,
                morphNormals: attrs.morphNormals,
                specular: attrs.specular,
                shininess: attrs.shininess,
                metal: attrs.metal,
                perPixel: attrs.perPixel,
                bumpMap: attrs.bumpMap,
                bumpScale: attrs.bumpScale,
                normalMap: attrs.normalMap,
                normalScale: attrs.normalScale
            };
        }
    };
    module.exports = Material;
});
