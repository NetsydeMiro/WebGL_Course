function Renderer(canvasId, vertexShaderUrl, fragmentShaderUrl, diagram){
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
  this.shapeBufferIndices = {};
  for (var shapeName in Shape.availableShapes){
    var shapeConstructor = Shape.availableShapes[shapeName];
    this.shapeBufferIndices[shapeName] = buffer.length;
    shapeConstructor.modelBuffers.forEach(function(modelBuffer, modelBufferIndex){
      buffer = buffer.concat(modelBuffer);
    });
  }

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

Renderer.prototype.setColor = function(color){
  var colorVector = this.getColorVector(color);
  this.gl.uniform4f(this.colorLoc, colorVector[0], colorVector[1], colorVector[2], colorVector[3]);
};

Renderer.prototype.getModelViewMatrix = function(){
  return lookAt(this.perspective.eye, this.perspective.at, this.perspective.up);
};

Renderer.prototype.render = function(){

  var gl = this.gl;

  var bgColorVector = this.getColorVector(this.diagram.color);
  gl.clearColor(bgColorVector[0], bgColorVector[1], bgColorVector[2], bgColorVector[3]);
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.diagram.shapes.forEach(function(shape){

    var modelViewMatrix = this.getModelViewMatrix();

    var transformMatrix = shape.getTransformMatrix();

    var projectionMatrix = mult(ortho(this.projection.left, this.projection.right, this.projection.bottom, 
          this.projection.ytop, this.projection.near, this.projection.far), transformMatrix);

    gl.uniformMatrix4fv(this.modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(this.projectionMatrixLoc, false, flatten(projectionMatrix) );

    this.setColor(shape.color.facets);

    //TODO: get indexing to work here
    shape.renderFacets(this.gl, this.shapeBufferIndices[shape.constructor.name]);

    this.setColor(shape.color.mesh);

    //TODO: get indexing to work here
    shape.renderMesh(this.gl, this.shapeBufferIndices[shape.constructor.name]);

  }, this);

};
