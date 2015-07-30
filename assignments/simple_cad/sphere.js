"use strict";

function Sphere(position, scale, rotation, color){
  Shape.init.call(this, position, scale, rotation, color);
}

Sphere.prototype = new Shape();

Sphere.prototype.renderFacets = function(gl, bufferIndex){
  for(var i=bufferIndex; i < Sphere.modelBuffers[0].length; i+=3)
    gl.drawArrays(gl.TRIANGLES, i, 3);
};

Sphere.prototype.renderMesh = function(gl, bufferIndex){
  for(var i=bufferIndex; i < Sphere.modelBuffers[0].length; i+=3)
    gl.drawArrays(gl.LINE_LOOP, i, 3);
};

// initialize modelBuffers
(function(){

  const NUM_TIMES_TO_SUBDIVIDE = 5;

  function divideTriangle(a, b, c, count, buffer) {

    if ( count > 0 ) {
      var ab = normalize(mix( a, b, 0.5), true);
      var ac = normalize(mix( a, c, 0.5), true);
      var bc = normalize(mix( b, c, 0.5), true);

      divideTriangle(a,  ab, ac, count - 1, buffer);
      divideTriangle(ab, b,  bc, count - 1, buffer);
      divideTriangle(bc, c,  ac, count - 1, buffer);
      divideTriangle(ab, bc, ac, count - 1, buffer);
    }
    else { 
      // draw tetrahedron at end of recursion
      buffer.push(a);
      buffer.push(b);
      buffer.push(c);
    }
  }

  function tetrahedron(a, b, c, d, n, buffer) {
    divideTriangle(a, b, c, n, buffer);
    divideTriangle(d, c, b, n, buffer);
    divideTriangle(a, d, b, n, buffer);
    divideTriangle(a, c, d, n, buffer);
  }

  var va = vec4(0.0, 0.0, -1.0, 1);
  var vb = vec4(0.0, 0.942809, 0.333333, 1);
  var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
  var vd = vec4(0.816497, -0.471405, 0.333333, 1);

  var modelBuffer = [];
  tetrahedron(va, vb, vc, vd, NUM_TIMES_TO_SUBDIVIDE, modelBuffer);

  Sphere.modelBuffers = [modelBuffer];

})();


