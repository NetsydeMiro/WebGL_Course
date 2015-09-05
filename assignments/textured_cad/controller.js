"use strict";

var controls = [
  {label: 'Scale X', min: 0, max: 10, value: 5}, 
  {label: 'Scale Y', min: 0, max: 10, value: 5}, 
  {label: 'Scale Z', min: 0, max: 10, value: 5}
];


$(function(){
  var views = rivets.bind($('.controls'), {controls: controls});
});

function Application(){
}

Application.prototype.addShape = function(){
  if (this.newShapeName)
  {
      var newShape = new Shape.availableShapes[this.newShapeName]();      
      this.diagram.addShape(newShape);
      this.currentShape = newShape;
      $scope.newShape = '';
  }
};

Application.prototype.addLight = function(){
    var newLight = new Light();
    this.diagram.addLight(newLight);
    this.currentLight = newLight;
};

Application.prototype.removeShape = function(){
  if (this.diagram.currentShape)
  {
    this.diagram.removeShape(this.diagram.currentShape);
    this.diagram.currentShape = this.diagram.shapes.length > 0 ? 
      this.diagram.shapes[0] : null;
  }
};

Application.prototype.removeLight = function(){
  if (this.diagram.currentLight)
  {
    this.diagram.removeLight(this.diagram.currentLight);
    this.diagram.currentLight = this.diagram.lights.length > 0 ? 
      this.diagram.lights[0] : null;
  }
};

Application.prototype..exportJSON = function(){
    var fileContents = this.diagram.serialize();
    saveTextAs(fileContents, 'diagram.json');
};

Application.prototype.importJSON = function(){
    var file = $('#import')[0].files[0];
    var reader = new FileReader();
    reader.onload = function(e){
      Application.prototype.readJSON(e.target.result);
    };
    reader.readAsText(file);
};

Application.prototype.readJSON = function(json){
    this.diagram = Diagram.deserialize(json);
    $scope.currentShape = this.diagram.shapes[0] ? this.diagram.shapes[0] : null;
    $scope.currentLight = this.diagram.lights[0] ? this.diagram.lights[0] : null;
    this.renderer.diagram = this.diagram;
};

var application = {
  availableShapeNames = [''].concat(Object.keys(Shape.registerShapes())), 
  newShapeName: '', 
  currentShape: null, 
  diagram = new Diagram({red: 255, green: 255, blue: 255})
};

application.prototype = new Application();

