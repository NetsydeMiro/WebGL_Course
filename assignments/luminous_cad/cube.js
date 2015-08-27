"use strict";

function Cube(name, position, scale, rotation, color){
  Shape.init.call(this, name, position, scale, rotation, color);
}

Cube.prototype = new Shape();
Cube.prototype.constructor = Cube;

Cube.prototype.renderFacets = function(gl, bufferStart){
  for(var i=bufferStart; i < bufferStart + Cube.vertexBuffer.length; i+=4)
    gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
};

Cube.prototype.renderMesh = function(gl, bufferStart){
  for(var i=bufferStart; i < bufferStart + Cube.vertexBuffer.length; i+=4)
    gl.drawArrays(gl.LINE_LOOP, i, 4);
};

// initialize modelBuffers
(function(){

  var cube = [], normals = [];

  var square = [
    [-1,1], [1,1], [1,-1], [-1,-1]
  ];

  // 'front' and 'back' faces
  cube = cube.concat(square.map(function(sq){return sq.concat([ 1]);}));
  normals = normals.concat(square.map(function(){ return [0,0,1,0]}));

  cube = cube.concat(square.map(function(sq){return sq.concat([-1]);}));
  normals = normals.concat(square.map(function(){ return [0,0,-1,0]}));

  // 'left' and 'right' faces
  cube = cube.concat(square.map(function(sq){return [ 1].concat(sq);}));
  normals = normals.concat(square.map(function(){ return [1,0,0,0]}));

  cube = cube.concat(square.map(function(sq){return [-1].concat(sq);}));
  normals = normals.concat(square.map(function(){ return [-1,0,0,0]}));

  // 'top' and 'bottom' faces
  cube = cube.concat(square.map(function(sq){return [sq[0], 1, sq[1]];}));
  normals = normals.concat(square.map(function(){ return [0,1,0,0]}));

  cube = cube.concat(square.map(function(sq){return [sq[0],-1, sq[1]];}));
  normals = normals.concat(square.map(function(){ return [0,-1,0,0]}));

  // can shrink here
  //cube = cube.map(function(point){ return point.map(function(coord){ return coord / 2;})});

  // add w component
  cube = cube.map(function(point){ return vec4(point[0], point[1], point[2], 1)});

  Cube.vertexBuffer = cube;
  Cube.normalBuffer = normals;

})();


