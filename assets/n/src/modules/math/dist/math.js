define("ndi/math/0.1.0/math",["ndi/render/0.58.0/render"],function(a,b,c){var d=a("ndi/render/0.58.0/render");Number.prototype.add=function(a){return this+a},Number.prototype.sub=function(a){return this-a},Number.prototype.mul=function(a){return this*a},Number.prototype.clone=function(){return this.valueOf()};var e={};e.check=function(a,b){return(void 0===a||null===a)&&(a=b),a},e.sph2cart=function(a,b,c){return[a*Math.sin(c)*Math.sin(b),a*Math.cos(c),a*Math.sin(c)*Math.cos(b)]},e.cart2sph=function(a,b,c){return[Math.sqrt(a*a+b*b+c*c),Math.atan2(a,c),Math.atan2(Math.sqrt(a*a+c*c),b)]},e.Damper=function(a,b){this.damp=b||.05;var c=this.attrs=[];for(attr in a)this[attr]=a[attr].clone(),c.push(attr)},e.Damper.prototype.run=function(a){for(var b=0,c=this.attrs.length;c>b;b++){var d=this.attrs[b];a[d].clone(),this[d]=this[d].add(a[d].clone().sub(this[d]).mul(this.damp))}return this},e.num2color=function(a){return new d.Color(a)},e.arr2vec2=function(a){return(new d.Vector2).val(a)},e.arr2vec3=function(a){return(new d.Vector3).val(a)},c.exports=e});
