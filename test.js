
'use strict';
var gpio = require('rpi-gpio'),
    button = new process.EventEmitter(),
    longPressThreshold,
    monitorButton,
    pressStart,
    pressEnd,
    leds = [],
    toggle = false;

//Setup our leds
leds.push({name: 'RED', pin: 15, state: false});
leds.push({name: 'BLUE', pin: 13, state: false});

//Set how many ms a long press should be
longPressThreshold = 1000;

//Setup our button gpio pin and state
button.pin = 11;
button.state = false;

//Initialize the gpio pins for the leds
leds.forEach(function (led) {
  gpio.setup(led.pin, gpio.DIR_OUT);
});

//Initialize the button and start the monitor function
gpio.setup(button.pin, gpio.DIR_IN, function () {
	setInterval(monitorButton, 50);
});

//Setup an event for a stateChange
button.on('stateChange', function (previousValue, value) {
  //console.log('button state changed from', previousValue, 'to', value);
});

//Setup an event for a button press
button.on('pressed', function () {
  //Start the press timer
  pressStart = new Date();
});

//Setup an event for a button release
button.on('released', function () {
  pressEnd = new Date();

  //Determine if this was a long or short press
  if ((pressEnd - pressStart) > longPressThreshold) {
    button.emit('longPress');
  } else {
    button.emit('shortPress');
  }
});

//Setup an event for a long button press
button.on('longPress', function () {
  console.log('Long press detected');
});

//Setup an event for a short button press
button.on('shortPress', function () {
  console.log('Short press detected');

  //Reset the led states
  leds.forEach(function (led) {
    led.state = false;
  });

  //Increment the toggle
	toggle++;

  //If the toggle is greater then the number of leds, reset to zero
	if (toggle > leds.length) {
		toggle = 0;
  }

  //Set the led state based on the toggle
	if ((toggle - 1) >= 0) {
		leds[toggle - 1].state = true;
	}

  //Set the state of each led
  leds.forEach(function (led) {
    gpio.write(led.pin, led.state, function (err) {
      if (err) { throw err; }

      if (led.state) {
        console.log('The %s led is now on!', led.name);
      }
    });
  });
});

//Set an event for button errors
button.on('error', function (err) {
  console.log('button error: %s', err);
});

//Main function to monitor the button states
monitorButton = function () {
  //Iniate a read of the button
	gpio.read(button.pin, function (err, value) {
    //Emit an error if one is detected
		if (err) {
			button.emit('error', err);
		} else {
      //If the button state differs from the current state process the events
			if (button.state !== value) {
        button.emit('stateChange', button.state, value);
        button.state = value;

        if (value) { button.emit('pressed'); }
        if (!value) { button.emit('released'); }
      }
    }
  });
};

