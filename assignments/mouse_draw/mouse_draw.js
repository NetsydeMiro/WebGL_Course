"use strict";

var canvas;
var gl;

var maxNumVertices  = 20000;
var index = 0;

var cindex = 0;

var brushStroke = 0.01;

var colors = [

vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
  vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
  vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
  vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
  vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
  vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
  vec4( 0.0, 1.0, 1.0, 1.0)   // cyan
];
var t;
var numPolygons = 0;
var numIndices = [];
numIndices[0] = 0;
var start = [0];
var penDown = false;

window.onload = function init() {
  canvas = document.getElementById( "gl-canvas" );

  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  var m = document.getElementById("mymenu");

  m.addEventListener("click", function() {
    cindex = m.selectedIndex;
  });

  canvas.addEventListener("mousedown", function(event){
    penDown = true;
  });

  canvas.addEventListener("mouseup", function(event){
    if (penDown)
    {
      penDown = false;
      priorPos = null;
      numPolygons++;
      numIndices[numPolygons] = 0;
      start[numPolygons] = index;
    }
  });

  canvas.addEventListener("mouseout", function(event){
    if (penDown)
    {
      penDown = false;
      priorPos = null;
      numPolygons++;
      numIndices[numPolygons] = 0;
      start[numPolygons] = index;
    }
  });

  var pos, priorPos;

  canvas.addEventListener("mousemove", function(event){
    if (penDown){

      pos = vec2(2*event.clientX/canvas.width-1,
          2*(canvas.height-event.clientY)/canvas.height-1);

      if (!priorPos){
        bufferPoint(pos);
        priorPos = pos;
      }
      else
      {
        var dx = pos[0] - priorPos[0];
        var dy = pos[1] - priorPos[1];

          var mag = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

          dx = dx / mag;
          dy = dy / mag;

          var point1 = vec2(pos[0] + dy * brushStroke, pos[1] - dx * brushStroke);
          var point2 = vec2(pos[0] - dy * brushStroke, pos[1] + dx * brushStroke);

          bufferPoint(point1);
          bufferPoint(point2);

          console.log(point1, point2, mag);

          priorPos = pos;
          render();

      }

    }
  } );

  function bufferPoint(pos){
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(pos));

    t = vec4(colors[cindex]);

    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
    gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(t));

    numIndices[numPolygons]++;
    index++;
  }

  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
  gl.clear( gl.COLOR_BUFFER_BIT );


  //
  //  Load shaders and initialize attribute buffers
  //
  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  var bufferId = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
  gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW );
  var vPos = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPos, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPos );

  var cBufferId = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
  gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );
  var vColor = gl.getAttribLocation( program, "vColor" );
  gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vColor );
}

function render() {

  gl.clear( gl.COLOR_BUFFER_BIT );

  for(var i=0; i<=numPolygons; i++) {
    gl.drawArrays( gl.TRIANGLE_STRIP, start[i], numIndices[i] );
  }
}
