define("ndi/model/0.1.0/model-debug", [ "ndi/render/0.58.0/render-debug", "ndi/events/0.1.0/events-debug", "ndi/loader/0.1.0/loader-debug" ], function(require, exports, module) {
    var RENDER = require("ndi/render/0.58.0/render-debug");
    var Events = require("ndi/events/0.1.0/events-debug");
    var Loader = require("ndi/loader/0.1.0/loader-debug");
    var types = {
        type: [ "own", "load", "yun", "json" ],
        geo: [ "cube", "plane" ],
        load: [ "json" ]
    };
    function checkTypes(root, type) {
        var ntypes = types[root];
        if (ntypes.indexOf(type) === -1) {
            console.warn("类型错误，必须为", ntypes, "之一！");
            type = ntypes[0];
        }
        return type;
    }
    function Model(options, app, callback) {
        if (typeof this === "object" && !(this instanceof Model)) {
            return new Model(options, app, callback);
        }
        this.app = app;
        if (options.id !== undefined) {
            this.id = options.id;
            app.setHash(this);
            RegExp(app.get("yunid")).test(this.id) && !options.type && (options.type = "yun");
        }
        this.render = null;
        this.materials = [];
        this.attributes = {};
        this.val(options);
        this.__init__(app, callback);
    }
    Events.mixTo(Model);
    Model.prototype.__init__ = function(app, callback) {
        var attrs = this.attributes, mat = attrs.mat;
        var __this__ = this;
        switch (attrs.type) {
          case "own":
            this.createOwnMesh(setModel);
            break;

          case "load":
            this.createLoadMesh(setModel);
            break;

          case "json":
            this.createJsonMesh(setModel);
            break;

          case "yun":
            this.createYunMesh(setModel);
            break;
        }
        function setModel(geometry, material) {
            if (attrs.renderType === "mesh") {
                if (geometry.skinWeights && geometry.skinWeights.length) {
                    function enableSkinning(skinnedMesh) {
                        var materials = skinnedMesh.material.materials;
                        for (var i = 0, length = materials.length; i < length; i++) {
                            var mat = materials[i];
                            mat.skinning = true;
                        }
                    }
                    model = new RENDER.SkinnedMesh(geometry, material);
                    enableSkinning(model);
                    RENDER.AnimationHandler.add(model.geometry.animation);
                    animation = new RENDER.Animation(model, "animation", RENDER.AnimationHandler.CATMULLROM);
                    animation.play();
                    __this__.app.run(function() {
                        animation.update(.01);
                    });
                } else {
                    model = new RENDER.Mesh(geometry, material);
                }
            }
            model.position = attrs.position;
            model.rotation = attrs.rotation;
            __this__.render = model;
            callback && callback.call(__this__, this);
        }
    };
    Model.prototype.createOwnMesh = function(callback) {
        var __this__ = this;
        var attrs = this.attributes;
        var geometry;
        var Geo = RENDER.CubeGeometry;
        var geoAttrs = attrs.geometryAttrs;
        switch (attrs.geometryType) {
          case "cube":
            Geo = RENDER.CubeGeometry;
            break;

          case "plane":
            Geo = RENDER.PlaneGeometry;
            break;
        }
        geometry = new Geo(geoAttrs[0], geoAttrs[1], geoAttrs[2], geoAttrs[3], geoAttrs[4], geoAttrs[5], geoAttrs[6], geoAttrs[7], geoAttrs[8]);
        var materials = attrs.materials;
        if (materials && materials.length) {
            this.getMaterials(materials, function(material) {
                callback(geometry, material.materials[0]);
            });
        } else {
            callback(geometry, undefined);
        }
        return this;
    };
    Model.prototype.createYunMesh = function(callback) {
        var __this__ = this;
        var attrs = this.attributes;
        var app = this.app;
        var loader = new Loader({
            url: app.get("yunHost") + "/model/" + this.id
        });
        var parser = new RENDER.JSONLoader();
        loader.on("start", function(event) {
            attrs.loadStart && app.cmd(attrs.loadStart, event);
        });
        loader.on("progress", function(event) {
            attrs.loadProgress && app.cmd(attrs.loadProgress, event);
        });
        loader.on("complete", function(event) {
            attrs.loadComplete && app.cmd(attrs.loadComplete, event);
            var data = event.data;
            data.data.materials = data.materials;
            var result = parser.parse(data.data);
            __this__.getMaterials(data.materials, function(material) {
                callback(result.geometry, material);
            });
        });
        loader.load();
        return this;
    };
    Model.prototype.createLoadMesh = function(callback) {
        var __this__ = this;
        var app = this.app;
        var attrs = this.attributes;
        var loader = new Loader({
            url: attrs.url
        }), parser;
        var mapTypes = [ "map", "lightMap", "specularMap", "bumpMap", "normalMap" ];
        if (attrs.loadType === "json") {
            parser = new RENDER.JSONLoader();
        }
        loader.on("start", function(event) {
            attrs.loadStart && app.cmd(attrs.loadStart, event);
        });
        loader.on("progress", function(event) {
            attrs.loadProgress && app.cmd(attrs.loadProgress, event);
        });
        loader.on("complete", function(event) {
            attrs.loadComplete && app.cmd(attrs.loadComplete, event);
            var parts = event.url.split("/");
            parts.pop();
            var result = parser.parse(event.data, (parts.length < 1 ? "." : parts.join("/")) + "/");
            __this__.getMaterials(result.materials, function(material) {
                result.materials.forEach(function(m, i) {
                    mapTypes.forEach(function(t) {
                        m[t] && (material.materials[i][t] = m[t]);
                    });
                });
                callback(result.geometry, material);
            });
        });
        loader.load();
        return this;
    };
    Model.prototype.createJsonMesh = function(callback) {
        var attrs = this.attributes;
        var loader = new RENDER.JSONLoader();
        var result = loader.parse(attrs.json, "__delay__");
        this.getMaterials(result.materials, function(material) {
            callback(result.geometry, material);
        });
        return this;
    };
    Model.prototype.getMaterials = function(materials, callback) {
        var __this__ = this;
        materials = materials || [ {
            color: 10263708
        } ];
        this.app.async.map(materials, function(mat, next) {
            if (typeof mat === "string") {
                mat = {
                    id: mat
                };
            } else {
                mat.id = mat._id;
            }
            __this__.app.material(mat.val ? mat.val() : mat, next);
        }, function(err, materials) {
            var mats = [];
            __this__.materials = [];
            __this__.attributes.materials = materials.map(function(m) {
                mats.push(m.material.render);
                __this__.materials.push(m.material);
                return m.material.id;
            });
            callback && callback(mats.length ? new RENDER.MeshFaceMaterial(mats) : new RENDER.MeshPhongMaterial());
        });
        return this;
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
            attrs.materials = options.materials || [];
            attrs.loadStart = options.loadStart;
            attrs.loadProgress = options.loadProgress;
            attrs.loadComplete = options.loadComplete;
            // 基础类型
            if (attrs.type === "own") {
                attrs.geometryType = checkTypes("geo", options.geometryType || "cube");
                attrs.geometryAttrs = options.geometryAttrs || [];
            } else if (attrs.type === "load") {
                options.url || console.error("url 不可为空！");
                attrs.url = options.url;
                attrs.loadType = checkTypes("load", options.loadType || "json");
            } else if (attrs.type === "yun") {
                RegExp(this.app.get("yunid")).test(this.id) || console.error("ID:" + this.id + "格式不正确！");
            } else if (attrs.type === "json") {
                options.json || console.error("json 不可为空！");
                attrs.json = options.json;
            }
            var model = this.render;
            if (model) {
                model.position.val(attrs.position);
                model.rotation.val(attrs.rotation);
            }
        } else {
            var out = {
                id: this.id,
                type: attrs.type,
                renderType: attrs.renderType,
                position: this.render.position.val(),
                rotation: this.render.rotation.val()
            };
            if (out.type === "own") {
                out.geometryType = attrs.geometryType;
            } else if (out.type === "load") {
                out.url = attrs.url;
                out.loadType = attrs.loadType;
            }
            return out;
        }
    };
    Model.prototype.updateMap = function() {
        var geometry = this.render.geometry, material = this.render.material;
        if (material.materials) {
            material.materials.forEach(function(mat) {
                mat.needsUpdate = true;
            });
        } else {
            material.needsUpdate = true;
        }
        geometry.buffersNeedUpdate = true;
        geometry.uvsNeedUpdate = true;
    };
    Model.prototype.updateMaterial = function() {
        var mats = this.materials.map(function(m) {
            return m.render;
        });
        this.render.material.materials = mats;
    };
    Model.prototype.get = function(name) {
        return this.attributes[name];
    };
    Model.prototype.set = function() {};
    module.exports = Model;
});
