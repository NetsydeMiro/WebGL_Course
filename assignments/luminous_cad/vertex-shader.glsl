attribute vec4 vPosition;
attribute vec4 vNormal;

uniform mat4 affineMatrix;

void
main()
{
  gl_Position = affineMatrix * vPosition;
}

