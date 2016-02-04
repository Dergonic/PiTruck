var express = require('express');
var app = express();
var http = require('http').Server(app);
//var    path = require('path');
//var    async = require('async');
var gpio = require('onoff').Gpio;
var io = require('socket.io')(http);
var pca = require('./libs/adafruit-pca9685');


http.listen(3000,function(){
    console.log('listening to port 3000');
});

app.use(express.static('static'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/static/index.html');
});




var led1 = new gpio(14, 'out');
var led2 = new gpio(16, 'out');
var led3 = new gpio(20, 'out');
var led4 = new gpio(21, 'out');
var pwm_defaults = {
  "freq":"50", // frequency of the device
  "correctionFactor": 1.118, // correction factor - fine tune the frequency 
  "address": "0x40", // i2c bus address
  "device": '/dev/i2c-1', // device name
  // "debug": <null> // adds some debugging methods if set 
};
var pwm = pca(pwm_defaults);

setServoPulse = function(channel, pulse){
  var pulseLength;
  pulseLength = 1000000;
  pulseLength /= 60;
  //print("%d us per period" % pulseLength);
  pulseLength /= 4096;
  //print("%d us per bit" % pulseLength);
  pulse *= 1000;
  pulse /= pulseLength;
  return pwm.setPWM(channel, 0, pulse);
}

//var button = new gpio(0, 'in', 'both');

//listen for socket connection
io.on('connection', function(socket) {
  //listen for move signal
  socket.on('setled1', function(direction) {
    switch(direction){
     case 'on':
        led1.write(1);
        console.log('send keep led on');
        break;
      case 'off':
        led1.write(0);
        console.log('send keep led off');
        break;
    }
  });
  socket.on('setled2', function(direction) {
    switch(direction){
     case 'on':
        led2.write(1);
        console.log('send temp led on');
        break;
      case 'off':
        led2.write(0);
        console.log('send temp led off');
        break;
    }
  });
});




function exit(){
    console.log('Unloading gpio ...');
    led1.unexport();
    led2.unexport();
    led3.unexport();
    led4.unexport();
    
    console.log('Exiting ...');
    process.exit(0);
}
process.on('SIGINT', exit);
