$(function () {
  var socket = io.connect(),
    ui = {
      teston: $('.btn_test_1'),
      testoff:$('.btn_test_2')
    },
    activeClass = 'is-active',
    isPressed = false;

  //listen for key presses
  $(document).keydown(function(e){
    //don't do anything if there's already a key pressed
    if(isPressed) return;

    isPressed = true;
    switch(e.which){
      case 65:
        socket.emit('setled', 'on');
        ui.teston.addClass(activeClass);
        break;
      case 66:
        socket.emit('setled', 'off');
        ui.down.addClass(activeClass);
        break;
    }
  });
  
  //stop all motors when any key is released
  $(document).keyup(function(e){
    ui.all.removeClass(activeClass);
    isPressed = false;
  });
});
