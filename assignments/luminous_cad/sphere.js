"use strict";

function Sphere(name, position, scale, rotation, color){
  Shape.init.call(this, name, position, scale, rotation, color);
}

Sphere.prototype = new Shape();
Sphere.prototype.constructor = Sphere;

Sphere.prototype.renderFacets = function(gl, bufferStart){
  for(var i=bufferStart; i < bufferStart + Sphere.modelBuffer.length; i+=3)
    gl.drawArrays(gl.TRIANGLES, i, 3);
};

Sphere.prototype.renderMesh = function(gl, bufferStart){
  for(var i=bufferStart; i < bufferStart + Sphere.modelBuffer.length; i+=3)
    gl.drawArrays(gl.LINE_LOOP, i, 3);
};

// initialize modelBuffers
(function(){

  const NUM_TIMES_TO_SUBDIVIDE = 4;

  var divideTriangle = function(triangle, count, buffer) {

    var a = triangle[0], b = triangle[1], c = triangle[2];

    if ( count > 0 ) {
      var ab = normalize(mix( a, b, 0.5), true);
      var ac = normalize(mix( a, c, 0.5), true);
      var bc = normalize(mix( b, c, 0.5), true);

      divideTriangle([a,  ab, ac], count - 1, buffer);
      divideTriangle([ab, b,  bc], count - 1, buffer);
      divideTriangle([bc, c,  ac], count - 1, buffer);
      divideTriangle([ab, bc, ac], count - 1, buffer);
    }
    else { 
      buffer.push(a);
      buffer.push(b);
      buffer.push(c);
    }
  };

  var upperPeak = [0, 0, 1, 1];
  var lowerPeak = [0, 0,-1, 1];
  var midPoints = [
    [ 1, 0, 0, 1],
    [ 0, 1, 0, 1], 
    [-1, 0, 0, 1],
    [ 0,-1, 0, 1]
    ];

  var midSequence = [
    [midPoints[0], midPoints[1]], 
    [midPoints[1], midPoints[2]], 
    [midPoints[2], midPoints[3]], 
    [midPoints[3], midPoints[0]]
    ];

  var octaTop = midSequence.map(function(ms){
    return [upperPeak].concat(ms);
  });

  var octaBottom = midSequence.map(function(ms){
    return [lowerPeak].concat(ms);
  });

  var octaHedron = octaTop.concat(octaBottom);

  var modelBuffer = [];
  octaHedron.forEach(function(triangle){
    divideTriangle(triangle, NUM_TIMES_TO_SUBDIVIDE, modelBuffer);
  });

  Sphere.vertexBuffer = modelBuffer;

  Sphere.normalBuffer = modelBuffer
    .slice()
    .map(function(v){ 
      var n = normalize(v.slice(), true);
      n[3] = 0; 
      return n;
    });

})();

