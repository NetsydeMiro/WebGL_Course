precision mediump float;

uniform vec4 ambientProduct, diffuseProduct, specularProduct;
uniform float shininess;

varying vec3 N, L, E;

void main()
{
  vec4 fColor, specular;

  vec4 ambient = ambientProduct;

  float Kd = max(dot(L, N), 0.0);
  vec4 diffuse = Kd*diffuseProduct; 

  if (dot(L, N) >= 0.0)
  {
    vec3 H = normalize(L + E);
    float Ks = pow(max(dot(N, H), 0.0), shininess);
    specular = Ks * specularProduct; 
  }
  else
  {
    specular = vec4(0.0, 0.0, 0.0, 1.0);
  }

  fColor = ambient + diffuse + specular;
  fColor.a = 1.0;

  gl_FragColor = fColor;
}

