"use strict";

var control = 
{label: 'Scale X', min: 0, max: 10, value: 5}; 

var controls = [
  {label: 'Scale X', min: 0, max: 10, value: 5}, 
  {label: 'Scale Y', min: 0, max: 10, value: 5}, 
  {label: 'Scale Z', min: 0, max: 10, value: 5}
];


$(function(){
  var views = rivets.bind($('#control, #readout'), {control: control});
  var views2 = rivets.bind($('#controls, #readouts'), {controls: controls});
});


