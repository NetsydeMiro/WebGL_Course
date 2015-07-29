function Renderer(canvasId, diagram, vertexShaderUrl, fragmentShaderUrl){
  var canvas = this.canvas = document.getElementById(canvasId);

  this.diagram = diagram;

  var gl = this.gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) 
    alert( "WebGL isn't available" );

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0, 2.0);

  var program = initShaders(gl, vertexShaderUrl, fragmentShaderUrl);
  gl.useProgram(program);

  var vBuffer = this.vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

  var buffer = [];
  Shape.registeredShapes.forEach(function(constructor, name){
    constructor.modelBuffers.forEach(function(modelBuffer){
      buffer = buffer.concat(constructor.modelBuffer);
    });
  });

  gl.bufferData(gl.ARRAY_BUFFER, flatten(buffer), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  this.modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  this.projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
  this.colorLoc = gl.getUniformLocation(program, "color");
}

Renderer.prototype.getColorVector = function(color){
  return [
    color.red / 255, 
    color.green / 255, 
    color.blue / 255, 
    1.0
  ];
};

Renderer.prototype.perspective = {
  eye: vec3(0,0,1),
  at: vec3(0.0, 0.0, 0.0),
  up: vec3(0.0, 1.0, 0.0)
};

Renderer.prototype.projection = {
  near: -10,
  far: 10,
  left: -1.0,
  right: 1.0,
  ytop: 1.0,
  bottom: -1.0
};

Renderer.prototype.getModelViewMatrix(){
  return lookAt(this.perspective.eye, this.perspective.at, this.perspective.up);
};

Renderer.prototype.render = function(){

  var gl = this.gl;

  var bgColorVector = this.getColorVector(this.diagram.color);
  gl.clearColor(bgColorVector[0], bgColorVector[1], bgColorVector[2], bgColorVector[3]);
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.diagram.shapes.forEach(function(shape){
    var transformMatrix = shape.getTransformMatrix();
    var projectionMatrix = mult(ortho(this.projection.left, this.projection.right, this.projection.bottom, 
          this.projection.ytop, this.projection.near, this.projection.far), transformMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

  });





  gl.uniform4f( colorLoc, color.shape[0], color.shape[1], color.shape[2], color.shape[3]);

  for( var i=0; i<index; i+=3)
    gl.drawArrays( gl.TRIANGLES, i, 3 );

  gl.uniform4f( colorLoc, color.mesh[0], color.mesh[1], color.mesh[2], color.mesh[3]);

  for( var i=0; i<index; i+=3)
    gl.drawArrays( gl.LINE_LOOP, i, 3 );

};
