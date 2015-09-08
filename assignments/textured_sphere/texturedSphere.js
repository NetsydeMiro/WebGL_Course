"use strict";

var canvas;
var program;
var gl;

var numVertices = 0;

var texSize = 64;

// Create a checkerboard pattern using floats


var image1 = new Array()
  for (var i =0; i<texSize; i++)  image1[i] = new Array();
  for (var i =0; i<texSize; i++)
  for ( var j = 0; j < texSize; j++)
  image1[i][j] = new Float32Array(4);
  for (var i =0; i<texSize; i++) for (var j=0; j<texSize; j++) {
    var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
    image1[i][j] = [c, c, c, 1];
  }

// Convert floats to ubytes for texture

var checkerImage = new Uint8Array(4*texSize*texSize);


for ( var i = 0; i < texSize; i++ )
for ( var j = 0; j < texSize; j++ )
for(var k =0; k<4; k++)
checkerImage[4*texSize*i+4*j+k] = 255*image1[i][j][k];

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var texCoord = [
  vec2(0, 0),
  vec2(0, 1),
  vec2(1, 1),
  vec2(1, 0)
];


  var vertices = [
vec4( -0.5, -0.5,  0.5, 1.0 ),
  vec4( -0.5,  0.5,  0.5, 1.0 ),
  vec4( 0.5,  0.5,  0.5, 1.0 ),
  vec4( 0.5, -0.5,  0.5, 1.0 ),
  vec4( -0.5, -0.5, -0.5, 1.0 ),
  vec4( -0.5,  0.5, -0.5, 1.0 ),
  vec4( 0.5,  0.5, -0.5, 1.0 ),
  vec4( 0.5, -0.5, -0.5, 1.0 )
  ];


  var vertexColors = [
vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
  vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
  vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
  vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
  vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
  vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
  vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
  vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
  ];
  window.onload = init;


  var xAxis = 0;
  var yAxis = 1;
  var zAxis = 2;
  var axis = xAxis;

  var theta = [45.0, 45.0, 45.0];

  var thetaLoc;

  function configureCheckerTexture() {
    var texture = gl.createTexture();
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, checkerImage);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
  }

  function configureWorldTexture() {
      var texture = gl.createTexture();
      gl.bindTexture( gl.TEXTURE_2D, texture );
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
           gl.RGB, gl.UNSIGNED_BYTE, worldImage );
      gl.generateMipmap( gl.TEXTURE_2D );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                        gl.NEAREST_MIPMAP_LINEAR );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

      gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
  }

function quad(a, b, c, d) {

  pointsArray.push(vertices[a]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[0]);

  pointsArray.push(vertices[b]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[1]);

  pointsArray.push(vertices[c]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[2]);

  pointsArray.push(vertices[a]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[0]);

  pointsArray.push(vertices[c]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[2]);

  pointsArray.push(vertices[d]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[3]);
}


function colorCube()
{
  quad( 1, 0, 3, 2 );
  quad( 2, 3, 7, 6 );
  quad( 3, 0, 4, 7 );
  quad( 6, 5, 1, 2 );
  quad( 4, 5, 6, 7 );
  quad( 5, 4, 0, 1 );
}

function toTextureCoords(cartesianPoint)
{
  var x = cartesianPoint[0], y = cartesianPoint[1], z = cartesianPoint[2];
  var theta = Math.atan2(y,x);
  var phi = Math.acos(z);
  // return [theta, phi].map(function(angle){ return (angle + Math.PI) / (2 * Math.PI); });
  // return [theta, phi]; //.map(function(angle){ return angle /  Math.PI; });
  // return [theta, phi];
  return [ 1 - (theta + Math.PI) / (2 * Math.PI), phi / Math.PI ];
}

function triangle(a, b, c) {
  pointsArray.push(a, b, c);
  colorsArray.push([1,1,1,1],[1,1,1,1],[1,1,1,1]);

  [a,b,c].forEach(function(coord){
    texCoordsArray.push(toTextureCoords(coord));
  });

  numVertices += 3;
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


function init() {
  canvas = document.getElementById( "gl-canvas" );

  var worldImage = document.getElementById('worldImage');

  document.getElementById('selectImage').onchange = function(){
    switch (this.value){
      case 'checker': 
        configureCheckerTexture();
        break;
      case 'world': 
        configureWorldTexture();
        break;
    }
  };

  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor( 0.8275, 0.8275, 0.8275, 1.0 );

  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  // colorCube();


  var va = vec4(0.0, 0.0, -1.0, 1);
  var vb = vec4(0.0, 0.942809, 0.333333, 1);
  var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
  var vd = vec4(0.816497, -0.471405, 0.333333, 1);

  tetrahedron(va, vb, vc, vd, 6);

  var cBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
  var vColor = gl.getAttribLocation( program, "vColor" );
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
  var vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  var tBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
  var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
  gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vTexCoord);

  configureCheckerTexture();

  thetaLoc = gl.getUniformLocation(program, "theta");

  document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
  document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
  document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};

  render();
}

var render = function() {
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  theta[axis] += 0.5;
  gl.uniform3fv(thetaLoc, theta);
  gl.drawArrays( gl.TRIANGLES, 0, numVertices );
  requestAnimFrame(render);
}
