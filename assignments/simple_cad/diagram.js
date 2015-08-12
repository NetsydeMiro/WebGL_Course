function Diagram(color){
  this.shapes = [];
  this.renderNames = false;

  this.color = color && 
    new Color({red: color.red, green:color.green, blue:color.blue}) ||
    new Color({red: 255, green: 255, blue:255});
}

Diagram.prototype.add = function(shape){
  this.shapes.push(shape);
};

