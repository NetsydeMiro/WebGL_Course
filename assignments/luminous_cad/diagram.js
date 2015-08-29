function Diagram(color, shapes, lights, renderNames){

  this.color = color && 
    new Color({red: color.red, green:color.green, blue:color.blue}) ||
    new Color({red: 255, green: 255, blue:255});

  this.shapes = shapes || [];
  this.lights = lights || [];
  this.renderNames = renderNames || false;
}

Diagram.prototype.addShape = function(shape){
  this.shapes.push(shape);
};

Diagram.prototype.addLight = function(light){
  this.lights.push(light);
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

