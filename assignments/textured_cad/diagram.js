function Diagram(color, shapes, lights, renderNames){

  this.color = color && 
    new Color({red: color.red, green:color.green, blue:color.blue}) ||
    new Color({red: 255, green: 255, blue:255});

  this.shapes = shapes || [];
  this.lights = lights || [];
  this.renderNames = renderNames || false;
}

Diagram.prototype.addShape = function(shape){
  return this.shapes.push(shape);
};

Diagram.prototype.removeShape = function(shape){
  return this.shapes = this.shapes.filter(function(s){ return s != shape; });
};

Diagram.prototype.addLight = function(light){
  return this.lights.push(light);
};

Diagram.prototype.removeLight = function(light){
  return this.lights = this.lights.filter(function(l){ return l != light; });
};

Diagram.prototype.isAnimated = function(){
  return this.shapes.some(function(s){ return s.isInMotion();}) ||
    this.lights.some(function(l){ return l.isInMotion();});
};

Diagram.prototype.updatePositions = function(setShapeInputs, setLightInputs){
  this.shapes.forEach(function(s){ s.updatePosition(); });
  this.lights.forEach(function(l){ l.updatePosition(); });

  if(setShapeInputs) setShapeInputs();
  if(setLightInputs) setLightInputs();
};

Diagram.prototype.serialize = function(){
  return JSON.stringify(this);
};

Diagram.deserialize = function(serialized){
  var obj = JSON.parse(serialized);
  var diagram = new Diagram(obj.color, [], obj.renderNames);
  diagram.shapes = obj.shapes.map(function(o){
    return Shape.fromObject(o);
  });
  diagram.lights = obj.lights.map(function(o){
    return Light.fromObject(o);
  });
  return diagram;
};

