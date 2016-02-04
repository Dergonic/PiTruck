$(function () {
  var socket = io.connect();
  var activeClass = 'active';

  //listen for key presses
  $(document).keydown(function(e){
    switch(e.which){
      case 65:
        socket.emit('setled1', 'on');
        $('#BtnA').addClass(activeClass);
        break;
      case 90:
        socket.emit('setled1', 'off');
        $('#BtnZ').addClass(activeClass);
        break;
      case 69:
	socket.emit('setled2', 'on');
	$('#BtnE').addClass(activeClass);
	break;
      case 81:
        socket.emit('setservo', 'min');
        $('#ServoQ').addClass(activeClass);
        break;
      case 68:
        socket.emit('setservo', 'max');
        $('#ServoD').addClass(activeClass);
        break;
    }
  });
  
  $(document).keyup(function(e){
    $('.btn').removeClass(activeClass);

    switch(e.which){
	case 69:
	  socket.emit('setled2', 'off');
	  break;
	case 81:
	case 68:
	  socket.emit('setservo', 'half');
	  break
    }
  });
});
