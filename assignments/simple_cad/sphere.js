"use strict";

function Sphere(position, scale, rotation, color){
  Shape.call(this, position, scale, rotation, color);
}

Sphere.prototype = new Shape();

Sphere.getBuffer(){
}


Sphere.getModel(){

}


