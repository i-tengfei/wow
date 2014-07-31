define("ndi/render-extend/0.1.0/render-extend-debug", [], function(require, exports, module) {
    var RENDER = require("ndi.render-debug");
    RENDER.Color.prototype.val = function() {
        return this.getHex();
    };
    RENDER.Vector2.prototype.val = function(x, y) {
        if (typeof x === "number" && typeof y === "number") {
            this.x = x;
            this.y = y;
            return this;
        } else if (Array.isArray(x) && x.length === 2 && y === undefined) {
            return this.val(x[0], x[1]);
        } else if (x instanceof RENDER.Vector2 && y === undefined) {
            return this.val(x.x, x.y);
        } else if (x === undefined) {
            return [ this.x, this.y ];
        }
    };
    RENDER.Vector3.prototype.val = function(x, y, z) {
        if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        } else if (Array.isArray(x) && x.length === 3 && y === undefined) {
            return this.val(x[0], x[1], x[2]);
        } else if (x instanceof RENDER.Vector3 && y === undefined) {
            return this.val(x.x, x.y, x.z);
        } else if (x === undefined) {
            return [ this.x, this.y, this.z ];
        }
    };
    RENDER.Vector3.prototype.mul = function(x, y, z) {
        if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
            this.x *= x;
            this.y *= y;
            this.z *= z;
            return this;
        } else if (x instanceof RENDER.Vector3 && y instanceof RENDER.Vector3 && z === undefined) {
            return this.val(x).mul(y);
        } else if (x instanceof RENDER.Vector3 && y === undefined) {
            return this.mul(x.x, x.y, x.z);
        } else if (typeof x === "number" && y === undefined) {
            return this.mul(x, x, x);
        }
    };
    RENDER.Loader.prototype.createMaterial = function(m, texturePath) {
        var _this = this;
        function is_pow2(n) {
            var l = Math.log(n) / Math.LN2;
            return Math.floor(l) == l;
        }
        function nearest_pow2(n) {
            var l = Math.log(n) / Math.LN2;
            return Math.pow(2, Math.round(l));
        }
        function load_image(where, url) {
            var image = new Image();
            image.onload = function() {
                if (!is_pow2(this.width) || !is_pow2(this.height)) {
                    var width = nearest_pow2(this.width);
                    var height = nearest_pow2(this.height);
                    where.image.width = width;
                    where.image.height = height;
                    where.image.getContext("2d").drawImage(this, 0, 0, width, height);
                } else {
                    where.image = this;
                }
                where.needsUpdate = true;
            };
            image.crossOrigin = _this.crossOrigin;
            // 这是修改的地方 ===================
            // 仅仅只有此处！
            if (texturePath !== "__delay__") {
                image.src = url;
            }
        }
        function create_texture(where, name, sourceFile, repeat, offset, wrap, anisotropy) {
            var isCompressed = /\.dds$/i.test(sourceFile);
            var fullPath = texturePath + "/" + sourceFile;
            if (isCompressed) {
                var texture = RENDER.ImageUtils.loadCompressedTexture(fullPath);
                where[name] = texture;
            } else {
                var texture = document.createElement("canvas");
                where[name] = new RENDER.Texture(texture);
            }
            where[name].sourceFile = sourceFile;
            if (repeat) {
                where[name].repeat.set(repeat[0], repeat[1]);
                if (repeat[0] !== 1) where[name].wrapS = RENDER.RepeatWrapping;
                if (repeat[1] !== 1) where[name].wrapT = RENDER.RepeatWrapping;
            }
            if (offset) {
                where[name].offset.set(offset[0], offset[1]);
            }
            if (wrap) {
                var wrapMap = {
                    repeat: RENDER.RepeatWrapping,
                    mirror: RENDER.MirroredRepeatWrapping
                };
                if (wrapMap[wrap[0]] !== undefined) where[name].wrapS = wrapMap[wrap[0]];
                if (wrapMap[wrap[1]] !== undefined) where[name].wrapT = wrapMap[wrap[1]];
            }
            if (anisotropy) {
                where[name].anisotropy = anisotropy;
            }
            if (!isCompressed) {
                load_image(where[name], fullPath);
            }
        }
        function rgb2hex(rgb) {
            return (rgb[0] * 255 << 16) + (rgb[1] * 255 << 8) + rgb[2] * 255;
        }
        // defaults
        var mtype = "MeshLambertMaterial";
        var mpars = {
            color: 15658734,
            opacity: 1,
            map: null,
            lightMap: null,
            normalMap: null,
            bumpMap: null,
            wireframe: false
        };
        // parameters from model file
        if (m.shading) {
            var shading = m.shading.toLowerCase();
            if (shading === "phong") mtype = "MeshPhongMaterial"; else if (shading === "basic") mtype = "MeshBasicMaterial";
        }
        if (m.blending !== undefined && RENDER[m.blending] !== undefined) {
            mpars.blending = RENDER[m.blending];
        }
        if (m.transparent !== undefined || m.opacity < 1) {
            mpars.transparent = m.transparent;
        }
        if (m.depthTest !== undefined) {
            mpars.depthTest = m.depthTest;
        }
        if (m.depthWrite !== undefined) {
            mpars.depthWrite = m.depthWrite;
        }
        if (m.visible !== undefined) {
            mpars.visible = m.visible;
        }
        if (m.flipSided !== undefined) {
            mpars.side = RENDER.BackSide;
        }
        if (m.doubleSided !== undefined) {
            mpars.side = RENDER.DoubleSide;
        }
        if (m.wireframe !== undefined) {
            mpars.wireframe = m.wireframe;
        }
        if (m.vertexColors !== undefined) {
            if (m.vertexColors === "face") {
                mpars.vertexColors = RENDER.FaceColors;
            } else if (m.vertexColors) {
                mpars.vertexColors = RENDER.VertexColors;
            }
        }
        // colors
        if (m.colorDiffuse) {
            mpars.color = rgb2hex(m.colorDiffuse);
        } else if (m.DbgColor) {
            mpars.color = m.DbgColor;
        }
        if (m.colorSpecular) {
            mpars.specular = rgb2hex(m.colorSpecular);
        }
        if (m.colorAmbient) {
            mpars.ambient = rgb2hex(m.colorAmbient);
        }
        // modifiers
        if (m.transparency) {
            mpars.opacity = m.transparency;
        }
        if (m.specularCoef) {
            mpars.shininess = m.specularCoef;
        }
        // textures
        if (m.mapDiffuse && texturePath) {
            create_texture(mpars, "map", m.mapDiffuse, m.mapDiffuseRepeat, m.mapDiffuseOffset, m.mapDiffuseWrap, m.mapDiffuseAnisotropy);
        }
        if (m.mapLight && texturePath) {
            create_texture(mpars, "lightMap", m.mapLight, m.mapLightRepeat, m.mapLightOffset, m.mapLightWrap, m.mapLightAnisotropy);
        }
        if (m.mapBump && texturePath) {
            create_texture(mpars, "bumpMap", m.mapBump, m.mapBumpRepeat, m.mapBumpOffset, m.mapBumpWrap, m.mapBumpAnisotropy);
        }
        if (m.mapNormal && texturePath) {
            create_texture(mpars, "normalMap", m.mapNormal, m.mapNormalRepeat, m.mapNormalOffset, m.mapNormalWrap, m.mapNormalAnisotropy);
        }
        if (m.mapSpecular && texturePath) {
            create_texture(mpars, "specularMap", m.mapSpecular, m.mapSpecularRepeat, m.mapSpecularOffset, m.mapSpecularWrap, m.mapSpecularAnisotropy);
        }
        //
        if (m.mapBumpScale) {
            mpars.bumpScale = m.mapBumpScale;
        }
        // special case for normal mapped material
        if (m.mapNormal) {
            var shader = RENDER.ShaderLib["normalmap"];
            var uniforms = RENDER.UniformsUtils.clone(shader.uniforms);
            uniforms["tNormal"].value = mpars.normalMap;
            if (m.mapNormalFactor) {
                uniforms["uNormalScale"].value.set(m.mapNormalFactor, m.mapNormalFactor);
            }
            if (mpars.map) {
                uniforms["tDiffuse"].value = mpars.map;
                uniforms["enableDiffuse"].value = true;
            }
            if (mpars.specularMap) {
                uniforms["tSpecular"].value = mpars.specularMap;
                uniforms["enableSpecular"].value = true;
            }
            if (mpars.lightMap) {
                uniforms["tAO"].value = mpars.lightMap;
                uniforms["enableAO"].value = true;
            }
            // for the moment don't handle displacement texture
            uniforms["uDiffuseColor"].value.setHex(mpars.color);
            uniforms["uSpecularColor"].value.setHex(mpars.specular);
            uniforms["uAmbientColor"].value.setHex(mpars.ambient);
            uniforms["uShininess"].value = mpars.shininess;
            if (mpars.opacity !== undefined) {
                uniforms["uOpacity"].value = mpars.opacity;
            }
            var parameters = {
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: uniforms,
                lights: true,
                fog: true
            };
            var material = new RENDER.ShaderMaterial(parameters);
            if (mpars.transparent) {
                material.transparent = true;
            }
        } else {
            var material = new RENDER[mtype](mpars);
        }
        if (m.DbgName !== undefined) material.name = m.DbgName;
        return material;
    };
});
