function Positionable(position, velocity, bounds){
  this.position = position || {x: 0, y: 0, z:0};
  this.velocity = velocity || {x: 0, y: 0, z:0};
  this.bounds = bounds || {x: {min: -1, max: 1}, y: {min: -1, max: 1}, z: {min: -1,max: 1}};
}

Positionable.prototype.updatePosition = function(){
  ['x', 'y', 'z'].forEach(function(dir){
    this.position[dir] += this.velocity[dir];

    if (this.position[dir] > this.bounds[dir].max){
      this.position[dir] = this.bounds[dir].max - (this.position[dir] - this.bounds[dir].max);
      this.velocity[dir] *= -1;
    }
    else if (this.position[dir] < this.bounds[dir].min){
      this.position[dir] = this.bounds[dir].min + (this.bounds[dir].min - this.position[dir]);
      this.velocity[dir] *= -1;
    }
  }, this);
};

Positionable.prototype.isInMotion = function(){
  return Object.keys(this.velocity).some(function(dir){ return this.velocity[dir] != 0; }, this);
};
