"use strict";

function Cylinder(position, scale, rotation, color){
  Shape.init.call(this, position, scale, rotation, color);
}

Cylinder.prototype = new Shape();
Cylinder.prototype.constructor = Cylinder;

Cylinder.prototype.renderFacets = function(gl, bufferStart){
  // bottom facet
  gl.drawArrays(gl.TRIANGLE_FAN, bufferStart, Cylinder.NUM_BOTTOM_VERTICES+1);
  // top facet
  gl.drawArrays(gl.TRIANGLE_FAN, bufferStart + Cylinder.NUM_BOTTOM_VERTICES+1, Cylinder.NUM_BOTTOM_VERTICES+1);
  // side facets
  gl.drawArrays(gl.TRIANGLE_STRIP, bufferStart + Cylinder.SIDE_START, (Cylinder.NUM_BOTTOM_VERTICES + 1)*2);
};

Cylinder.prototype.renderMesh = function(gl, bufferStart){
  // bottom facet outline
  gl.drawArrays(gl.LINE_LOOP, bufferStart, Cylinder.NUM_BOTTOM_VERTICES);
  // top facet outline
  gl.drawArrays(gl.LINE_LOOP, bufferStart + Cylinder.NUM_BOTTOM_VERTICES+1, Cylinder.NUM_BOTTOM_VERTICES);
  // side mesh
  gl.drawArrays(gl.LINES, bufferStart + Cylinder.SIDE_START, (Cylinder.NUM_BOTTOM_VERTICES)*2);
};

// initialize modelBuffers
(function(){

  var cylinder = [], points = 0, face;
  Cylinder.NUM_BOTTOM_VERTICES = 40;

  // 'bottom' of cylinder, made with triangle strips
  var faceBottom = Shape.polyVertices(Cylinder.NUM_BOTTOM_VERTICES, -1);
  faceBottom.push(faceBottom[0]);
  cylinder = cylinder.concat(faceBottom);
  points += Cylinder.NUM_BOTTOM_VERTICES + 1;

  // 'top' of cylinder, made with triangle strips
  var faceTop = Shape.polyVertices(Cylinder.NUM_BOTTOM_VERTICES, 1);
  faceTop.push(faceTop[0]);
  cylinder = cylinder.concat(faceTop);
  points += Cylinder.NUM_BOTTOM_VERTICES + 1;

  Cylinder.SIDE_START = points;

  // 'sides', mesh made of lines, facets made of triangle strips
  for(var i = 0; i < faceBottom.length; i++)
  {
    cylinder.push(faceBottom[i], faceTop[i]);
    points += 2;
  }

  Cylinder.modelBuffer = cylinder;

})();


