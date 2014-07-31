define("ndi/map/0.1.0/map-debug", [ "ndi/render/0.58.0/render-debug", "ndi/math/0.1.0/math-debug" ], function(require, exports, module) {
    var RENDER = require("ndi/render/0.58.0/render-debug");
    var math = require("ndi/math/0.1.0/math-debug");
    function mix(from) {
        for (attr in hash) {
            from[attr] = from[attr] === undefined ? hash[attr].default : from[attr];
        }
    }
    function Map(options) {
        if (typeof this === "object" && !(this instanceof Map)) {
            return new Map(options);
        }
        options.id !== undefined && (this.id = options.id);
        this.texture = null;
        this.attributes = {};
        this.val(options);
        this.__init__();
    }
    Map.prototype.__init__ = function() {
        var texture, attrs = this.attributes;
        var image = new Image();
        if (!attrs.__delay__) {
            image.src = attrs.image;
        }
        image.onload = function() {
            texture.needsUpdate = true;
        };
        texture = new RENDER.Texture(image, attrs.mapping, attrs.wrapS, attrs.wrapT, attrs.magFilter, attrs.minFilter, attrs.format, attrs.type, attrs.anisotropy);
        texture.name = attrs.name;
        texture.mipmaps = attrs.mipmaps;
        texture.offset = new RENDER.Vector2().val(attrs.offset);
        texture.repeat = new RENDER.Vector2().val(attrs.repeat);
        texture.generateMipmaps = attrs.generateMipmaps;
        texture.premultiplyAlpha = attrs.premultiplyAlpha;
        texture.flipY = attrs.flipY;
        texture.unpackAlignment = attrs.unpackAlignment;
        texture.sourceFile = attrs.sourceFile;
        this.texture = texture;
    };
    Map.prototype.val = function(options) {
        var attrs = this.attributes;
        if (options !== undefined) {
            mix(options);
            for (name in hash) {
                attrs[name] = this.set(name, options[name]);
            }
            attrs.name = attrs.name || options.id;
            attrs.__delay__ = options.__delay__;
        } else {
            return {
                name: attrs.name,
                image: attrs.sourceFile,
                mipmaps: attrs.mipmaps,
                mapping: this.constName("mapping"),
                wrapS: this.constName("wrapS"),
                wrapT: this.constName("wrapT"),
                magFilter: this.constName("magFilter"),
                minFilter: this.constName("minFilter"),
                anisotropy: attrs.anisotropy,
                format: this.constName("format"),
                type: this.constName("type"),
                offset: this.offset,
                repeat: this.repeat,
                generateMipmaps: this.generateMipmaps,
                premultiplyAlpha: this.premultiplyAlpha,
                flipY: this.flipY,
                unpackAlignment: this.unpackAlignment,
                sourceFile: this.sourceFile
            };
        }
    };
    Map.prototype.constName = function(type) {
        var value = this.attributes[type];
        var con = hash[type].constant;
        for (c in con) {
            if (con[c] === value) {
                return c;
            }
        }
    };
    Map.prototype.set = function(name, value) {
        if (typeof name === "object") {
            for (n in name) {
                return this.set(n, name[n]);
            }
        } else {
            var attrs = this.attributes;
            var texture = this.texture, result;
            var type = hash[name].setType;
            switch (type) {
              case "value":
                result = value;
                break;

              case "const":
                result = typeof value === "string" ? hash[name].constant[value] : value;
                break;

              case "image":
                result = typeof value === "string" ? value : value.src || "";
                this.texture && this.texture.image && (this.texture.image.src = value);
                break;

              case "vec2":
                result = math.arr2vec2(value);
                break;

              case "vec3":
                result = math.arr2vec3(value);
                break;
            }
            attrs[name] = result;
            return result;
        }
    };
    Map.config = [ {
        name: "name",
        cname: "名称",
        "default": "",
        type: "string",
        setType: "value"
    }, {
        name: "image",
        cname: "图片",
        "default": "",
        type: "string",
        setType: "image"
    }, {
        name: "mipmaps",
        cname: "mipmaps",
        "default": [],
        type: "array",
        setType: "value"
    }, {
        name: "mapping",
        cname: "mapping",
        "default": "uv",
        type: "select",
        setType: "newConst",
        constant: {
            uv: RENDER.UVMapping,
            cubeReflection: RENDER.CubeReflectionMapping,
            cubeRefraction: RENDER.CubeRefractionMapping,
            sphericalReflection: RENDER.SphericalReflectionMapping,
            sphericalRefraction: RENDER.SphericalRefractionMapping
        }
    }, {
        name: "wrapS",
        cname: "wrapS",
        "default": "clampToEdge",
        type: "select",
        setType: "const",
        constant: {
            repeat: RENDER.RepeatWrapping,
            clampToEdge: RENDER.ClampToEdgeWrapping,
            mirroredRepeat: RENDER.MirroredRepeatWrapping
        }
    }, {
        name: "wrapT",
        cname: "wrapT",
        "default": "clampToEdge",
        type: "select",
        setType: "const",
        constant: {
            repeat: RENDER.RepeatWrapping,
            clampToEdge: RENDER.ClampToEdgeWrapping,
            mirroredRepeat: RENDER.MirroredRepeatWrapping
        }
    }, {
        name: "magFilter",
        cname: "magFilter",
        "default": "linear",
        type: "select",
        setType: "const",
        constant: {
            nearest: RENDER.NearestFilter,
            nearestMipMapNearest: RENDER.NearestMipMapNearestFilter,
            nearestMipMapLinear: RENDER.NearestMipMapLinearFilter,
            linear: RENDER.LinearFilter,
            linearMipMapNearest: RENDER.LinearMipMapNearestFilter,
            linearMipMapLinear: RENDER.LinearMipMapLinearFilter
        }
    }, {
        name: "minFilter",
        cname: "minFilter",
        "default": "linearMipMapLinear",
        type: "select",
        setType: "const",
        constant: {
            nearest: RENDER.NearestFilter,
            nearestMipMapNearest: RENDER.NearestMipMapNearestFilter,
            nearestMipMapLinear: RENDER.NearestMipMapLinearFilter,
            linear: RENDER.LinearFilter,
            linearMipMapNearest: RENDER.LinearMipMapNearestFilter,
            linearMipMapLinear: RENDER.LinearMipMapLinearFilter
        }
    }, {
        name: "anisotropy",
        cname: "anisotropy",
        "default": 1,
        type: "number",
        setType: "value"
    }, {
        name: "format",
        cname: "格式",
        "default": "RGBA",
        type: "select",
        setType: "const",
        constant: {
            alpha: RENDER.AlphaFormat,
            RGB: RENDER.RGBFormat,
            RGBA: RENDER.RGBAFormat,
            luminance: RENDER.LuminanceFormat,
            luminanceAlpha: RENDER.LuminanceAlphaFormat
        }
    }, {
        name: "type",
        cname: "类型",
        "default": "unsignedByte",
        type: "select",
        setType: "const",
        constant: {
            unsignedByte: RENDER.UnsignedByteType,
            "byte": RENDER.ByteType,
            "short": RENDER.ShortType,
            unsignedShort: RENDER.UnsignedShortType,
            "int": RENDER.IntType,
            unsignedInt: RENDER.UnsignedIntType,
            "float": RENDER.FloatType
        }
    }, {
        name: "offset",
        cname: "偏移",
        "default": [ 0, 0 ],
        type: "array",
        setType: "vec2"
    }, {
        name: "repeat",
        cname: "重复",
        "default": [ 0, 0 ],
        type: "array",
        setType: "vec2"
    }, {
        name: "generateMipmaps",
        cname: "generateMipmaps",
        "default": true,
        type: "boolean",
        setType: "value"
    }, {
        name: "premultiplyAlpha",
        cname: "预乘Alpha",
        "default": false,
        type: "boolean",
        setType: "value"
    }, {
        name: "flipY",
        cname: "翻转",
        "default": true,
        type: "boolean",
        setType: "value"
    }, {
        name: "unpackAlignment",
        cname: "解压对齐",
        "default": 4,
        type: "number",
        setType: "value"
    }, {
        name: "sourceFile",
        cname: "源文件",
        "default": "",
        type: "string",
        setType: "value"
    } ];
    var hash = Map.config.hash = {};
    (function child(arr) {
        arr.forEach(function(x) {
            hash[x.name] = x;
            if (x.children && x.children.length) {
                child(x.children);
            }
        });
    })(Map.config);
    module.exports = Map;
});
