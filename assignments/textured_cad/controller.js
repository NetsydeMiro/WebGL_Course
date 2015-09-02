"use strict";

var controls = [
  {label: 'Scale X', min: 0, max: 10, value: 5}, 
  {label: 'Scale Y', min: 0, max: 10, value: 5}, 
  {label: 'Scale Z', min: 0, max: 10, value: 5}
];


$(function(){
  var views = rivets.bind($('.controls'), {controls: controls});
});


