define("ndi/model/0.1.0/model-debug", [ "ndi/render/0.58.0/render-debug" ], function(require, exports, module) {
    var RENDER = require("ndi/render/0.58.0/render-debug");
    var types = {
        type: [ "own", "load", "yun" ],
        geo: [ "cube" ]
    };
    function checkTypes(root, type) {
        var ntypes = types[root];
        if (ntypes.indexOf(type) === -1) {
            console.warn("类型错误，必须为", ntypes, "之一！");
            type = ntypes[0];
        }
        return type;
    }
    function Model(options) {
        if (typeof this === "object" && !(this instanceof Model)) {
            return new Model(options);
        }
        this.__render__ = {};
        this.attributes = {};
        this.val(options);
        this.__init__();
    }
    Model.prototype.__init__ = function() {
        var attrs = this.attributes, render = this.__render__, mat = attrs.mat;
        var model, geometry, material;
        // Geometry;
        if (attrs.type === "own") {
            if (attrs.geometryType === "cube") {
                geometry = render.geometry = new RENDER.CubeGeometry(5, 5, 5);
            }
        }
        // Material
        var matType = "MeshBasicMaterial";
        if (mat.ambient !== undefined || mat.emissive !== undefined || mat.wrapAround !== undefined || mat.wrapRGB !== undefined || mat.morphNormals !== undefined) {
            matType = "MeshLambertMaterial";
        }
        if (mat.specular !== undefined || mat.shininess !== undefined || mat.metal !== undefined || mat.perPixel !== undefined || mat.bumpMap !== undefined || mat.skinning !== undefined || mat.normalMap !== undefined || mat.normalScale !== undefined) {
            matType = "MeshPhongMaterial";
        }
        if (attrs.type === "own") {
            material = new RENDER[matType](mat);
        }
        if (attrs.renderType === "mesh") {
            model = new RENDER.Mesh(geometry, material);
        }
        model.position = attrs.position;
        model.rotation = attrs.rotation;
        render.model = model;
    };
    Model.prototype.val = function(options) {
        var attrs = this.attributes;
        if (options !== undefined) {
            attrs.type = checkTypes("type", options.type || "own");
            attrs.renderType = options.renderType || "mesh";
            attrs.position = new RENDER.Vector3();
            attrs.rotation = new RENDER.Vector3();
            options.position && attrs.position.val(options.position);
            options.rotation && attrs.rotation.val(options.rotation);
            var mat = attrs.mat = {};
            // 材质
            mat.side = options.side;
            mat.opacity = options.opacity;
            mat.transparent = options.transparent;
            mat.blending = options.blending;
            mat.blendSrc = options.blendSrc;
            mat.blendEquation = options.blendEquation;
            mat.depthTest = options.depthTest;
            mat.depthWrite = options.depthWrite;
            mat.polygonOffset = options.polygonOffset;
            mat.polygonOffsetFactor = options.polygonOffsetFactor;
            mat.polygonOffsetUnits = options.polygonOffsetUnits;
            mat.alphaTest = options.alphaTest;
            mat.overdraw = options.overdraw;
            mat.visible = options.visible;
            mat.needsUpdate = options.needsUpdate;
            // MeshBasicMaterial
            mat.color = options.color;
            mat.map = options.map;
            mat.lightMap = options.lightMap;
            mat.specularMap = options.specularMap;
            mat.envMap = options.envMap;
            mat.combine = options.combine;
            mat.reflectivity = options.reflectivity;
            mat.refractionRatio = options.refractionRatio;
            mat.fog = options.fog;
            mat.shading = options.shading;
            mat.wireframe = options.wireframe;
            mat.wireframeLinewidth = options.wireframeLinewidth;
            mat.wireframeLinecap = options.wireframeLinecap;
            mat.wireframeLinejoin = options.wireframeLinejoin;
            mat.vertexColors = options.vertexColors;
            mat.skinning = options.skinning;
            mat.morphTargets = options.morphTargets;
            // MeshLambertMaterial
            mat.ambient = options.ambient;
            mat.emissive = options.emissive;
            mat.wrapAround = options.wrapAround;
            mat.wrapRGB = options.wrapRGB;
            mat.morphNormals = options.morphNormals;
            // MeshPhongMaterial
            mat.specular = options.specular;
            mat.shininess = options.shininess;
            mat.metal = options.metal;
            mat.perPixel = options.perPixel;
            mat.bumpMap = options.bumpMap;
            mat.bumpScale = options.bumpScale;
            mat.normalMap = options.normalMap;
            mat.normalScale = options.normalScale;
            for (m in mat) {
                if (mat[m] === undefined) {
                    delete mat[m];
                }
            }
            // 基础类型
            if (attrs.type === "own") {
                attrs.geometryType = checkTypes("geo", options.geometryType || "cube");
            } else if (attrs.type === "load") {} else if (attrs.type === "yun") {
                options.yunid || console.error("yunid 不可为空！");
                attrs.yunid = options.yunid;
            }
            var model = this.__render__.model;
            if (model) {
                model.position.val(attrs.position);
                model.rotation.val(attrs.rotation);
            }
        } else {
            var mat = attrs.mat;
            var out = {
                type: attrs.type,
                renderType: attrs.renderType,
                position: this.__render__.model.position.val(),
                rotation: this.__render__.model.rotation.val(),
                side: mat.side,
                opacity: mat.opacity,
                transparent: mat.transparent,
                blending: mat.blending,
                blendSrc: mat.blendSrc,
                blendEquation: mat.blendEquation,
                depthTest: mat.depthTest,
                depthWrite: mat.depthWrite,
                polygonOffset: mat.polygonOffset,
                polygonOffsetFactor: mat.polygonOffsetFactor,
                polygonOffsetUnits: mat.polygonOffsetUnits,
                alphaTest: mat.alphaTest,
                overdraw: mat.overdraw,
                visible: mat.visible,
                needsUpdate: mat.needsUpdate,
                color: mat.color,
                map: mat.map,
                lightMap: mat.lightMap,
                specularMap: mat.specularMap,
                envMap: mat.envMap,
                combine: mat.combine,
                reflectivity: mat.reflectivity,
                refractionRatio: mat.refractionRatio,
                fog: mat.fog,
                shading: mat.shading,
                wireframe: mat.wireframe,
                wireframeLinewidth: mat.wireframeLinewidth,
                wireframeLinecap: mat.wireframeLinecap,
                wireframeLinejoin: mat.wireframeLinejoin,
                vertexColors: mat.vertexColors,
                skinning: mat.skinning,
                morphTargets: mat.morphTargets,
                ambient: mat.ambient,
                emissive: mat.emissive,
                wrapAround: mat.wrapAround,
                wrapRGB: mat.wrapRGB,
                morphNormals: mat.morphNormals,
                specular: mat.specular,
                shininess: mat.shininess,
                metal: mat.metal,
                perPixel: mat.perPixel,
                bumpMap: mat.bumpMap,
                bumpScale: mat.bumpScale,
                normalMap: mat.normalMap,
                normalScale: mat.normalScale
            };
            if (out.type === "own") {
                out.geometryType = attrs.geometryType;
            } else if (out.type === "yun") {
                out.yunid = attrs.yunid;
            }
            return out;
        }
    };
    module.exports = Model;
});
