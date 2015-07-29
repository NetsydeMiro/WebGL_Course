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

      canvas = document.getElementById( "gl-canvas" );

      gl = WebGLUtils.setupWebGL( canvas );
      if ( !gl ) { alert( "WebGL isn't available" ); }

      gl.viewport( 0, 0, canvas.width, canvas.height );
      //gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

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

  gl.clearColor(color.background[0], color.background[1], color.background[2], color.background[3]);
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


  gl.uniform4f( colorLoc, color.shape[0], color.shape[1], color.shape[2], color.shape[3]);

  for( var i=0; i<index; i+=3)
    gl.drawArrays( gl.TRIANGLES, i, 3 );

  gl.uniform4f( colorLoc, color.mesh[0], color.mesh[1], color.mesh[2], color.mesh[3]);

  for( var i=0; i<index; i+=3)
    gl.drawArrays( gl.LINE_LOOP, i, 3 );


}
