"use strict";

var controls = [
  {label: 'Scale X', min: 0, max: 10, value: 5}, 
  {label: 'Scale Y', min: 0, max: 10, value: 5}, 
  {label: 'Scale Z', min: 0, max: 10, value: 5}
];


$(function(){
  var views = rivets.bind($('.controls'), {controls: controls});

  /*
  $('#menu > li > ul').menu()
  .hide()
  .mouseleave(function(){
    $(this).slideUp(); // hide();
  });

  $('#menu > li').mouseenter(function(){
    $(this).find('ul').slideDown();
  });
  */

  $('#menu').menu({
    position: {my: 'left top', at: 'left bottom'}
  });

});


var application = new Application();

