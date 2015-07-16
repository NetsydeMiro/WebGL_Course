"use strict";

function Renderer(canvasId, vertexShaderUrl, fragmentShaderUrl)
{
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
    initShaders(gl, vertexShaderUrl, fragmentShaderUrl);
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

Renderer.prototype.render = 
function(trianglePointBuffer, linePointBuffer)
{
  this.gl.clear(this.gl.COLOR_BUFFER_BIT);

  this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, flatten(trianglePointBuffer));
  this.gl.uniform4f(this.fColor, 1, 0, 0, 1);
  this.gl.drawArrays(this.gl.TRIANGLES, 0, trianglePointBuffer.length);

  this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, flatten(linePointBuffer));
  this.gl.uniform4f(this.fColor, 0, 0, 0, 1);
  this.gl.drawArrays(this.gl.LINES, 0, linePointBuffer.length );
};

//TODO: timing functions
//TODO: process in gpu
//TODO: create and bind max buffers, and only render certain amount to get subdivisions
