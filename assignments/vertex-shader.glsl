attribute vec4 vPosition;
uniform float rotation;
uniform float constant;

void main()
{
  gl_Position = vPosition;

  float distanceFromOrigin = sqrt(pow(vPosition.x,2.0) + pow(vPosition.y,2.0));
  float rotationPrime = rotation * distanceFromOrigin * constant;
  gl_Position.x = vPosition.x * cos(rotationPrime) - vPosition.y * sin(rotationPrime);
  gl_Position.y = vPosition.x * sin(rotationPrime) + vPosition.y * cos(rotationPrime);
}

