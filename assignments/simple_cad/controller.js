"use strict";

var simpleCad = angular.module('simpleCad', ['ngSanitize']);

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

  $scope.availableShapeNames = ['Select Shape'].concat(Object.keys(Shape.registerShapes()));

  $scope.newShape = 'Select Shape';

  $scope.currentShape = 0;
  $scope.renderedShapes = [0];

  $scope.addShape = function(){
    if ($scope.newShape != 'Select Shape')
    {
      $scope.diagram.add(new Shape.availableShapes[this.newShape]());
      $scope.currentShape = $scope.diagram.shapes.length - 1;
      $scope.newShape = 'Select Shape';
      $scope.renderedShapes.push($scope.currentShape);
    }
  };

  $scope.colorPickers = {
    background: {label: 'Background', value: '#ffffff'}, 
    shape:      {label: 'Shape', value: '#ff0000'}, 
    mesh:       {label: 'Mesh', value: '#000000'}
  };

  $scope.sliders = {
    positionX:    {label: 'Position X',   min: -1, max: 1, step: 0.01,  value: 0}, 
    positionY:    {label: 'Position Y',   min: -1, max: 1, step: 0.01,  value: 0}, 
    scaleX:       {label: 'Scale X',      min: -1, max: 1, step: 0.01,  value: 1}, 
    scaleY:       {label: 'Scale Y',      min: -1, max: 1, step: 0.01,  value: 1}, 
    scaleZ:       {label: 'Scale Z',      min: -1, max: 1, step: 0.01,  value: 1}, 
    rotationX:      {label: 'Rotation X', min: 0, max: 360,  step: 1,     value: 0}, 
    rotationY:      {label: 'Rotation Y', min: 0, max: 360,  step: 1,     value: 0}, 
    rotationZ:      {label: 'Rotation Z', min: 0, max: 360,  step: 1,     value: 0}
  };

  var parseColorString = function(colorString){
    return {
      red: parseInt(colorString.substr(1,2), 16), 
      green: parseInt(colorString.substr(3,2), 16), 
      blue: parseInt(colorString.substr(5,2), 16)
    };
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

  $scope.$watch(getInputs, function(newVal, oldVal){
    if (init)
    {
      $scope.diagram.shapes[$scope.currentShape].position = {x: newVal.positionX, y: newVal.positionY};
      $scope.diagram.shapes[$scope.currentShape].scale = {x: newVal.scaleX, y: newVal.scaleY, z: newVal.scaleZ};
      $scope.diagram.shapes[$scope.currentShape].rotation = {x: newVal.rotationX, y: newVal.rotationY, z: newVal.rotationZ};
      $scope.diagram.shapes[$scope.currentShape].color = {
        facets: parseColorString(newVal.shape), 
        mesh: parseColorString(newVal.mesh)
      };

      $scope.diagram.color = parseColorString(newVal.background);

      renderer.render();
    }
  }, true);

  angular.element(document).ready(function(){

    init = function(){

      $scope.diagram = new Diagram({red: 255, green: 255, blue: 255});
      $scope.diagram.add(new Sphere());

      renderer = new Renderer('gl-canvas', 'vertex-shader', 'fragment-shader', $scope.diagram);
    };

    init();
    renderer.render();
  });
}]);

