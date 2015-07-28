"use strict";

var canvas;
var gl;

var numTimesToSubdivide = 3;

var index = 0;

var pointsArray = [];

var near = -10;
var far = 10;
var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;

var modelViewMatrix, projectionMatrix, color;
var modelViewMatrixLoc, projectionMatrixLoc, colorLoc;
var eye;

var position = {x: 0, y: 0};
var scale = {x: 1, y: 1, z: 1};
var rotation = {x: 0, y:0, z:0};

var init;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

function triangle(a, b, c) {
  pointsArray.push(a);
  pointsArray.push(b);
  pointsArray.push(c);
  index += 3;
}


function divideTriangle(a, b, c, count) {
  if ( count > 0 ) {

    var ab = normalize(mix( a, b, 0.5), true);
    var ac = normalize(mix( a, c, 0.5), true);
    var bc = normalize(mix( b, c, 0.5), true);

    divideTriangle( a, ab, ac, count - 1 );
    divideTriangle( ab, b, bc, count - 1 );
    divideTriangle( bc, c, ac, count - 1 );
    divideTriangle( ab, bc, ac, count - 1 );
  }
  else { // draw tetrahedron at end of recursion
    triangle( a, b, c );
  }
}

function tetrahedron(a, b, c, d, n) {
  divideTriangle(a, b, c, n);
  divideTriangle(d, c, b, n);
  divideTriangle(a, d, b, n);
  divideTriangle(a, c, d, n);
}

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

  $scope.colorPickers = {
    background: {label: 'Background', red: 255, green: 255, blue: 255}, 
    shape:      {label: 'Shape', red: 255, green: 0, blue: 0}, 
    mesh:       {label: 'Mesh', red: 0, green: 0, blue: 0}
  };

  $scope.sliders = {
    subdivisions: {label: 'Subdivisions', min: 0, max: 6,  step: 1,     value: 3}, 
    positionX:    {label: 'Position X',   min: -1, max: 1, step: 0.01,  value: 0}, 
    positionY:    {label: 'Position Y',   min: -1, max: 1, step: 0.01,  value: 0}, 
    scaleX:       {label: 'Scale X',      min: -1, max: 1, step: 0.01,  value: 1}, 
    scaleY:       {label: 'Scale Y',      min: -1, max: 1, step: 0.01,  value: 1}, 
    scaleZ:       {label: 'Scale Z',      min: -1, max: 1, step: 0.01,  value: 1}, 
    rotationX:      {label: 'Rotation X', min: 0, max: 360,  step: 1,     value: 0}, 
    rotationY:      {label: 'Rotation Y', min: 0, max: 360,  step: 1,     value: 0}, 
    rotationZ:      {label: 'Rotation Z', min: 0, max: 360,  step: 1,     value: 0}
  };

  var getInputs = function(){
    var inputs = {};
    Object.keys($scope.sliders).forEach(function(name){
      inputs[name] = $scope.sliders[name].value;
    });
    return inputs;
  }

  $scope.$watch(getInputs, function(newVal, oldVal){
    if (init)
    {
      numTimesToSubdivide = newVal.subdivisions;
      position = {x: newVal.positionX, y: newVal.positionY};
      scale = {x: newVal.scaleX, y: newVal.scaleY, z: newVal.scaleZ};
      rotation = {x: newVal.rotationX, y: newVal.rotationY, z: newVal.rotationZ};

      if (newVal.subdivions != oldVal.subdivisions)
      {
        index = 0;
        pointsArray = [];
        init();
      }

      render();
    }
  }, true);

  angular.element(document).ready(function(){

    init = function(){
      canvas = document.getElementById( "gl-canvas" );

      gl = WebGLUtils.setupWebGL( canvas );
      if ( !gl ) { alert( "WebGL isn't available" ); }

      gl.viewport( 0, 0, canvas.width, canvas.height );
      gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.polygonOffset(1.0, 2.0);

      var program = initShaders( gl, "vertex-shader", "fragment-shader" );
      gl.useProgram( program );

      var va = vec4(0.0, 0.0, -1.0, 1);
      var vb = vec4(0.0, 0.942809, 0.333333, 1);
      var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
      var vd = vec4(0.816497, -0.471405, 0.333333, 1);

      tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

      var vBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
      gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

      var vPosition = gl.getAttribLocation( program, "vPosition");
      gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray( vPosition);

      modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
      projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
      colorLoc = gl.getUniformLocation( program, "color" );
    };

    init();
    render();
  });
}]);


function render() {

  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  eye = vec3(0,0,1);

  modelViewMatrix = lookAt(eye, at , up);

  projectionMatrix = scalem(scale.x,scale.y,scale.z);

  projectionMatrix = mult(scalem(scale.x, scale.y, scale.z), projectionMatrix);

  projectionMatrix = mult(rotate(rotation.x, [1,0,0]), projectionMatrix);
  projectionMatrix = mult(rotate(rotation.y, [0,1,0]), projectionMatrix);
  projectionMatrix = mult(rotate(rotation.z, [0,0,1]), projectionMatrix);

  projectionMatrix = mult(translate(position.x, position.y, 0), projectionMatrix);

  projectionMatrix = mult(ortho(left, right, bottom, ytop, near, far), projectionMatrix);

  gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
  gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );


  gl.uniform4f( colorLoc, 1,0,0,1);

  for( var i=0; i<index; i+=3)
    gl.drawArrays( gl.TRIANGLES, i, 3 );

  gl.uniform4f( colorLoc, 0,0,0,1);

  for( var i=0; i<index; i+=3)
    gl.drawArrays( gl.LINE_LOOP, i, 3 );


}
