"use strict";

function Light(name, position, color){
  this.name = name || "New Light";
  this.position = position || {x: 0, y:0, z:0};
  this.color = color || 
    {
      ambient:  new Color({red: 255, green: 255, blue: 255}), 
      diffuse:  new Color({red: 255, green: 255, blue: 255}), 
      specular: new Color({red: 255, green: 255, blue: 255})
    }
};

Light.prototype.serialize = function(){
  return JSON.stringify(this);
};

Light.fromObject = function(obj){
  return new Light(obj.name, obj.position, obj.color);
};

Light.deserialize = function(serialized) {
  var obj = JSON.parse(serialized);
  return Light.fromObject(obj);
};

