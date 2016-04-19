var express = require('express');
var app = express();

var server = require('http').Server(app);
var heartbeat={	'pingInterval':200,//ping each 200ms
				'pingTimeout' :200}// and espect a reply in the next 200 ms (otherwise, close)
var io = require('socket.io')(server,heartbeat);




var gpio = require('onoff').Gpio;

var pca = require('/home/pi/PiTruck/libs/adafruit-pca9685.js');

///////////////////////////////////////////////////
// Starting http server
///////////////////////////////////////////////////

server.listen(3000,function(){
	console.log('listening to port 3000');
});

app.use(express.static('static'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/static/index.html');
});


///////////////////////////////////////////////////
// Init GPIO and PWM
///////////////////////////////////////////////////
function Led(gpionbr, defaultvalue, label) {
	this.label = label;
	this.gpio = new gpio(gpionbr, 'out');
	this.value = defaultvalue;
	this.resetvalue = defaultvalue;
	this.gpio.write(this.value);
}
Led.prototype.set = function(onoff){
	this.value = onoff;
	this.gpio.write(this.value);
};
Led.prototype.get = function(){
	return this.value;
};
Led.prototype.toggle = function(){
	if(this.value == 1)
		this.value=0;
	else
		this.value=1;
	this.gpio.write(this.value);
};
Led.prototype.close = function(){
	this.value = this.resetvalue;
	this.gpio.write(this.value);
	this.gpio.unexport();
};

var led = {};
led['frein'] = new Led(27, 0, 'Frein');
led['gdfeu'] = new Led(22, 0, 'Grands feux');
led['crois'] = new Led(5 , 1, 'Feux de croisement');
led['arrie'] = new Led(13, 0, 'Feu de recul');
led['clidr'] = new Led(19, 0, 'Clignotant droit');
led['cliga'] = new Led(26, 0, 'clignotant gauche');


var pwm_defaults = {
	"freq":50, // frequency of the device
	"correctionFactor": 1.118, // correction factor - fine tune the frequency 
	"address": "0x40", // i2c bus address
	"device": '/dev/i2c-1' // device name
	// "debug": <null> // adds some debugging methods if set 
};
var pwm = pca(pwm_defaults);
/////////////////////////////////////////////////// 
// function - setServoPulse 
/////////////////////////////////////////////////// 
// channel : channel of the servo on the pca 
// 		from 0 to 15 
// pulse : pulse length to determine servo orientation 
// 		value is depending servo model 
// 		common value from 1000 to 2000 
///////////////////////////////////////////////////

setServoPulse = function(channel, pulse){
	try{
		var pulseLength;
		pulseLength = 1000000;
		pulseLength /= 60;
		//print("%d us per period" % pulseLength);
		pulseLength /= 4096;
		//print("%d us per bit" % pulseLength);
		pulse *= 1000;
		pulse /= pulseLength;
		return pwm.setPWM(channel, 0, pulse);
	}catch(e){console.log('ERROR'+e);}
}

function Servo(Channel, min, max, defaultvalue){
	this.channel = Channel;
	this.min = min;
	this.max = max;
	this.resetvalue = defaultvalue;
	this.value = defaultvalue;
	pwm.setPulse(this.channel, this.value)
}
Servo.prototype.set = function(value){
	this.value = value;
	pwm.setPulse(this.channel, this.value);
};
Servo.prototype.reset = function(value){
	this.value = this.resetvalue;
	pwm.setPulse(this.channel, this.value);
};
Servo.prototype.get = function(){
	return this.value;
};
Servo.prototype.getmin = function(){
	return this.min;
};
Servo.prototype.getmax = function(){
	return this.max;
};
Servo.prototype.getresetvalue = function(){
	return this.resetvalue;
};
Servo.prototype.close = function(){
	this.value=this.resetvalue;
	pwm.setPulse(this.channel, this.value);
};

var servo = {};
servo['direction'] = new Servo(0,1000,2000,1400);
//servo['propulsion']  = new Servo(1,1000,2000,1500);
servo['propulsion']  = new Servo(1,1200,1700,1400);



///////////////////////////////////////////////////
// socket listeners
///////////////////////////////////////////////////

