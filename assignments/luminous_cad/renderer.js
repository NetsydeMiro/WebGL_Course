function Renderer(canvasDiagramId, canvasLabelsId, vertexShaderUrl, fragmentShaderUrl){
  canvasDiagram = this.canvasDiagram = document.getElementById(canvasDiagramId);
  canvasLabels = this.canvasLabels = document.getElementById(canvasLabelsId);

  var gl = this.gl = WebGLUtils.setupWebGL(canvasDiagram);
  var context = this.context = canvasLabels.getContext('2d');
  context.font = '24px serif';

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

  this.affineMatrixLoc = gl.getUniformLocation(program, "affineMatrix");
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
  var context = this.context;

  gl.viewport(0, 0, this.canvasDiagram.width, this.canvasDiagram.height);

  var bgColorVector = diagram.color.colorVector;

  gl.clearColor(bgColorVector[0], bgColorVector[1], bgColorVector[2], bgColorVector[3]);
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  diagram.shapes.forEach(function(shape){

    var projectionMatrix = this.getProjectionMatrix();

    var modelViewMatrix = this.getModelViewMatrix();

    var transformMatrix = shape.getTransformMatrix();

    var affineMatrix = mult(projectionMatrix, mult(modelViewMatrix, transformMatrix));

    gl.uniformMatrix4fv(this.affineMatrixLoc, false, flatten(affineMatrix) );

    if (shape.color.facets.render){
      this.setColor(shape.color.facets);
      shape.renderFacets(this.gl, this.shapeBufferIndices[shape.constructor.name]);
    }

    if (shape.color.mesh.render){
      this.setColor(shape.color.mesh);
      shape.renderMesh(this.gl, this.shapeBufferIndices[shape.constructor.name]);
    }

    if (diagram.renderNames)
    {
      var labelClipspaceCoords = math.multiply(affineMatrix, [0,1.1,0,1]);
      var x = (labelClipspaceCoords[0] + 1) / 2 *  this.canvasLabels.width;
      var y = (labelClipspaceCoords[1] + 1) / 2 * -this.canvasLabels.height + this.canvasLabels.height;

      context.fillText(shape.name, x, y);
    }

  }, this);
};
