attribute vec4 vPosition;

uniform mat4 affineMatrix;

void
main()
{
  gl_Position = affineMatrix * vPosition;
}

