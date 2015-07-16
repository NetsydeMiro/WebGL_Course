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

Tessellator.prototype.divideTriangle = 
function divideTriangle(a, b, c, count, theta, constant)
{
  // end recursion, prep triange for rendering
  if (count == 0) {
    var transformed_points = [a,b,c].map(function(point){
      var x = point[0]; var y = point[1];
      var d = Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 0.5);

      var theta_prime = theta * d * constant;

      var x_prime = x * Math.cos(theta_prime) - y * Math.sin(theta_prime);
      var y_prime = x * Math.sin(theta_prime) + y * Math.cos(theta_prime);

      return [x_prime, y_prime]; 
    });

    this.points.push(transformed_points[0], transformed_points[1], transformed_points[2]);

    this.lines.push(transformed_points[0], transformed_points[1], 
        transformed_points[1], transformed_points[2], 
        transformed_points[2], transformed_points[0]);
  }
  else {

    //bisect the sides
    var ab = mix(a, b, 0.5);
    var ac = mix(a, c, 0.5);
    var bc = mix(b, c, 0.5);

    --count;

    // four new triangles
    this.divideTriangle(a, ab, ac, count, theta, constant);
    this.divideTriangle(c, ac, bc, count, theta, constant);
    this.divideTriangle(b, bc, ab, count, theta, constant);
    this.divideTriangle(ab, ac, bc, count, theta, constant);
  }
}

Tessellator.prototype.render = 
function (subdivisions, theta, constant)
{
  var vertices = [
    [-1, -1],
    [ 0,  1],
    [ 1, -1]
      ];

  this.points = []; this.lines = [];

  this.divideTriangle(vertices[0], vertices[1], vertices[2],
    subdivisions, theta, constant);

  this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, flatten(this.points));

  this.gl.uniform4f(this.fColor, 1, 0, 0, 1);
  this.gl.drawArrays(this.gl.TRIANGLES, 0, this.points.length);

  // TODO: figure out how to do this more efficiently.
  // likely best bet would be to construct another buffer and pass it to gl object
  // to use with line strip/loop in one pass
  this.gl.uniform4f(this.fColor, 0, 0, 0, 1);
  this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, flatten(this.lines));
  this.gl.drawArrays(this.gl.LINES, 0, this.lines.length );

  // TODO: time function and compare with gpu sin/cos processing
  //points = [];
}
