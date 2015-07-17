"use strict";

var twistedTessellation = angular.module('twistedTessellation', ['ngSanitize']);

twistedTessellation.directive('rangeParser', function() {
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

twistedTessellation.directive('rangeSelector', function() {
  return {
    templateUrl: 'range-selector.html', 
    scope: { range: '=' }
  }
});

twistedTessellation.controller('TwistedTessellationController', ['$scope', function($scope){

  var renderer;

  $scope.sliders = {
    polyVertices: {label: 'Polygon Vertices',   min: 3,     max: 10,    step: 1,      value: 3}, 
    subdivisions: {label: 'Subdivisions',       min: 0,     max: 10,    step: 1,      value: 0}, 
    rotation:     {label: 'Rotation (&Theta;)', min: 0,     max: 360,   step: 1,      value: 0}, 
    constant:     {label: 'Constant (d)',       min: 0.001, max: 0.05,  step: 0.001,  value: 0.001}
  };

  $scope.checkboxes = {
    makeStar: {label: 'Make Polystar', value: false}
  };

  $scope.totalRenderings = 0;
  $scope.totalTriangles = 0;
  $scope.totalLines = 0;

  var getInputs = function(){
      var inputs = {};
      Object.keys($scope.sliders).forEach(function(name){
        inputs[name] = $scope.sliders[name].value;
      });
      Object.keys($scope.checkboxes).forEach(function(name){
        inputs[name] = $scope.checkboxes[name].value;
      });
      return inputs;
  }

  var updateDisplay = function(){
    if (renderer){
      var inputs = getInputs();
      var triangleAttributes = Tessellator.getTriangleBuffers(inputs.polyVertices, inputs.subdivisions, inputs.rotation, inputs.constant, inputs.makeStar);
      renderer.render(triangleAttributes.vertices, triangleAttributes.edges);

      $scope.totalRenderings += 1;
      $scope.totalTriangles = Math.pow(4, inputs.subdivisions) * inputs.polyVertices;
      $scope.totalLines = $scope.totalTriangles * 3;
    }
  }

  $scope.$watch(getInputs, function(newVal, oldVal){
    updateDisplay();
  }, true);

  angular.element(document).ready(function(){
    renderer = new Renderer('gl-canvas', 'vertex-shader.glsl', 'fragment-shader.glsl');
    updateDisplay();
  });

}]);

