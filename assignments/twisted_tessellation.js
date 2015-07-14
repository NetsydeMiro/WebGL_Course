"use strict";

var canvas, gl, bufferId;
var points = [];
var lines = [];
var maxSubdivisions = 10;
var maxRotation = 360;
var maxConstant = 0.05 
var minConstant = 0.001
var stepConstant = 0.001
var fColor;

var twistedTessellation = angular.module('twistedTessellation', [])
.filter('html', function($sce){
  return function(input){
    return $sce.trustAsHtml(input);
  };
});

twistedTessellation.controller('TwistedTessellationController', ['$scope', function($scope){

  $scope.sliders = {
    subdivisions: {label: 'Subdivisions',       min: 0,     max: 10,    step: 1,      value: 0}, 
    rotation:     {label: 'Rotation (&Theta;)', min: 0,     max: 360,   step: 1,      value: 0}, 
    constant:     {label: 'Constant (d)',       min: 0.001, max: 0.05,  step: 0.001,  value: 0.001}
  };

}])
// https://github.com/angular/angular.js/issues/9269
// http://plnkr.co/edit/uKmIKWG1FHh1Ai0e8jet?p=preview
.directive('rangeParser', function() {
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


function init()
{
  canvas = document.getElementById( "gl-canvas" );

  canvas.width = canvas.scrollWidth;
  canvas.height = canvas.scrollWidth;

  // TODO: use a mvc framework to track variable states, and 
  // use inputs so that manual numbers can be entered (rather than just spans to display them)
  document.getElementById( "inSubdivisions" ).max = 
    document.getElementById( "maxSubdivisions" ).innerHTML = 
    maxSubdivisions;

  document.getElementById( "inRotation" ).max = 
    document.getElementById( "maxRotation" ).innerHTML = 
    maxRotation;

  document.getElementById( "inConstant" ).max = 
    document.getElementById( "maxConstant" ).innerHTML = 
    maxConstant;

  document.getElementById( "inConstant" ).min = 
    document.getElementById( "minConstant" ).innerHTML = 
    minConstant;

  document.getElementById( "inConstant" ).step = stepConstant;

  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  //
  //  Initialize our data for the Sierpinski Gasket
  //

  // First, initialize the corners of our gasket with three points.


  //
  //  Configure WebGL
  //
  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

  //  Load shaders and initialize attribute buffers

  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  // Load the data into the GPU

  bufferId = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
  gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(4, maxSubdivisions + 1), gl.STATIC_DRAW );



  // Associate out shader variables with our data buffer

  var vPosition = gl.getAttribLocation( program, "vPosition" );
  fColor = gl.getUniformLocation( program, "fColor" );
  gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
  gl.vertexAttribPointer( fColor, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  document.getElementById("inSubdivisions").onchange = 
    document.getElementById("inRotation").onchange = 
    document.getElementById("inConstant").onchange = 
    function() {
      var inputs = getInputs();
      updateReadouts(inputs);
      render(inputs);
    };


  updateReadouts(getInputs());
  render({subdivisions: 0, rotation: 0, constant: 0.05});
};

function getInputs(){
  return {
    subdivisions: document.getElementById("inSubdivisions").value, 
      rotation: document.getElementById("inRotation").value, 
      constant: document.getElementById("inConstant").value
  };
}

function updateReadouts(inputs)
{
  document.getElementById("outSubdivisions").innerHTML = inputs.subdivisions;
  document.getElementById("outRotation").innerHTML = inputs.rotation;
  document.getElementById("outConstant").innerHTML = inputs.constant;
  document.getElementById("outTriangles").innerHTML = Math.pow(4, inputs.subdivisions);
}

function triangle( a, b, c )
{
  points.push( a, b, c );
  lines.push( a, b, b, c, c, a );
}

function divideTriangle( a, b, c, count, theta, constant )
{

  // check for end of recursion

  if ( count == 0 ) {

    var transformed_points = [a,b,c].map(function(point){
      var x = point[0]; var y = point[1];
      var d = Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 0.5);

      var theta_prime = theta * d * constant;

      var x_prime = x * Math.cos(theta_prime) - y * Math.sin(theta_prime);
      var y_prime = x * Math.sin(theta_prime) + y * Math.cos(theta_prime);

      return [x_prime, y_prime]; 
    });

    triangle( transformed_points[0], transformed_points[1], transformed_points[2] );
  }
  else {

    //bisect the sides

    var ab = mix( a, b, 0.5 );
    var ac = mix( a, c, 0.5 );
    var bc = mix( b, c, 0.5 );

    --count;

    // four new triangles

    divideTriangle( a, ab, ac, count, theta, constant );
    divideTriangle( c, ac, bc, count, theta, constant );
    divideTriangle( b, bc, ab, count, theta, constant );
    divideTriangle( ab, ac, bc, count, theta, constant );
  }
}

window.onload = init;

function render(inputs)
{
  var vertices = [
    [ -1, -1 ],
    [  0,  1 ],
    [  1, -1 ]
      ];
  points = []; lines = [];
  divideTriangle( vertices[0], vertices[1], vertices[2],
      inputs.subdivisions, inputs.rotation, inputs.constant);

  gl.clear( gl.COLOR_BUFFER_BIT );
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));

  gl.uniform4f(fColor, 1, 0, 0, 1);
  gl.drawArrays( gl.TRIANGLES, 0, points.length );

  // TODO: figure out how to do this more efficiently.
  // likely best bet would be to construct another buffer and pass it to gl object
  // to use with line strip/loop in one pass
  gl.uniform4f(fColor, 0, 0, 0, 1);
  /*
  for(var ix = 0; ix < points.length; ix += 3)
  {
    gl.drawArrays( gl.LINE_LOOP, ix, 3 );
  }
  */
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(lines));
  gl.drawArrays( gl.LINES, 0, lines.length );

  // TODO: time function and compare with gpu sin/cos processing
  points = [];
  //requestAnimFrame(render);
}
