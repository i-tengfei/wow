define("ndi/map/0.1.0/map",["ndi/render/0.58.0/render","ndi/math/0.1.0/math"],function(a,b,d){function e(a){for(attr in i)a[attr]=void 0===a[attr]?i[attr].default:a[attr]}function f(a){return"object"!=typeof this||this instanceof f?(void 0!==a.id&&(this.id=a.id),this.texture=null,this.attributes={},this.val(a),this.__init__(),void 0):new f(a)}var g=a("ndi/render/0.58.0/render"),h=a("ndi/math/0.1.0/math");f.prototype.__init__=function(){var a,b=this.attributes,c=new Image;b.__delay__||(c.src=b.image),c.onload=function(){a.needsUpdate=!0},a=new g.Texture(c,b.mapping,b.wrapS,b.wrapT,b.magFilter,b.minFilter,b.format,b.type,b.anisotropy),a.name=b.name,a.mipmaps=b.mipmaps,a.offset=(new g.Vector2).val(b.offset),a.repeat=(new g.Vector2).val(b.repeat),a.generateMipmaps=b.generateMipmaps,a.premultiplyAlpha=b.premultiplyAlpha,a.flipY=b.flipY,a.unpackAlignment=b.unpackAlignment,a.sourceFile=b.sourceFile,this.texture=a},f.prototype.val=function(a){var b=this.attributes;if(void 0===a)return{name:b.name,image:b.sourceFile,mipmaps:b.mipmaps,mapping:this.constName("mapping"),wrapS:this.constName("wrapS"),wrapT:this.constName("wrapT"),magFilter:this.constName("magFilter"),minFilter:this.constName("minFilter"),anisotropy:b.anisotropy,format:this.constName("format"),type:this.constName("type"),offset:this.offset,repeat:this.repeat,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,flipY:this.flipY,unpackAlignment:this.unpackAlignment,sourceFile:this.sourceFile};e(a);for(name in i)b[name]=this.set(name,a[name]);b.name=b.name||a.id,b.__delay__=a.__delay__},f.prototype.constName=function(a){var b=this.attributes[a],d=i[a].constant;for(c in d)if(d[c]===b)return c},f.prototype.set=function(a,b){if("object"!=typeof a){var c,d=this.attributes;this.texture;var e=i[a].setType;switch(e){case"value":c=b;break;case"const":c="string"==typeof b?i[a].constant[b]:b;break;case"image":c="string"==typeof b?b:b.src||"",this.texture&&this.texture.image&&(this.texture.image.src=b);break;case"vec2":c=h.arr2vec2(b);break;case"vec3":c=h.arr2vec3(b)}return d[a]=c,c}for(n in a)return this.set(n,a[n])},f.config=[{name:"name",cname:"名称","default":"",type:"string",setType:"value"},{name:"image",cname:"图片","default":"",type:"string",setType:"image"},{name:"mipmaps",cname:"mipmaps","default":[],type:"array",setType:"value"},{name:"mapping",cname:"mapping","default":"uv",type:"select",setType:"newConst",constant:{uv:g.UVMapping,cubeReflection:g.CubeReflectionMapping,cubeRefraction:g.CubeRefractionMapping,sphericalReflection:g.SphericalReflectionMapping,sphericalRefraction:g.SphericalRefractionMapping}},{name:"wrapS",cname:"wrapS","default":"clampToEdge",type:"select",setType:"const",constant:{repeat:g.RepeatWrapping,clampToEdge:g.ClampToEdgeWrapping,mirroredRepeat:g.MirroredRepeatWrapping}},{name:"wrapT",cname:"wrapT","default":"clampToEdge",type:"select",setType:"const",constant:{repeat:g.RepeatWrapping,clampToEdge:g.ClampToEdgeWrapping,mirroredRepeat:g.MirroredRepeatWrapping}},{name:"magFilter",cname:"magFilter","default":"linear",type:"select",setType:"const",constant:{nearest:g.NearestFilter,nearestMipMapNearest:g.NearestMipMapNearestFilter,nearestMipMapLinear:g.NearestMipMapLinearFilter,linear:g.LinearFilter,linearMipMapNearest:g.LinearMipMapNearestFilter,linearMipMapLinear:g.LinearMipMapLinearFilter}},{name:"minFilter",cname:"minFilter","default":"linearMipMapLinear",type:"select",setType:"const",constant:{nearest:g.NearestFilter,nearestMipMapNearest:g.NearestMipMapNearestFilter,nearestMipMapLinear:g.NearestMipMapLinearFilter,linear:g.LinearFilter,linearMipMapNearest:g.LinearMipMapNearestFilter,linearMipMapLinear:g.LinearMipMapLinearFilter}},{name:"anisotropy",cname:"anisotropy","default":1,type:"number",setType:"value"},{name:"format",cname:"格式","default":"RGBA",type:"select",setType:"const",constant:{alpha:g.AlphaFormat,RGB:g.RGBFormat,RGBA:g.RGBAFormat,luminance:g.LuminanceFormat,luminanceAlpha:g.LuminanceAlphaFormat}},{name:"type",cname:"类型","default":"unsignedByte",type:"select",setType:"const",constant:{unsignedByte:g.UnsignedByteType,"byte":g.ByteType,"short":g.ShortType,unsignedShort:g.UnsignedShortType,"int":g.IntType,unsignedInt:g.UnsignedIntType,"float":g.FloatType}},{name:"offset",cname:"偏移","default":[0,0],type:"array",setType:"vec2"},{name:"repeat",cname:"重复","default":[0,0],type:"array",setType:"vec2"},{name:"generateMipmaps",cname:"generateMipmaps","default":!0,type:"boolean",setType:"value"},{name:"premultiplyAlpha",cname:"预乘Alpha","default":!1,type:"boolean",setType:"value"},{name:"flipY",cname:"翻转","default":!0,type:"boolean",setType:"value"},{name:"unpackAlignment",cname:"解压对齐","default":4,type:"number",setType:"value"},{name:"sourceFile",cname:"源文件","default":"",type:"string",setType:"value"}];var i=f.config.hash={};!function j(a){a.forEach(function(a){i[a.name]=a,a.children&&a.children.length&&j(a.children)})}(f.config),d.exports=f});