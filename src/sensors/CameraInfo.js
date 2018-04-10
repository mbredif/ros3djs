/**
 * @author Mathieu Bredif - mathieu.bredif@ign.fr
 */

/**
 * A CameraInfo client
 *
 * @constructor
 * @param options - object with following keys:
 *
 *  * ros - the ROSLIB.Ros connection handle
 *  * topic - the marker topic to listen to
 *  * tfClient - the TF client handle to use
 *  * rootObject (optional) - the root object to add this marker to
 *  * color (optional) - color for line (default: 0xcc00ff)
 *  * height (optional) - the height of the image pyramid (default: 1.0)
 */
ROS3D.CameraInfo = function(options) {
  this.options = options || {};
  this.ros = options.ros;
  this.topicName = options.topic || '/camera_info';
  this.tfClient = options.tfClient;
  this.color = options.color || 0xcc00ff;
  this.rootObject = options.rootObject || new THREE.Object3D();
  THREE.Object3D.call(this);
  
  this.geom = new THREE.BufferGeometry();
  this.vertices = new THREE.BufferAttribute(new Float32Array( 3 * 5 ), 3 );
  this.geom.addAttribute( 'position',  this.vertices);
  this.geom.setIndex( [ 0,1,2, 0,2,3, 0,3,4, 0,4,1, 3,2,1, 1,4,3] );
  this.material = new THREE.MeshBasicMaterial( { wireframe: false, color: this.color } );
  this.object = new THREE.Mesh( this.geom, this.material );
  this.setHeight(options.height || 0.1);
  
  // this.geom.setDrawRange(0,12); // cone only
  // this.geom.setDrawRange(12,6); // base only
  
  this.vertices.array[ 5] = 1;
  this.vertices.array[ 8] = 1;
  this.vertices.array[11] = 1;
  this.vertices.array[14] = 1;
  
  this.sn = null;

  this.rosTopic = undefined;
  this.subscribe();
};
ROS3D.CameraInfo.prototype.__proto__ = THREE.Object3D.prototype;

ROS3D.CameraInfo.prototype.setHeight = function(height){
  this.height = height;
  this.object.scale.set(height, height, height);
  // this.object.matrixWorldNeedsUpdate = true; // not necessary ?
}

ROS3D.CameraInfo.prototype.unsubscribe = function(){
  if(this.rosTopic){
    this.rosTopic.unsubscribe();
  }
};

ROS3D.CameraInfo.prototype.subscribe = function(){
  this.unsubscribe();

  // subscribe to the topic
  this.rosTopic = new ROSLIB.Topic({
      ros : this.ros,
      name : this.topicName,
      messageType : 'sensor_msgs/CameraInfo'
  });
  this.rosTopic.subscribe(this.processMessage.bind(this));
};

ROS3D.CameraInfo.prototype.processMessage = function(message){
  if(this.sn===null){
    this.sn = new ROS3D.SceneNode({
      frameID : message.header.frame_id,
      tfClient : this.tfClient,
      object : this.object
    });
    this.rootObject.add(this.sn);
  }
  var fx = message.K[0];
  var fy = message.K[4];
  var px = message.K[2];
  var py = message.K[5];
  var s  = message.K[1];
  var w  = message.width;
  var h  = message.height;

  var y0 = -py/fy;
  var y1 = (h-py)/fy;
  var x0 = -px/fx;
  var x1 = (w-px)/fx;
  var sfx = s/fx;
  var s0 = y0*sfx;
  var s1 = y1*sfx;
  
  this.vertices.array[ 3] = x1-s1;
  this.vertices.array[ 4] = y1;
  this.vertices.array[ 6] = x0-s1;
  this.vertices.array[ 7] = y1;
  this.vertices.array[ 9] = x0-s0;
  this.vertices.array[10] = y0;
  this.vertices.array[12] = x1-s0;
  this.vertices.array[13] = y0;
  
  this.vertices.needsUpdate = true;
};
