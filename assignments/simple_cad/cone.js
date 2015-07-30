"use strict";

function Cone(position, scale, rotation, color){
  Shape.init.call(this, position, scale, rotation, color);
}

Cone.prototype = new Shape();
Cone.prototype.constructor = Cone;

Cone.prototype.renderFacets = function(gl, bufferStart){
  gl.drawArrays(gl.TRIANGLE_FAN, bufferStart, Cone.BOTTOM_VERTICES+1);
  gl.drawArrays(gl.TRIANGLE_FAN, bufferStart + Cone.BOTTOM_VERTICES+4, Cone.BOTTOM_VERTICES);
};

Cone.prototype.renderMesh = function(gl, bufferStart){
  gl.drawArrays(gl.LINE_LOOP, bufferStart+4, bufferStart + Cone.BOTTOM_VERTICES);
  gl.drawArrays(gl.LINES, bufferStart + Cone.BOTTOM_VERTICES*2, Cone.BOTTOM_VERTICES);
};

// initialize modelBuffers
(function(){

  var cone = [];

  Cone.BOTTOM_VERTICES = 10;

  // 'bottom' of cone
  cone.push([0,0,0,1]);
  for(var i = 0; i < Cone.BOTTOM_VERTICES; i++)
  {
    var x = Math.sin(2*Math.PI/Cone.BOTTOM_VERTICES*i);
    var y = Math.cos(2*Math.PI/Cone.BOTTOM_VERTICES*i);
    cone.push([x,y,0,1]);
  }

  // 'sides'
  var tip = [0,1,0,1];
  cone.push(tip)
  for(var i = 0; i < Cone.BOTTOM_VERTICES; i++)
  {
    var x = Math.sin(2*Math.PI/Cone.BOTTOM_VERTICES*i);
    var y = Math.cos(2*Math.PI/Cone.BOTTOM_VERTICES*i);
    cone.push([x,y,0,1]);
  }

  // 'side mesh'
  for(var i = 0; i < Cone.BOTTOM_VERTICES; i++)
  {
    var x = Math.sin(2*Math.PI/Cone.BOTTOM_VERTICES*i);
    var y = Math.cos(2*Math.PI/Cone.BOTTOM_VERTICES*i);
    cone.push(tip);
    cone.push([x,y,0,1]);
  }

  Cone.modelBuffer = cone;

})();


