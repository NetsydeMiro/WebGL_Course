function Color(color, render){
  this.red = color && color.red || 0;
  this.green = color && color.green || 0;
  this.blue = color && color.blue || 0;
  this.render = render !== undefined ? render : true;
}

Object.defineProperty(Color.prototype, 'colorString', {
  get: function(){
    return '#' + 
      [this.red, this.green, this.blue].
      map(function(dec){ return ('00' + dec.toString(16)).slice(-2); }).
      join('');
  },
  set: function(val){
    this.red   = parseInt(val.substr(1,2), 16);
    this.green = parseInt(val.substr(3,2), 16);
    this.blue  = parseInt(val.substr(5,2), 16);
  }
});

Object.defineProperty(Color.prototype, 'colorVector', {
  get: function(){
    var vec3 = [this.red, this.green, this.blue].
      map(function(dec){return dec / 255});

    // add opaque alpha
    return vec3.concat(1.0);
  },
  set: function(val){
    this.red   = Math.round(val[0] * 255);
    this.green = Math.round(val[1] * 255);
    this.blue  = Math.round(val[2] * 255);
  }
});

