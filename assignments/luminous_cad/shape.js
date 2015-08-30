"use strict";

function Shape(){}

Shape.init = function(name, position, scale, rotation, color, shininess, velocity){
  this.type = this.constructor.name;
  this.name = name || "New " + this.constructor.name;
  //this.position = position || {x: 0, y:0, z:0};
  Positionable.call(this, position, velocity);
  this.scale = scale || {x: 0.2, y:0.2, z:0.2};
  this.rotation = rotation || {x: 0, y: 0, z: 0};
  this.color = color && Color.makePropertiesColors(color) || {
    ambient:  new Color({red: 255, green: 0, blue: 0}), 
    diffuse:  new Color({red: 255, green: 0, blue: 0}), 
    specular: new Color({red: 255, green: 0, blue: 0}), 
    mesh: new Color({red: 0, green: 0, blue:0})
  };
  this.shininess = 10;
};

Shape.prototype = new Positionable();

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

Shape.prototype.renderMesh = function(gl, bufferIndex){
  throw "Shape descendants must know how to render their edges";
};

Shape.prototype.serialize = function(){
  return JSON.stringify(this);
};

Shape.fromObject = function(obj){
  return new Shape.availableShapes[obj.type](obj.name, obj.position, obj.scale, obj.rotation, obj.color, obj.shininess, obj.velocity);
};

Shape.deserialize = function(serialized) {
  var obj = JSON.parse(serialized);
  return Shape.fromObject(obj);
};

Shape.registerShapes = function(){
  var shapeConstructorNames = Object.keys(window)
    .filter(function(shapeName){ 
      return window[shapeName] && (window[shapeName].prototype instanceof Shape);
    });

  var shapeRegistry = shapeConstructorNames
    .reduce(function(registry, shapeName){
      registry[shapeName] = window[shapeName];
      return registry;
    }, {});

  return Shape.availableShapes = shapeRegistry;
};

Shape.polyVertices = function(numVertices, z){
  var vertices = [];

  for(var i = 0; i < numVertices; i++)
  {
    var x = Math.cos(2*Math.PI/numVertices*i);
    var y = Math.sin(2*Math.PI/numVertices*i);
    vertices.push([x,y,z,1]);
  }

  return vertices;
};
