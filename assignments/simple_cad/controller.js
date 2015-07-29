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
      numTimesToSubdivide = newVal.subdivisions;
      position = {x: newVal.positionX, y: newVal.positionY};
      scale = {x: newVal.scaleX, y: newVal.scaleY, z: newVal.scaleZ};
      rotation = {x: newVal.rotationX, y: newVal.rotationY, z: newVal.rotationZ};
      color = {
        background: parseColorString(newVal.background), 
        shape: parseColorString(newVal.shape), 
        mesh: parseColorString(newVal.mesh)
      };

      renderer.render();
    }
  }, true);

  angular.element(document).ready(function(){

    init = function(){

      var diagram = new Diagram({red: 255, green: 255, blue: 255});
      renderer = new Renderer('gl-canvas', 'vertex-shader', 'fragment-shader', diagram);
    };

    init();
    renderer.render();
  });
}]);

