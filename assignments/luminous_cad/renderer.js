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

  /*
     gl.blendEquation( gl.FUNC_ADD );
     gl.blendFunc( gl.SRC_COLOR, gl.DST_COLOR );
     */

  var program = initShaders(gl, vertexShaderUrl, fragmentShaderUrl);
  gl.useProgram(program);

  var vertices = [], normals = []; 
  this.vertexBufferIndices = {};
  this.normalBufferIndices = {};
  for (var shapeName in Shape.availableShapes){
    var shapeConstructor = Shape.availableShapes[shapeName];
    this.vertexBufferIndices[shapeName] = vertices.length;
    this.normalBufferIndices[shapeName] = normals.length;
    vertices = vertices.concat(shapeConstructor.vertexBuffer);
    normals = normals.concat(shapeConstructor.normalBuffer);
  }

  var normalBuffer = this.normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

  var vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);


  var vertexBuffer = this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);


  this.uniforms = {
    'modelViewMatrix': null, 
    'projectionMatrix': null, 
    'lightPosition': null, 
    'ambientProduct': null, 
    'diffuseProduct': null, 
    'specularProduct': null, 
    'shininess': null
  };

  for(var uniform in this.uniforms)
  {
    this.uniforms[uniform] = gl.getUniformLocation(program, uniform);
  }
}

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
  this.gl.disable(this.gl.BLEND);

  // force lighting products
  ['ambientProduct', 'diffuseProduct', 'specularProduct'].forEach(function(product){
    this.gl.uniform4fv(this.uniforms[product], color.colorVector);
  }, this);

  // arbitrary light position
  this.gl.uniform4fv(this.uniforms.lightPosition, [1,1,1,1]);
};

Renderer.prototype.getProjectionMatrix = function(){
  return ortho(this.projection.left, this.projection.right, this.projection.bottom, 
      this.projection.ytop, this.projection.near, this.projection.far);
};

Renderer.prototype.getPerspectiveMatrix = function(){
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

  // projection matrix doesn't change with shape
  gl.uniformMatrix4fv(this.uniforms.projectionMatrix, false, flatten(this.getProjectionMatrix()));

  diagram.shapes.forEach(function(shape){

    var modelViewMatrix = mult(this.getPerspectiveMatrix(), shape.getTransformMatrix());

    gl.uniformMatrix4fv(this.uniforms.modelViewMatrix, false, flatten(modelViewMatrix));
    gl.uniform1f(this.uniforms.shininess, shape.shininess);

    // render dark shape silhouette
    this.setColor(new Color({red: 0, green: 0, blue: 0}));
    shape.renderFacets(this.gl, this.vertexBufferIndices[shape.constructor.name]);

    // layer light reflections 
    gl.enable(gl.BLEND);

    diagram.lights.forEach(function(light){

      // set light products
      for (var lightType in light.color){
        var product = 
          shape.color[lightType].render && light.color[lightType].render ? 
          mult(shape.color[lightType].colorVector, light.color[lightType].colorVector) : 
          [0, 0, 0, 1.0];

        gl.uniform4fv(this.uniforms[lightType + 'Product'], product);
      }

      gl.uniform4f(this.uniforms.lightPosition, light.position.x, light.position.y, light.position.z, 1.0);

      shape.renderFacets(this.gl, this.vertexBufferIndices[shape.constructor.name]);

    }, this);

    // render mesh
    if (shape.color.mesh.render){
      this.setColor(shape.color.mesh);
      shape.renderMesh(this.gl, this.vertexBufferIndices[shape.constructor.name]);
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

