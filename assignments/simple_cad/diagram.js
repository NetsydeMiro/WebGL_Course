function Diagram(color, renderFacets, renderMesh){
  this.shapes = [];
  this.renderFacets = renderFacets !== false;
  this.renderMesh = renderMesh !== false;

  this.color = color && 
    new Color({red: color.red, green:color.green, blue:color.blue}) ||
    new Color({red: 255, green: 255, blue:255});
}

Diagram.prototype.add = function(shape){
  this.shapes.push(shape);
};

