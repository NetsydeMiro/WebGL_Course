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
  $scope.renderedShapes = [];

  $scope.diagram = new Diagram({red: 255, green: 255, blue: 255});

  $scope.render = function(){
      renderer.render($scope.diagram, $scope.renderFacets, $scope.renderMesh);
  };

  $scope.editShape = function(){
    setInputs($scope.diagram.shapes[$scope.currentShape]);
  };

  $scope.addShape = function(){
    if ($scope.newShape != '')
    {
      var newShape = new Shape.availableShapes[this.newShape]();      
      $scope.diagram.add(newShape);
      $scope.currentShape = $scope.diagram.shapes.length - 1;
      $scope.newShape = '';
      $scope.renderedShapes.push($scope.currentShape);
      $scope.render();

      setInputs(newShape);
    }
  };

  $scope.colorPickers = {
    shape:      {label: 'Shape', value: '#ff0000'}, 
    mesh:       {label: 'Mesh', value: '#000000'}
  };

  $scope.sliders = {
    positionX:    {label: 'Position X',   min: -1, max: 1, step: 0.01,  value: 0}, 
    positionY:    {label: 'Position Y',   min: -1, max: 1, step: 0.01,  value: 0}, 
    scaleX:       {label: 'Scale X',      min:  0, max: 1, step: 0.01,  value: 1}, 
    scaleY:       {label: 'Scale Y',      min:  0, max: 1, step: 0.01,  value: 1}, 
    scaleZ:       {label: 'Scale Z',      min:  0, max: 1, step: 0.01,  value: 1}, 
    rotationX:    {label: 'Rotation X', min: 0, max: 360,  step: 1,     value: 0}, 
    rotationY:    {label: 'Rotation Y', min: 0, max: 360,  step: 1,     value: 0}, 
    rotationZ:    {label: 'Rotation Z', min: 0, max: 360,  step: 1,     value: 0}
  };

  var getInputs = function(){
    var inputs = {};
    Object.keys($scope.sliders).forEach(function(name){
      inputs[name] = $scope.sliders[name].value;
    });
    Object.keys($scope.colorPickers).forEach(function(name){
      inputs[name] = $scope.colorPickers[name].value;
    });
    return inputs;
  };

  var setInputs = function(shape){
    $scope.sliders.positionX.value = shape.position.x;
    $scope.sliders.positionY.value = shape.position.y;
    $scope.sliders.scaleX.value = shape.scale.x;
    $scope.sliders.scaleY.value = shape.scale.y;
    $scope.sliders.scaleZ.value = shape.scale.z;
    $scope.sliders.rotationX.value = shape.rotation.x;
    $scope.sliders.rotationY.value = shape.rotation.y;
    $scope.sliders.rotationZ.value = shape.rotation.z;
    $scope.colorPickers.shape.value = shape.color.facets.colorString;
    $scope.colorPickers.mesh.value = shape.color.mesh.colorString;
  };

  $scope.$watch(getInputs, function(newVal, oldVal){
    if (init)
    {
      $scope.diagram.shapes[$scope.currentShape].position = {x: newVal.positionX, y: newVal.positionY};
      $scope.diagram.shapes[$scope.currentShape].scale = {x: newVal.scaleX, y: newVal.scaleY, z: newVal.scaleZ};
      $scope.diagram.shapes[$scope.currentShape].rotation = {x: newVal.rotationX, y: newVal.rotationY, z: newVal.rotationZ};
      $scope.diagram.shapes[$scope.currentShape].color.facets.colorString = newVal.shape;
      $scope.diagram.shapes[$scope.currentShape].color.mesh.colorString = newVal.mesh;

      $scope.render();
    }
  }, true);

  angular.element(document).ready(function(){

    init = function(){
      var canvas = document.getElementById("gl-canvas");
      fullScreenSquare(canvas);

      window.onresize = function(){
        fullScreenSquare(canvas);
        $scope.render();
      };

      $('.controls').draggable({handle: 'h1'});
      renderer = new Renderer('gl-canvas', 'vertex-shader', 'fragment-shader');
    };

    init();
    $scope.render();
  });
}]);

