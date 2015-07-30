"use strict";

function Cube(position, scale, rotation, color){
  Shape.init.call(this, position, scale, rotation, color);
}

Cube.prototype = new Shape();
Cube.prototype.constructor = Cube;

Cube.prototype.renderFacets = function(gl, bufferIndex){
  for(var i=bufferIndex; i < Cube.modelBuffers[0].length; i+=4)
    gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
};

Cube.prototype.renderMesh = function(gl, bufferIndex){
  for(var i=bufferIndex; i < Cube.modelBuffers[0].length; i+=4)
    gl.drawArrays(gl.LINE_LOOP, i, 4);
};

// initialize modelBuffers
(function(){

  var cube = [];

  var square = [
    [-1,1], [1,1], [-1,1], [-1,-1]
  ];

  // 'front' and 'back' faces
  cube = cube.concat(square.map(function(sq){return sq.concat([1]);}));
  cube = cube.concat(square.map(function(sq){return sq.concat([-1]);}));

  // 'left' and 'right' faces
  cube = cube.concat(square.map(function(sq){return [1].concat(sq);}));
  cube = cube.concat(square.map(function(sq){return [-1].concat(sq);}));

  // 'top' and 'bottom' faces
  cube = cube.concat(square.map(function(sq){return [sq[0], 1, sq[1]];}));
  cube = cube.concat(square.map(function(sq){return [sq[0], 0, sq[1]];}));

  // can shrink here
  //cube = cube.map(function(point){ return point.map(function(coord){ return coord / 2;})});

  // add w component
  cube.forEach(function(c){ c.push(1);});

  Cube.modelBuffers = [cube];

})();


