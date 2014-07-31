define("ndi/render-extend/0.1.0/render-extend-debug", [ "ndi/render/0.58.0/render-debug" ], function(require, exports, module) {
    var RENDER = require("ndi/render/0.58.0/render-debug");
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
    // 摘自 R58
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
    // 摘自 R59
    RENDER.JSONLoader.prototype.parse = function(json, texturePath) {
        var scope = this, geometry = new RENDER.Geometry(), scale = json.scale !== undefined ? 1 / json.scale : 1;
        parseModel(scale);
        parseSkin();
        parseMorphing(scale);
        geometry.computeCentroids();
        geometry.computeFaceNormals();
        geometry.computeBoundingSphere();
        function parseModel(scale) {
            function isBitSet(value, position) {
                return value & 1 << position;
            }
            var i, j, fi, offset, zLength, nVertices, colorIndex, normalIndex, uvIndex, materialIndex, type, isQuad, hasMaterial, hasFaceUv, hasFaceVertexUv, hasFaceNormal, hasFaceVertexNormal, hasFaceColor, hasFaceVertexColor, vertex, face, color, normal, uvLayer, uvs, u, v, faces = json.faces, vertices = json.vertices, normals = json.normals, colors = json.colors, nUvLayers = 0;
            if (json.uvs !== undefined) {
                // disregard empty arrays
                for (i = 0; i < json.uvs.length; i++) {
                    if (json.uvs[i].length) nUvLayers++;
                }
                for (i = 0; i < nUvLayers; i++) {
                    geometry.faceUvs[i] = [];
                    geometry.faceVertexUvs[i] = [];
                }
            }
            offset = 0;
            zLength = vertices.length;
            while (offset < zLength) {
                vertex = new RENDER.Vector3();
                vertex.x = vertices[offset++] * scale;
                vertex.y = vertices[offset++] * scale;
                vertex.z = vertices[offset++] * scale;
                geometry.vertices.push(vertex);
            }
            offset = 0;
            zLength = faces.length;
            while (offset < zLength) {
                type = faces[offset++];
                isQuad = isBitSet(type, 0);
                hasMaterial = isBitSet(type, 1);
                hasFaceUv = isBitSet(type, 2);
                hasFaceVertexUv = isBitSet(type, 3);
                hasFaceNormal = isBitSet(type, 4);
                hasFaceVertexNormal = isBitSet(type, 5);
                hasFaceColor = isBitSet(type, 6);
                hasFaceVertexColor = isBitSet(type, 7);
                //console.log("type", type, "bits", isQuad, hasMaterial, hasFaceUv, hasFaceVertexUv, hasFaceNormal, hasFaceVertexNormal, hasFaceColor, hasFaceVertexColor);
                if (isQuad) {
                    face = new RENDER.Face4();
                    face.a = faces[offset++];
                    face.b = faces[offset++];
                    face.c = faces[offset++];
                    face.d = faces[offset++];
                    nVertices = 4;
                } else {
                    face = new RENDER.Face3();
                    face.a = faces[offset++];
                    face.b = faces[offset++];
                    face.c = faces[offset++];
                    nVertices = 3;
                }
                if (hasMaterial) {
                    materialIndex = faces[offset++];
                    face.materialIndex = materialIndex;
                }
                // to get face <=> uv index correspondence
                fi = geometry.faces.length;
                if (hasFaceUv) {
                    for (i = 0; i < nUvLayers; i++) {
                        uvLayer = json.uvs[i];
                        uvIndex = faces[offset++];
                        u = uvLayer[uvIndex * 2];
                        v = uvLayer[uvIndex * 2 + 1];
                        geometry.faceUvs[i][fi] = new RENDER.Vector2(u, v);
                    }
                }
                if (hasFaceVertexUv) {
                    for (i = 0; i < nUvLayers; i++) {
                        uvLayer = json.uvs[i];
                        uvs = [];
                        for (j = 0; j < nVertices; j++) {
                            uvIndex = faces[offset++];
                            u = uvLayer[uvIndex * 2];
                            v = uvLayer[uvIndex * 2 + 1];
                            uvs[j] = new RENDER.Vector2(u, v);
                        }
                        geometry.faceVertexUvs[i][fi] = uvs;
                    }
                }
                if (hasFaceNormal) {
                    normalIndex = faces[offset++] * 3;
                    normal = new RENDER.Vector3();
                    normal.x = normals[normalIndex++];
                    normal.y = normals[normalIndex++];
                    normal.z = normals[normalIndex];
                    face.normal = normal;
                }
                if (hasFaceVertexNormal) {
                    for (i = 0; i < nVertices; i++) {
                        normalIndex = faces[offset++] * 3;
                        normal = new RENDER.Vector3();
                        normal.x = normals[normalIndex++];
                        normal.y = normals[normalIndex++];
                        normal.z = normals[normalIndex];
                        face.vertexNormals.push(normal);
                    }
                }
                if (hasFaceColor) {
                    colorIndex = faces[offset++];
                    color = new RENDER.Color(colors[colorIndex]);
                    face.color = color;
                }
                if (hasFaceVertexColor) {
                    for (i = 0; i < nVertices; i++) {
                        colorIndex = faces[offset++];
                        color = new RENDER.Color(colors[colorIndex]);
                        face.vertexColors.push(color);
                    }
                }
                geometry.faces.push(face);
            }
        }
        function parseSkin() {
            var i, l, x, y, z, w, a, b, c, d;
            if (json.skinWeights) {
                for (i = 0, l = json.skinWeights.length; i < l; i += 4) {
                    x = json.skinWeights[i];
                    y = json.skinWeights[i + 1];
                    z = json.skinWeights[i + 2];
                    w = json.skinWeights[i + 3];
                    geometry.skinWeights.push(new RENDER.Vector4(x, y, z, w));
                }
            }
            if (json.skinIndices) {
                for (i = 0, l = json.skinIndices.length; i < l; i += 4) {
                    a = json.skinIndices[i];
                    b = json.skinIndices[i + 1];
                    c = json.skinIndices[i + 2];
                    d = json.skinIndices[i + 3];
                    geometry.skinIndices.push(new RENDER.Vector4(a, b, c, d));
                }
            }
            geometry.bones = json.bones;
            geometry.animation = json.animation;
        }
        function parseMorphing(scale) {
            if (json.morphTargets !== undefined) {
                var i, l, v, vl, dstVertices, srcVertices;
                for (i = 0, l = json.morphTargets.length; i < l; i++) {
                    geometry.morphTargets[i] = {};
                    geometry.morphTargets[i].name = json.morphTargets[i].name;
                    geometry.morphTargets[i].vertices = [];
                    dstVertices = geometry.morphTargets[i].vertices;
                    srcVertices = json.morphTargets[i].vertices;
                    for (v = 0, vl = srcVertices.length; v < vl; v += 3) {
                        var vertex = new RENDER.Vector3();
                        vertex.x = srcVertices[v] * scale;
                        vertex.y = srcVertices[v + 1] * scale;
                        vertex.z = srcVertices[v + 2] * scale;
                        dstVertices.push(vertex);
                    }
                }
            }
            if (json.morphColors !== undefined) {
                var i, l, c, cl, dstColors, srcColors, color;
                for (i = 0, l = json.morphColors.length; i < l; i++) {
                    geometry.morphColors[i] = {};
                    geometry.morphColors[i].name = json.morphColors[i].name;
                    geometry.morphColors[i].colors = [];
                    dstColors = geometry.morphColors[i].colors;
                    srcColors = json.morphColors[i].colors;
                    for (c = 0, cl = srcColors.length; c < cl; c += 3) {
                        color = new RENDER.Color(16755200);
                        color.setRGB(srcColors[c], srcColors[c + 1], srcColors[c + 2]);
                        dstColors.push(color);
                    }
                }
            }
        }
        if (json.materials === undefined) {
            return {
                geometry: geometry
            };
        } else {
            var materials = this.initMaterials(json.materials, texturePath);
            if (this.needsTangents(materials)) {
                geometry.computeTangents();
            }
            return {
                geometry: geometry,
                materials: materials
            };
        }
    };
});
