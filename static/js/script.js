$(function () {
	var socket = io.connect();
	var activeClass = 'active';

	//listen for key presses
	$(document).keydown(function(e){
		switch(e.which){
			case 83: //S
					if(! $('#BtnAvance').hasClass(activeClass)){
						socket.emit('feustop','off');
						socket.emit('feurecul','on');
						socket.emit('setpropulsion', 'min');
						$('#BtnRecule').addClass(activeClass);
					}
					break;
			case 90: //Z
					if(! $('#BtnRecule').hasClass(activeClass)){
						socket.emit('feustop','off');
						socket.emit('setpropulsion', 'max');
						$('#BtnAvance').addClass(activeClass);
					}
					break;
			case 81: //Q
					if(! $('#BtnDroite').hasClass(activeClass)){
						socket.emit('setdirection', 'gauche');
						$('#BtnGauche').addClass(activeClass);
					}
					break;
			case 68: //D
					if(! $('#BtnGauche').hasClass(activeClass)){
						socket.emit('setdirection', 'droite');
						$('#BtnDroite').addClass(activeClass);
					}
					break;
			case 70: //F
					if($('#BtnCrois').hasClass(activeClass)){
						socket.emit('feucroisement', 'off');
						$('#BtnCrois').removeClass(activeClass);
					}
					else{
						socket.emit('feucroisement', 'on');
						$('#BtnCrois').addClass(activeClass);
					}
					break;
			case 71: //G
					if($('#BtnGrands').hasClass(activeClass)){
						socket.emit('grandphares', 'off');
						$('#BtnGrands').removeClass(activeClass);
					}
					else{
						socket.emit('grandphares', 'on');
						$('#BtnGrands').addClass(activeClass);
					}
					break;
			case 65: //A
					socket.emit('grandphares', 'on');
					$('#BtnGrands').addClass(activeClass);
					break;
		}
	});

	$(document).keyup(function(e){

		switch(e.which){
			case 65: //A
				socket.emit('grandphares', 'off');
				$('#BtnGrands').removeClass(activeClass);
				break;
			case 81: //Q
			case 68: //D
				socket.emit('setdirection', 'neutre');
				$('#BtnGauche').removeClass(activeClass);
				$('#BtnDroite').removeClass(activeClass);
				break;
			case 83: //S
			case 90: //Z
				socket.emit('feustop','on');
				socket.emit('setpropulsion', 'stop');
				socket.emit('feurecul','off');
				$('#BtnRecule').removeClass(activeClass);
				$('#BtnAvance').removeClass(activeClass);
				break;
		}
	});

	socket.on('log', function(content){
		var dt = new Date();
		var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds()+ '.'+dt.getMilliseconds();
		$('#logconsole').val(time+' '+content+'\n'+$('#logconsole').val());
	});
});
