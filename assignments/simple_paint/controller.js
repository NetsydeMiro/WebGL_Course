"use strict";

var canvas;
var simplePaint;

function fullScreen(element){
  element.width = window.innerWidth;
  element.height = window.innerHeight;
}

window.onload = function(){

  canvas = document.getElementById("gl-canvas");

  fullScreen(canvas);

  window.onresize = function(){
    fullScreen(canvas);
    simplePaint.render();
  };

  simplePaint = new SimplePaint("gl-canvas", {red: 204, green: 204, blue: 204});

  document.getElementById('width-picker').onchange = function(){
    simplePaint.setBrush(this.value);
  };

  document.getElementById('color-picker').onchange = function(){
    simplePaint.setPaint({
      red: parseInt(this.value.substr(1,2), 16),
      green: parseInt(this.value.substr(3,2), 16),
      blue: parseInt(this.value.substr(5,2), 16)
    });
  };

  simplePaint.setPaint({red:0, green:0, blue:0});
  simplePaint.setBrush(0.001);

  simplePaint.render();
};

