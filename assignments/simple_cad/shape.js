"use strict";

function Shape(){}

Shape.init = function(position, scale, rotation, color){
  this.position = position;
  this.scale = scale;
  this.rotation = rotation;
  this.color = color;
};

Shape.prototype.getTransformMatrix = function(){
  var transformMatrix = scalem(this.scale.x, this.scale.y, this.scale.z);

  transformMatrix = mult(rotate(this.rotation.x, [1,0,0]), transformMatrix);
  transformMatrix = mult(rotate(this.rotation.y, [0,1,0]), transformMatrix);
  transformMatrix = mult(rotate(this.rotation.z, [0,0,1]), transformMatrix);

  transformMatrix = mult(translate(this.position.x, this.position.y, 0), transformMatrix);

  return transformMatrix;
};

Shape.prototype.renderFacets = function(gl, bufferIndex){
  throw "Shape descendants must know how to render their facets";
};

Shape.prototype.renderEdges = function(gl, bufferIndex){
  throw "Shape descendants must know how to render their edges";
};

Shape.registerShapes = function(){
  this.availableShapes = Object.keys(window)
    .filter(function(shapeName){ 
      return window[shapeName].prototype instanceof Shape; 
    })
    .reduce(function(shapes, shapeName){
      shapes[shapeName] = window[shapeName];
      return shapes;
    }, {});
};

