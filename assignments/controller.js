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
    template: 
"<span ng-bind-html='range.label'></span>: " + 
"<input type='number' ng-model='range.value' min='{{range.min}}' max='{{range.max}}' /><br/>" +
"{{range.min}}" +
"<input type='range' ng-model='range.value' range-parser min='{{range.min}}' step='{{range.step}}' max='{{range.max}}' />" +
"{{range.max}}", 
    scope: { range: '=' }
  }
});

twistedTessellation.controller('TwistedTessellationController', ['$scope', function($scope){

  var tessellator;

  $scope.sliders = {
    polyVertices: {label: 'Polygon Vertices',   min: 3,     max: 10,    step: 1,      value: 3}, 
    subdivisions: {label: 'Subdivisions',       min: 0,     max: 10,    step: 1,      value: 0}, 
    rotation:     {label: 'Rotation (&Theta;)', min: 0,     max: 360,   step: 1,      value: 0}, 
    constant:     {label: 'Constant (d)',       min: 0.001, max: 0.05,  step: 0.001,  value: 0.001}
  };

  $scope.totalRenderings = 0;
  $scope.totalTriangles = 0;
  $scope.totalLines = 0;

  var getInputs = function(){
      var inputs = {};
      Object.keys($scope.sliders).forEach(function(sliderName){
        inputs[sliderName] = $scope.sliders[sliderName].value;
      });
      return inputs;
  }

  var updateDisplay = function(){
    if (tessellator){
      var inputs = getInputs();
      tessellator.render(inputs.polyVertices, inputs.subdivisions, inputs.rotation, inputs.constant);

      $scope.totalRenderings += 1;
      $scope.totalTriangles = Math.pow(4, inputs.subdivisions) * inputs.polyVertices;
      $scope.totalLines = $scope.totalTriangles * 3;
    }
  }

  $scope.$watch(getInputs, function(newVal, oldVal){
    updateDisplay();
  }, true);

  angular.element(document).ready(function(){
    tessellator = new Tessellator('gl-canvas', 'vertex-shader', 'fragment-shader');
    updateDisplay();
  });

}]);

