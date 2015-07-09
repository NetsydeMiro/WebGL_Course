"use strict";

var canvas, gl, bufferId;
var points = [];
var maxSubdivisions = 10;
var maxRotation = 360;
var maxConstant = 2
var minConstant = 0.01
var stepConstant = 0.01

function init()
{
    canvas = document.getElementById( "gl-canvas" );

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
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(3, maxSubdivisions + 1), gl.STATIC_DRAW );



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
    render({subdivisions: 0, rotation: 0});
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

function divideTriangle( a, b, c, count, theta, d )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

      debugger;
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count, theta, d );
        divideTriangle( c, ac, bc, count, theta, d );
        divideTriangle( b, bc, ab, count, theta, d );
    }
}

window.onload = init;

function render(inputs)
{
    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];
    points = [];
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    inputs.subdivisions, inputs.rotation, inputs.constant);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    points = [];
    //requestAnimFrame(render);
}
