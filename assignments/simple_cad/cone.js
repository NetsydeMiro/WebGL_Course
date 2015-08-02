"use strict";

function Cone(position, scale, rotation, color){
  Shape.init.call(this, position, scale, rotation, color);
}

Cone.prototype = new Shape();
Cone.prototype.constructor = Cone;

Cone.prototype.renderFacets = function(gl, bufferStart){
  // bottom facet
  gl.drawArrays(gl.TRIANGLE_FAN, bufferStart, Cone.BOTTOM_VERTICES+1);
  // side facets
  gl.drawArrays(gl.TRIANGLE_FAN, bufferStart + Cone.BOTTOM_VERTICES+1, Cone.BOTTOM_VERTICES + 2);
};

Cone.prototype.renderMesh = function(gl, bufferStart){
  // bottom mesh
  gl.drawArrays(gl.LINE_LOOP, bufferStart, Cone.BOTTOM_VERTICES);
  // side mesh
  gl.drawArrays(gl.LINES, bufferStart + Cone.SIDE_MESH_START, (Cone.BOTTOM_VERTICES)*2);
};

// initialize modelBuffers
(function(){

  var cone = [];
  var points = 0;

  Cone.BOTTOM_VERTICES = 30;

  // 'bottom' of cone
  for(var i = 0; i <= Cone.BOTTOM_VERTICES; i++)
  {
    var x = Math.cos(2*Math.PI/Cone.BOTTOM_VERTICES*i);
    var y = Math.sin(2*Math.PI/Cone.BOTTOM_VERTICES*i);
    cone.push([x,y,-1,1]);
    points += 1;
  }

  // 'sides'
  var tip = [0,0,1,1];
  cone.push(tip)
  points += 1;
  for(var i = 0; i <= Cone.BOTTOM_VERTICES; i++)
  {
    var x = Math.cos(2*Math.PI/Cone.BOTTOM_VERTICES*i);
    var y = Math.sin(2*Math.PI/Cone.BOTTOM_VERTICES*i);
    cone.push([x,y,-1,1]);
    points += 1;
  }

  Cone.SIDE_MESH_START = points;

  // 'side mesh'
  for(var i = 0; i < Cone.BOTTOM_VERTICES; i++)
  {
    var x = Math.cos(2*Math.PI/Cone.BOTTOM_VERTICES*i);
    var y = Math.sin(2*Math.PI/Cone.BOTTOM_VERTICES*i);
    cone.push(tip);
    cone.push([x,y,-1,1]);
  }

  Cone.modelBuffer = cone;

})();