io.on('connection', function(socket) {
	log(socket,'CONNECTED'); 

	// Reconnecting ? Recovering from emergency stop
	if(led['cliga'].get()==1 && led['clidr'].get()==1){ 
		led['cliga'].set(0);
		led['clidr'].set(0);
	}	

	socket.on('feucroisement', function(direction) {
		switch(direction){
			case 'on':
					if(led['crois'].get()!=1) {        
						led['crois'].set(1);
						log(socket,'Feux croisement on'); 
					}
					break;
			case 'off':
			default:
					if(led['crois'].get()!=0) {        
						led['crois'].set(0);
						log(socket,'Feux croisement off'); 
					}
					break;
		}
	});

	socket.on('feurecul', function(direction) {
		switch(direction){
			case 'on':
					if(led['arrie'].get()!=1) {        
						led['arrie'].set(1);
						log(socket,'Feu recul on'); 
					}
					break;
			case 'off':
			default:
					if(led['arrie'].get()!=0) {        
						led['arrie'].set(0);
						log(socket,'Feu recul off'); 
					}
					break;
		}
	});
	socket.on('grandphares', function(direction) {
		switch(direction){
			case 'on':
					if(led['gdfeu'].get()!=1) {        
						led['gdfeu'].set(1);
						log(socket,'Grands feux on'); 
					}
					break;
			case 'off':
			default:
					if(led['gdfeu'].get()!=0) {        
						led['gdfeu'].set(0);
						log(socket,'Grands feux off'); 
					}
					break;
		}
	});
	socket.on('feustop', function(direction) {
		switch(direction){
			case 'on':
					if(led['frein'].get()!=1) {        
						led['frein'].set(1);
					}
					break;
			case 'off':
			default:
					if(led['frein'].get()!=0) {        
						led['frein'].set(0);
						log(socket,'Feux stop off'); 
					}
					break;
		}
	});
	socket.on('setdirection', function(direction) {
		switch(direction){
			case 'droite':
					if(servo['direction'].get() != servo['direction'].getmin()) {
						servo['direction'].set(servo['direction'].getmin());
						log(socket,'Droite'); 
					}
					break;
			case 'gauche':
					if(servo['direction'].get() != servo['direction'].getmax()) {
						servo['direction'].set(servo['direction'].getmax());
						log(socket,'Gauche'); 
					}
					break;
			case 'neutre':
			default:
					if(servo['direction'].get() != servo['direction'].getresetvalue()) {
						servo['direction'].reset();
						log(socket,'Tout droit'); 
					}
					break;
		}
	});
	socket.on('setpropulsion', function(propulsion) {
		switch(propulsion){
			case 'min':
					if(servo['propulsion'].get() != servo['propulsion'].getmin()) {
						servo['propulsion'].set(servo['propulsion'].getmin());
						log(socket,'Recule'); 
					}
					break;
			case 'max':
					if(servo['propulsion'].get() != servo['propulsion'].getmax()) {
						servo['propulsion'].set(servo['propulsion'].getmax());
						log(socket,'Avance'); 
					}
					break;
			case 'stop':
			default:
					if(servo['propulsion'].get() != servo['propulsion'].getresetvalue()) {
						servo['propulsion'].reset();
						log(socket,'Stop'); 
					}
					break;
		}
	});



	socket.on('disconnect', function(){
		log(socket,'DISCONNECTED');
		
		if( servo['propulsion'].get() != servo['propulsion'].getresetvalue()  ||
			servo['direction'].get()  != servo['direction'].getresetvalue() )
		{
			log(socket,'EMERGENCY STOP');
			led['cliga'].set(1);
			led['clidr'].set(1);
		}
		stop();
	});

	function stop(){ // stopping truck
		servo['propulsion'].reset();
		servo['direction'].reset();
		log(socket,'Truck stopped');
	}
});


///////////////////////////////////////////////////
// function - exit
///////////////////////////////////////////////////
// Properly exiting the PCA, GPIO and process
///////////////////////////////////////////////////

function exit(socket){
	log(socket,'Stopping pca...');
	for (var ind in servo.length) {
		servo[ind].close();
	}
	pwm.stop();

	log(socket,'Unloading gpio ...');
	for (var ind in led.length) {
		led[ind].close();
	}

	log(socket,'Stopping server ...');
	io.close();

	console.log('Exiting ...');
	process.exit(0);
}



function log(socket, text){ 
	console.log(text);
	if(typeof socket !== 'undefined'){ 
		socket.emit('log',text);
	}
	else{
		console.log('undefined');
	}
};


///////////////////////////////////////////////////
// grabbing the Ctrl+C to exit properly
///////////////////////////////////////////////////

process.on('SIGINT', exit);
