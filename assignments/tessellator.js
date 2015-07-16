"use strict";

function Tessellator(canvasId, vertexShaderId, fragmentShaderId){
  var canvas = this.canvas = 
    document.getElementById(canvasId);

  canvas.width = canvas.scrollWidth;
  canvas.height = canvas.scrollWidth;

  var gl = this.gl = 
    WebGLUtils.setupWebGL(canvas);

  if (!gl)  
    alert("WebGL isn't available"); 

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  var program = this.program = 
    initShaders(gl, vertexShaderId, fragmentShaderId);
  gl.useProgram(program);


  var bufferId = this.bufferId = 
    gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, 8*Math.pow(4, 11), gl.STATIC_DRAW);

  var vPosition = this.vPosition =  
    gl.getAttribLocation(program, "vPosition");

  var fColor = this.fColor = 
    gl.getUniformLocation(program, "fColor");

  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.vertexAttribPointer(fColor, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
}

Tessellator.prototype.generatePolygonVertices = 
function(polygonVertexCount, boundingRadius){

  boundingRadius = boundingRadius || 0.7;
  var polygonVertices = new Array(polygonVertexCount); 

  var angleIncrement = 2.0 * Math.PI / polygonVertexCount;

  // generate the polygon outline
  for(var vIndex = 0; vIndex < polygonVertexCount; vIndex++){
    var x = boundingRadius * Math.cos(vIndex * angleIncrement);
    var y = boundingRadius * Math.sin(vIndex * angleIncrement);

    polygonVertices[vIndex] = [x, y]; 
  }

  return polygonVertices;
};

Tessellator.prototype.generatePolygonTriangles = 
function(polygonVertices){

  var vertexCount = polygonVertices.length;
  var triangles = new Array(vertexCount);

  // break it into triangle subcomponents, which meet at poly's centroid (the origin)
  for(var tIndex = 0; tIndex < vertexCount; tIndex++)
  {
    var a = [0,0];
    var b = polygonVertices[tIndex];
    var c = polygonVertices[tIndex < vertexCount - 1 ? tIndex + 1 : 0]

      triangles[tIndex] = [a, b, c];
  }

  return triangles;
};

  Tessellator.prototype.divideTriangle = 
function(triangle, subdivisions, rotation, constant)
{

  var helper = function(triangle, count, rotation, constant, vertices, edges){
    // end recursion
    if (count == 0) {
      var transformed_vertices = triangle.map(function(vertex){
        var x = vertex[0]; var y = vertex[1];
        var d = Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 0.5);

        var rotation_prime = rotation * d * constant;

        var x_prime = x * Math.cos(rotation_prime) - y * Math.sin(rotation_prime);
        var y_prime = x * Math.sin(rotation_prime) + y * Math.cos(rotation_prime);

        return [x_prime, y_prime]; 
      });

      vertices.push(transformed_vertices[0], transformed_vertices[1], transformed_vertices[2]);

      edges.push(transformed_vertices[0], transformed_vertices[1], 
          transformed_vertices[1], transformed_vertices[2], 
          transformed_vertices[2], transformed_vertices[0]);
    }
    else {

      //bisect the sides
      var a = triangle[0], b = triangle[1], c = triangle[2];
      var ab = mix(a, b, 0.5);
      var ac = mix(a, c, 0.5);
      var bc = mix(b, c, 0.5);

      --count;

      // four new triangles
      helper([a, ab, ac], count, rotation, constant, vertices, edges);
      helper([c, ac, bc], count, rotation, constant, vertices, edges);
      helper([b, bc, ab], count, rotation, constant, vertices, edges);
      helper([ab, ac, bc], count, rotation, constant, vertices, edges);
    }

  }

  var vertices = [], edges = [];

  helper(triangle, subdivisions, rotation, constant, vertices, edges);

  return {vertices: vertices, edges: edges};
}


  Tessellator.prototype.render = 
function(polygonVertexCount, subdivisions, rotation, constant)
{
  var polygonVertices = this.generatePolygonVertices(polygonVertexCount);

  var polygonTriangles = this.generatePolygonTriangles(polygonVertices);

  var vertices = []; var edges = [];
  polygonTriangles.forEach(function(triangle){
    var triangleAttributes = this.divideTriangle(triangle, subdivisions, rotation, constant);
    vertices = vertices.concat(triangleAttributes.vertices);
    edges = edges.concat(triangleAttributes.edges);
  }, this);

  this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, flatten(vertices));

  this.gl.uniform4f(this.fColor, 1, 0, 0, 1);
  this.gl.drawArrays(this.gl.TRIANGLES, 0, vertices.length);

  // TODO: figure out how to do this more efficiently.
  // likely best bet would be to construct another buffer and pass it to gl object
  // to use with line strip/loop in one pass
  this.gl.uniform4f(this.fColor, 0, 0, 0, 1);
  this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, flatten(edges));
  this.gl.drawArrays(this.gl.LINES, 0, edges.length );

  // TODO: time function and compare with gpu sin/cos processing
};
