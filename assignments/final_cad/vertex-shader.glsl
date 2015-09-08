attribute vec4 vPosition;
attribute vec4 vNormal;

uniform mat4 modelViewMatrix, projectionMatrix;
uniform vec4 lightPosition;

varying vec3 N, L, E;

void main()
{
  vec3 pos = (modelViewMatrix * vPosition).xyz;
  vec3 light = lightPosition.xyz;

  L = normalize(light - pos); 
  E = -normalize(pos);
  N = normalize((modelViewMatrix*vNormal).xyz);

  gl_Position = projectionMatrix * modelViewMatrix * vPosition;
}

