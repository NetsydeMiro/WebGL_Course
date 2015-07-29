function Diagram(color){
  this.shapes = [];
  this.color = color;
}

Diagram.prototype.add = function(shape){
  this.shapes.push(shape);
};

