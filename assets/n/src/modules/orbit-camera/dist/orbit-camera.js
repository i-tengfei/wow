define("ndi/orbit-camera/0.1.0/orbit-camera",["ndi/render/0.58.0/render","ndi/math/0.1.0/math"],function(a,b,c){function d(a,b){e.Camera.call(this),this.container=new e.Object3D,this.container.add(this);var c=b.enableMouse().mouseManager;delete a.element,this.attributes={},this.positionWorld=new e.Vector3,this.rotationWorld=new e.Vector3,this.val(a),this.damper=new f.Damper({r:this.attributes.r,theta:this.attributes.theta,phi:this.attributes.phi,center:this.attributes.center},this.attributes.damp);var d=this;c.on(c.DRAG,function(a){d.rotate(a.dx,a.dy)}),c.on(c.WHEEL,function(a){d.zoom(a)}),c.on(c.RIGHT_DRAG,function(a){d.pan(a.dx,a.dy)}),b.run(this.run.bind(this))}var e=a("ndi/render/0.58.0/render"),f=a("ndi/math/0.1.0/math"),g=1800;d.prototype=Object.create(e.Camera.prototype),d.prototype.val=function(a){var b=this.attributes;return void 0===a?{damp:b.damp,r:b.r,theta:b.theta,phi:b.phi,center:b.center.val()}:(b.r=f.check(a.r,10),b.theta=f.check(a.theta,0),b.phi=f.check(a.phi,.5*Math.PI),b.center=(new e.Vector3).val(a.center||[0,0,0]),b.damp=f.check(a.damp,.05),b.rotateSpeed=f.check(a.rotateSpeed,1),b.zoomSpeed=f.check(a.zoomSpeed,1),b.panSpeed=f.check(a.panSpeed,1),void 0)},d.prototype.set=function(a,b){var c=this.attributes;switch(a){case"center":c[a].val(b);break;default:c[a]=b}},d.prototype.run=function(){var a=this.attributes;if(a.r<.001)return!1;var b=1e-4,c=Math.PI;a.phi=Math.max(b,Math.min(c,a.phi)),this.damper.damp=a.damp;var d=this.damper.run(a),g=f.sph2cart(d.r,d.theta,d.phi);this.position.set(g[0],g[1],g[2]),this.lookAt(new e.Vector3),this.container.position.copy(d.center),this.container.updateMatrixWorld(!0),this.positionWorld.getPositionFromMatrix(this.matrixWorld),this.rotationWorld.setEulerFromRotationMatrix(this.matrixWorld)},d.prototype.rotate=function(a,b){var c=this.attributes;c.theta-=2*Math.PI*a/g*c.rotateSpeed,c.phi-=2*Math.PI*b/g*c.rotateSpeed},d.prototype.zoom=function(a){var b=this.attributes,c=Math.pow(.95,b.zoomSpeed);0>a?b.r/=c:a>0&&(b.r*=c)},d.prototype.pan=function(){var a=new e.Vector3,b=new e.Matrix3;return function(c,d){var e=this.attributes;a.set(-c,d,0),b.getNormalMatrix(this.matrix),a.applyMatrix3(b),a.multiplyScalar(.001*e.r*e.panSpeed),e.center.add(a)}}(),c.exports=d});
