"use strict";

var simpleCad = angular.module('simpleCad', ['ngSanitize']);

function fullScreenSquare(element){
  var squareDim = Math.min(window.innerWidth, window.innerHeight);
  element.width = squareDim -2;
  element.height = squareDim -2;
}

simpleCad.directive('rangeParser', function() {
  return {
    require: '?ngModel',
    link: function(scope, element, attr, ctrl) {
      if (!ctrl) return;
      ctrl.$parsers.push(function(value) {
        var val = Number(value);
        if (val !== val) val = undefined;
        return val;
      });
    }
  };
});

simpleCad.directive('rangeSelector', function() {
  return {
    templateUrl: 'range-selector.html', 
    scope: { range: '=' }
  }
});

simpleCad.controller('SimpleCadController', ['$scope', function($scope){

  var init, renderer;

  $scope.availableShapeNames = [''].concat(Object.keys(Shape.registerShapes()));

  $scope.newShape = '';

  $scope.currentShape = -1;
  $scope.currentLight = -1;
  $scope.renderedShapes = [];
  $scope.renderedLights = [];

  $scope.diagram = new Diagram({red: 255, green: 255, blue: 255});

  $scope.editShape = function(){
    setShapeInputs($scope.diagram.shapes[$scope.currentShape]);
  };

  $scope.editLight = function(){
    setLightInputs($scope.diagram.lights[$scope.currentLight]);
  };

  $scope.addLight = function(){
    var newLight = new Light();
    $scope.diagram.addLight(newLight);
    $scope.currentLight = $scope.diagram.lights.length - 1;
    $scope.renderedLights.push($scope.currentLight);

    setLightInputs(newLight);
  };

  $scope.addShape = function(){
    if ($scope.newShape != '')
    {
      var newShape = new Shape.availableShapes[this.newShape]();      
      $scope.diagram.addShape(newShape);
      $scope.currentShape = $scope.diagram.shapes.length - 1;
      $scope.newShape = '';
      $scope.renderedShapes.push($scope.currentShape);

      setShapeInputs(newShape);
    }
  };

  $scope.removeShape = function(){
    if ($scope.renderedShapes.length > 0){
      $scope.renderedShapes.pop();
      $scope.diagram.shapes.splice($scope.currentShape, 1);
      $scope.currentShape --;
      setShapeInputs($scope.diagram.shapes[$scope.currentShape]);
    }
  };

  $scope.removeLight = function(){
    if ($scope.renderedLights.length > 0){
      $scope.renderedLights.pop();
      $scope.diagram.lights.splice($scope.currentLight, 1);
      $scope.currentLight --;
      setLightInputs($scope.diagram.lights[$scope.currentLight]);
    }
  };

  $scope.exportJSON = function(){
    var fileContents = $scope.diagram.serialize();
    saveTextAs(fileContents, 'diagram.json');
  };

  $scope.importJSON = function(){
    var file = $('#import')[0].files[0];
    var reader = new FileReader();
    reader.onload = function(e){
      readJSON(e.target.result);
    };
    reader.readAsText(file);
  };

  var readJSON = function(json){
    $scope.diagram = Diagram.deserialize(json);
    $scope.renderedShapes = $scope.diagram.shapes.map(function(s, i){ return i;});
    $scope.renderedLights = $scope.diagram.lights.map(function(s, i){ return i;});
    $scope.currentShape = $scope.renderedShapes.length - 1;
    $scope.currentLight = $scope.renderedLights.length - 1;
    setShapeInputs($scope.diagram.shapes[$scope.currentShape]);
    setLightInputs($scope.diagram.lights[$scope.currentLight]);
    renderer.diagram = $scope.diagram;
  };

  $scope.loadDemo = function(){
    var json = loadFileAJAX('IlluminatedPrimitives.json');
    readJSON(json);
  };

  $scope.shapeColorPickers = {
    ambient:    {label: 'Ambient', value: '#ff0000', render: true}, 
    diffuse:    {label: 'Diffuse', value: '#ff0000', render: true}, 
    specular:   {label: 'Specular', value: '#ff0000', render: true}, 
    mesh:       {label: 'Mesh', value: '#000000', render: true}
  };

  $scope.shapeSliders = {
    positionX:    {label: 'Position X', min: -1, max: 1, step: 0.01,  value: 0}, 
    positionY:    {label: 'Position Y', min: -1, max: 1, step: 0.01,  value: 0}, 
    scaleX:       {label: 'Scale X',    min:  0, max: 1, step: 0.01,  value: 1}, 
    scaleY:       {label: 'Scale Y',    min:  0, max: 1, step: 0.01,  value: 1}, 
    scaleZ:       {label: 'Scale Z',    min:  0, max: 1, step: 0.01,  value: 1}, 
    rotationX:    {label: 'Rotation X', min: 0, max: 360,  step: 1,     value: 0}, 
    rotationY:    {label: 'Rotation Y', min: 0, max: 360,  step: 1,     value: 0}, 
    rotationZ:    {label: 'Rotation Z', min: 0, max: 360,  step: 1,     value: 0}, 
    velocityX:    {label: 'Velocity X', min: -0.1, max: 0.1,  step: 0.001,     value: 0}, 
    velocityY:    {label: 'Velocity Y', min: -0.1, max: 0.1,  step: 0.001,     value: 0}, 
    shininess:    {label: 'Shininess',  min: 0, max: 100,  step: 1,     value: 0}
  };

  $scope.lightColorPickers = {
    ambient:    {label: 'Ambient', value: '#ffffff', render: true}, 
    diffuse:    {label: 'Diffuse', value: '#ffffff', render: true}, 
    specular:   {label: 'Specular', value: '#ffffff', render: true}
  };

  $scope.lightSliders = {
    positionX:    {label: 'Position X',   min: -1, max: 1, step: 0.01,  value: 0}, 
    positionY:    {label: 'Position Y',   min: -1, max: 1, step: 0.01,  value: 0}, 
    positionZ:    {label: 'Position Z',   min: -1, max: 1, step: 0.01,  value: 0}, 
    velocityX:    {label: 'Velocity X', min: -0.1, max: 0.1,  step: 0.001,     value: 0}, 
    velocityY:    {label: 'Velocity Y', min: -0.1, max: 0.1,  step: 0.001,     value: 0},
    velocityZ:    {label: 'Velocity Z', min: -0.1, max: 0.1,  step: 0.001,     value: 0}
  };

  var getInputs = function(){
    var inputs = {shape: {}, light: {}};
    Object.keys($scope.shapeSliders).forEach(function(name){
      inputs.shape[name] = $scope.shapeSliders[name].value;
    });
    Object.keys($scope.shapeColorPickers).forEach(function(name){
      inputs.shape[name] = $scope.shapeColorPickers[name].value;
      inputs.shape['render' + name] = $scope.shapeColorPickers[name].render;
    });
    Object.keys($scope.lightSliders).forEach(function(name){
      inputs.light[name] = $scope.lightSliders[name].value;
    });
    Object.keys($scope.lightColorPickers).forEach(function(name){
      inputs.light[name] = $scope.lightColorPickers[name].value;
      inputs.light['render' + name] = $scope.lightColorPickers[name].render;
    });
    return inputs;
  };

  var setShapeInputs = function(shape){
    shape = shape || $scope.diagram.shapes[$scope.currentShape];
    $scope.shapeSliders.positionX.value = shape.position.x;
    $scope.shapeSliders.positionY.value = shape.position.y;
    $scope.shapeSliders.velocityX.value = shape.velocity.x;
    $scope.shapeSliders.velocityY.value = shape.velocity.y;
    $scope.shapeSliders.scaleX.value = shape.scale.x;
    $scope.shapeSliders.scaleY.value = shape.scale.y;
    $scope.shapeSliders.scaleZ.value = shape.scale.z;
    $scope.shapeSliders.rotationX.value = shape.rotation.x;
    $scope.shapeSliders.rotationY.value = shape.rotation.y;
    $scope.shapeSliders.rotationZ.value = shape.rotation.z;
    $scope.shapeSliders.shininess.value = shape.shininess;

    $scope.shapeColorPickers.ambient.render = shape.color.ambient.render;
    $scope.shapeColorPickers.ambient.value = shape.color.ambient.colorString;
    $scope.shapeColorPickers.diffuse.render = shape.color.diffuse.render;
    $scope.shapeColorPickers.diffuse.value = shape.color.diffuse.colorString;
    $scope.shapeColorPickers.specular.render = shape.color.specular.render;
    $scope.shapeColorPickers.specular.value = shape.color.specular.colorString;

    $scope.shapeColorPickers.mesh.render = shape.color.mesh.render;
    $scope.shapeColorPickers.mesh.value = shape.color.mesh.colorString;
  };

  var setLightInputs = function(light){
    light = light || $scope.diagram.lights[$scope.currentLight];
    $scope.lightSliders.positionX.value = light.position.x;
    $scope.lightSliders.positionY.value = light.position.y;
    $scope.lightSliders.positionZ.value = light.position.z;

    $scope.lightSliders.velocityX.value = light.velocity.x;
    $scope.lightSliders.velocityY.value = light.velocity.y;
    $scope.lightSliders.velocityZ.value = light.velocity.z;

    $scope.lightColorPickers.ambient.render = light.color.ambient.render;
    $scope.lightColorPickers.ambient.value = light.color.ambient.colorString;
    $scope.lightColorPickers.diffuse.render = light.color.diffuse.render;
    $scope.lightColorPickers.diffuse.value = light.color.diffuse.colorString;
    $scope.lightColorPickers.specular.render = light.color.specular.render;
    $scope.lightColorPickers.specular.value = light.color.specular.colorString;
  };

  $scope.$watch(getInputs, function(newVal, oldVal){
    if (init)
    {
      if ($scope.currentShape >= 0)
      {
        $scope.diagram.shapes[$scope.currentShape].position = {x: newVal.shape.positionX, y: newVal.shape.positionY};
        $scope.diagram.shapes[$scope.currentShape].velocity = {x: newVal.shape.velocityX, y: newVal.shape.velocityY};
        $scope.diagram.shapes[$scope.currentShape].scale = {x: newVal.shape.scaleX, y: newVal.shape.scaleY, z: newVal.shape.scaleZ};
        $scope.diagram.shapes[$scope.currentShape].rotation = {x: newVal.shape.rotationX, y: newVal.shape.rotationY, z: newVal.shape.rotationZ};
        $scope.diagram.shapes[$scope.currentShape].shininess = newVal.shape.shininess;
        
        $scope.diagram.shapes[$scope.currentShape].color.ambient.render = newVal.shape.renderambient;
        $scope.diagram.shapes[$scope.currentShape].color.ambient.colorString = newVal.shape.ambient;
        $scope.diagram.shapes[$scope.currentShape].color.diffuse.render = newVal.shape.renderdiffuse;
        $scope.diagram.shapes[$scope.currentShape].color.diffuse.colorString = newVal.shape.diffuse;
        $scope.diagram.shapes[$scope.currentShape].color.specular.render = newVal.shape.renderspecular;
        $scope.diagram.shapes[$scope.currentShape].color.specular.colorString = newVal.shape.specular;

        $scope.diagram.shapes[$scope.currentShape].color.mesh.render = newVal.shape.rendermesh;
        $scope.diagram.shapes[$scope.currentShape].color.mesh.colorString = newVal.shape.mesh;
      }

      if ($scope.currentLight >= 0)
      {

        $scope.diagram.lights[$scope.currentLight].position = {x: newVal.light.positionX, y: newVal.light.positionY, z: newVal.light.positionZ};
        $scope.diagram.lights[$scope.currentLight].velocity = {x: newVal.light.velocityX, y: newVal.light.velocityY, z: newVal.light.velocityZ};
        
        $scope.diagram.lights[$scope.currentLight].color.ambient.render = newVal.light.renderambient;
        $scope.diagram.lights[$scope.currentLight].color.ambient.colorString = newVal.light.ambient;
        $scope.diagram.lights[$scope.currentLight].color.diffuse.render = newVal.light.renderdiffuse;
        $scope.diagram.lights[$scope.currentLight].color.diffuse.colorString = newVal.light.diffuse;
        $scope.diagram.lights[$scope.currentLight].color.specular.render = newVal.light.renderspecular;
        $scope.diagram.lights[$scope.currentLight].color.specular.colorString = newVal.light.specular;
      }
    }
  }, true);

  angular.element(document).ready(function(){

    init = function(){
      var canvasDiagram = document.getElementById("gl-canvas");
      var canvasLabels = document.getElementById("labels-canvas");
      fullScreenSquare(canvasDiagram);
      fullScreenSquare(canvasLabels);

      window.onresize = function(){
        fullScreenSquare(canvasDiagram);
        fullScreenSquare(canvasLabels);
        $scope.render();
      };

      $('.controls').draggable({handle: 'h1'});
      renderer = new Renderer('gl-canvas', 'labels-canvas', 'vertex-shader.glsl', 'fragment-shader.glsl', $scope.diagram, setShapeInputs, setLightInputs);
      renderer.render();
    };

    init();
  });
}]);

