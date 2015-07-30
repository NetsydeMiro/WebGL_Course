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

  var init, diagram, renderer;

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
      diagram.shapes[0].position = {x: newVal.positionX, y: newVal.positionY};
      diagram.shapes[0].scale = {x: newVal.scaleX, y: newVal.scaleY, z: newVal.scaleZ};
      diagram.shapes[0].rotation = {x: newVal.rotationX, y: newVal.rotationY, z: newVal.rotationZ};
      diagram.shapes[0].color = {
        facets: parseColorString(newVal.shape), 
        mesh: parseColorString(newVal.mesh)
      };

      diagram.color = parseColorString(newVal.background);

      renderer.render();
    }
  }, true);

  angular.element(document).ready(function(){

    init = function(){

      Shape.registerShapes();

      diagram = new Diagram({red: 255, green: 255, blue: 255});
      var sphere = new Sphere(
        {x: 0, y:0}, 
        {x: 1, y:1, z:1}, 
        {x: 0, y:0, z:0}, 
        {facets: {red: 255, green: 0, blue: 0}, mesh: {red:0, green:0, blue:0}});

      diagram.add(sphere);
      renderer = new Renderer('gl-canvas', 'vertex-shader', 'fragment-shader', diagram);
    };

    init();
    renderer.render();
  });
}]);

