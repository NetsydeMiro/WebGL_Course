"use strict";

var canvas, gl, bufferId;
var points = [];
var maxSubdivisions = 10;
var maxRotation = 360;
var maxConstant = 0.05 
var minConstant = 0.001
var stepConstant = 0.001

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
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
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
}

function divideTriangle( a, b, c, count, theta, constant )
{

    // check for end of recursion

    if ( count == 0 ) {
      var points_prime = [];

      [a,b,c].forEach(function(point){
        var x = point[0]; var y = point[1];
        var d = Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 0.5);

        var theta_prime = theta * d * constant;

        var x_prime = x * Math.cos(theta_prime) - y * Math.sin(theta_prime);
        var y_prime = x * Math.sin(theta_prime) + y * Math.cos(theta_prime);
        points_prime.push(vec2(x_prime, y_prime));
      });

        
        triangle( points_prime[0], points_prime[1], points_prime[2] );
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
        vec2( -0.6, -0.6 ),
        vec2(  0,  0.6 ),
        vec2(  0.6, -0.6 )
    ];
    points = [];
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    inputs.subdivisions, inputs.rotation, inputs.constant);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear( gl.COLOR_BUFFER_BIT );
    // TODO: also render outlines of triangles
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    // TODO: time function and compare with gpu sin/cos processing
    points = [];
    //requestAnimFrame(render);
}
