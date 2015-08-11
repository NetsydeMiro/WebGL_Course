function Renderer(canvasId, vertexShaderUrl, fragmentShaderUrl){
  var canvas = this.canvas = document.getElementById(canvasId);

  var gl = this.gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) 
    alert( "WebGL isn't available" );

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
    buffer = buffer.concat(shapeConstructor.modelBuffer);
  }

  gl.bufferData(gl.ARRAY_BUFFER, flatten(buffer), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  this.modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  this.projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
  this.transformMatrixLoc = gl.getUniformLocation(program, "transformMatrix");
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
  near: -2,
  far: 2,
  left: -2,
  right: 2,
  ytop: 2,
  bottom: -2
};

Renderer.prototype.setColor = function(color){
  var colorVector = this.getColorVector(color);
  this.gl.uniform4f(this.colorLoc, colorVector[0], colorVector[1], colorVector[2], colorVector[3]);
};

Renderer.prototype.getProjectionMatrix = function(){
  return ortho(this.projection.left, this.projection.right, this.projection.bottom, 
          this.projection.ytop, this.projection.near, this.projection.far);
};

Renderer.prototype.getModelViewMatrix = function(){
  return lookAt(this.perspective.eye, this.perspective.at, this.perspective.up);
};

Renderer.prototype.render = function(diagram){

  var gl = this.gl;

  gl.viewport(0, 0, this.canvas.width, this.canvas.height);

  var bgColorVector = diagram.color.colorVector;

  gl.clearColor(bgColorVector[0], bgColorVector[1], bgColorVector[2], bgColorVector[3]);
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  diagram.shapes.forEach(function(shape){

    var modelViewMatrix = this.getModelViewMatrix();

    var transformMatrix = shape.getTransformMatrix();

    var projectionMatrix = this.getProjectionMatrix();

    gl.uniformMatrix4fv(this.modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(this.projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix4fv(this.transformMatrixLoc, false, flatten(transformMatrix) );

    if (shape.color.facets.render){
      this.setColor(shape.color.facets);
      shape.renderFacets(this.gl, this.shapeBufferIndices[shape.constructor.name]);
    }

    if (shape.color.mesh.render){
      this.setColor(shape.color.mesh);
      shape.renderMesh(this.gl, this.shapeBufferIndices[shape.constructor.name]);
    }

  }, this);

};
