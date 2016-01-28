var express = require('express'),
  http = require('http'),
  path = require('path'),
  async = require('async'),
  gpio = require('pi-gpio'),
  app = express();

//set the port
app.set('port', process.env.PORT || 3000);

//serve static files from /static directory
app.use(express.static(path.join(__dirname, '/static')));

//create the server
var http = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//init socket.io
var io = require('socket.io')(http);

//the actual tank code starts here
//----------------------------------

//create the tank object
var PiTruck = {

  //assign pin numbers to variables for later use
  leds: {
    test: 11,
  },

  //open the gpio pins and set them as outputs
  init: function(){
    gpio.open(this.leds.test, "output");
  },

  switchTestLed: function(value){
    if(value=="on")
      gpio.write(this.leds.test,1);
    else
      gpio.write(this.leds.test,0);
  }
};

//listen for socket connection
io.sockets.on('connection', function(socket) {
  //listen for move signal
  socket.on('setled', function(direction) {
    switch(direction){
     case 'on':
        PiTruck.switchTestLed("on");
        break;
      case 'off':
        PiTruck.switchTestLed("off");
        break;
    }
  });
});

PiTruck.init();
