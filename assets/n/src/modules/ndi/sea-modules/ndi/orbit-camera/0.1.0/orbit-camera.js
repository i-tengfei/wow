define("ndi/orbit-camera/0.1.0/orbit-camera",["ndi/mouse-manager/0.1.0/mouse-manager","ndi/events/0.1.0/events","ndi/key-manager/0.1.0/key-manager","ndi/event-listener/0.1.0/event-listener","ndi/render/0.58.0/render","ndi/math/0.1.0/math"],function(a,b,c){function d(a,b){f.Camera.call(this),this.container=new f.Object3D,this.container.add(this);var c=this.__mouseManager=new e(a.element);delete a.element,this.attributes={},this.val(a),this.damper=new g.Damper({r:this.attributes.r,theta:this.attributes.theta,phi:this.attributes.phi,center:this.attributes.center},this.attributes.damp);var d=this;c.on(e.DRAG,function(a){d.rotate(a.dx,a.dy)}),c.on(e.WHEEL,function(a){d.zoom(a)}),c.on(e.RIGHT_DRAG,function(a){d.pan(a.dx,a.dy)}),b.run(this.run.bind(this,b.__render__.camera))}var e=a("ndi/mouse-manager/0.1.0/mouse-manager"),f=a("ndi/render/0.58.0/render"),g=a("ndi/math/0.1.0/math"),h=1800;d.prototype=Object.create(f.Camera.prototype),d.prototype.val=function(a){var b=this.attributes;return void 0===a?{damp:b.damp,r:b.r,theta:b.theta,phi:b.phi,center:b.center.val()}:(b.r=g.check(a.r,10),b.theta=g.check(a.theta,0),b.phi=g.check(a.phi,Math.PI),b.center=(new f.Vector3).val(a.center),b.damp=g.check(a.damp,.05),b.rotateSpeed=g.check(a.rotateSpeed,1),b.zoomSpeed=g.check(a.zoomSpeed,1),b.panSpeed=g.check(a.panSpeed,1),void 0)},d.prototype.run=function(a){var b=this.attributes;if(b.r<.001)return!1;var c=1e-4,d=Math.PI;b.phi=Math.max(c,Math.min(d,b.phi));var e=this.damper.run(b),h=g.sph2cart(e.r,e.theta,e.phi);this.position.set(h[0],h[1],h[2]),this.lookAt(new f.Vector3),this.container.position.copy(e.center),this.container.updateMatrixWorld(!0),a.position.getPositionFromMatrix(this.matrixWorld),a.rotation.setEulerFromRotationMatrix(this.matrixWorld)},d.prototype.rotate=function(a,b){var c=this.attributes;c.theta-=2*Math.PI*a/h*c.rotateSpeed,c.phi-=2*Math.PI*b/h*c.rotateSpeed},d.prototype.zoom=function(a){var b=this.attributes,c=Math.pow(.95,b.zoomSpeed);0>a?b.r/=c:a>0&&(b.r*=c)},d.prototype.pan=function(){var a=new f.Vector3,b=new f.Matrix3;return function(c,d){var e=this.attributes;a.set(-c,d,0),b.getNormalMatrix(this.matrix),a.applyMatrix3(b),a.multiplyScalar(.001*e.r*e.panSpeed),e.center.add(a)}}(),c.exports=d});
