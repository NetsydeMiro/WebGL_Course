"use strict";

function SimplePaint(canvasId, color){

  this.index = 0;
  this.numStrokes = 0;
  this.numIndices = [0];
  this.start = [0];
  this.penDown = false;

  var canvas = this.canvas = document.getElementById(canvasId);

  var _this = this;

  canvas.addEventListener("mousedown", function(){
    _this.lowerPen();
  });

  canvas.addEventListener("mouseup", function(){
    _this.raisePen();
  });

  canvas.addEventListener("mouseout", function(){
    _this.raisePen();
  });

  canvas.addEventListener("mousemove", function(e){
    _this.movePen(e.clientX, e.clientY);
  });

  var gl = this.gl = WebGLUtils.setupWebGL(this.canvas);
  if (!gl) 
    alert( "WebGL isn't available" );

  gl.clearColor(color.red/255, color.green/255, color.blue/255, 1.0);

  // should incorporate shaders into this file probably, rather than have external dependencies
  var program = initShaders(gl, "vertex-shader.glsl", "fragment-shader.glsl");
  gl.useProgram(program);

  var strokeBufferId = this.strokeBufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, strokeBufferId);
  gl.bufferData(gl.ARRAY_BUFFER, 8*SimplePaint.MAX_STROKES, gl.STATIC_DRAW);

  var vPos = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPos);

  var colorBufferId = this.colorBufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId );
  gl.bufferData(gl.ARRAY_BUFFER, 16*SimplePaint.MAX_STROKES, gl.STATIC_DRAW);

  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);
}

SimplePaint.MAX_STROKES = 20000;

SimplePaint.prototype.lowerPen = function(){
  this.penDown = true;
};

SimplePaint.prototype.raisePen = function(){
    if (this.penDown)
    {
      this.penDown = false;
      this.priorPos = null;
      this.numStrokes++;
      this.numIndices[this.numStrokes] = 0;
      this.start[this.numStrokes] = this.index;
    }
};

SimplePaint.prototype.setPaint = function(color){
    this.color = color;
};

SimplePaint.prototype.setBrush = function(strokeWidth){
  this.strokeWidth = strokeWidth;
};

SimplePaint.prototype.render = function(){
  this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  this.gl.clear(this.gl.COLOR_BUFFER_BIT);

  for(var i=0; i<=this.numStrokes; i++) {
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, this.start[i], this.numIndices[i]);
  }
};

SimplePaint.prototype.movePen = function(canvasX, canvasY){

  if (this.penDown){

    var pos = vec2(
        2 * canvasX / this.canvas.width - 1,
        2 * (this.canvas.height - canvasY) / this.canvas.height - 1);

    if (!this.priorPos){
      this.bufferPoint(pos);
      this.priorPos = pos;
    }
    else
    {
      var dx = pos[0] - this.priorPos[0];
      var dy = pos[1] - this.priorPos[1];

      var mag = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

      dx = dx / mag;
      dy = dy / mag;

      var point1 = vec2(pos[0] + dy * this.strokeWidth, pos[1] - dx * this.strokeWidth);
      var point2 = vec2(pos[0] - dy * this.strokeWidth, pos[1] + dx * this.strokeWidth);

      this.bufferPoint(point1);
      this.bufferPoint(point2);

      this.priorPos = pos;
      this.render();
    }
  }
};

SimplePaint.prototype.bufferPoint = function(pos){
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.strokeBufferId);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 8*this.index, flatten(pos));

    var colorVector = vec4(this.color.red/255, this.color.green/255, this.color.blue/255, 1.0);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBufferId);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 16*this.index, flatten(colorVector));

    this.numIndices[this.numStrokes]++;
    this.index++;
};

