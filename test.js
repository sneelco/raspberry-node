var gpio = require('rpi-gpio'),
    button = new process.EventEmitter(),
    redled = 15,
    blueled = 13,
    toggle = false,
    state = true;


button.pin = 11;
gpio.setup(redled, gpio.DIR_OUT);
gpio.setup(blueled, gpio.DIR_OUT);
gpio.setup(button.pin, gpio.DIR_IN, function() {
	setInterval(monitorButton, 50);
});

button.on('stateChange', function(previousValue, value){
  //console.log('button state changed from', previousValue, 'to', value);
});

button.on('pressed', function(){
	button.emit('toggle');
	console.log('button pressed');
});

button.on('released', function(){
  console.log('button released');
});

button.on('toggle', function() {
	toggle++;
	if (toggle > 2)
		toggle = 0;

	leds = [false, false];
	if (toggle - 1 >=0) {
		leds[toggle - 1] = true
	}
	gpio.write(redled, leds[0], function(err) {
		if (err) throw err;
	});

	gpio.write(blueled, leds[1], function(err) {
		if (err) throw err;
	});
});

button.on('error', function(err){
  console.log('button error: %s', err);
});

function monitorButton() {
	gpio.read(button.pin, function(err, value) {
		if (err) {
			button.emit('error', err);
		} else {
			if (button.state !== value) {
        			var previousState = button.state;
        			button.state = value;
        			button.emit('stateChange', previousState, value);

				if (value)
					button.emit('pressed');

				if (!value)
					button.emit('released');
      			}
    		}        
  	})
}

