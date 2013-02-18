var leapData = [];
var recieving_data = false;
var keys = ['x', 'y', 'z', 'pitch', 'yaw'];
// var normal = {speed: 50, direction: -5000, zoom:200}; // direction is never normalized
var NORMAL_SPEED = 50; var SPEED_TOLERANCE = 20;
var NORMAL_Z = 200; var Z_LOWER = 60; var Z_UPPER = 400; Z_RANGE = 50;
var NORMAL_ZOOM = 1; var ZOOM_TOLERANCE = 0.05; var ZOOM_LOWER = .92; var ZOOM_HIGHER = 1.08;
var NORMAL_PITCH = 0; var PITCH_TOLERANCE = .2; var PITCH_LOWER = -.60; var PITCH_HIGHER = .70;
var NORMAL_YAW = 0; var YAW_TOLERANCE = 0.2; var YAW_LOWER = -.75; var YAW_HIGHER = .75;

function recieveData(event){
	if(recieving_data == true){
		var data = JSON.parse(event.data);
		if(leapData.length >= 4){
			stepFrame();
		} else if(data.hands.length > 0){
			console.log("recording!");
			data = data.hands[0];

			var movement = {};
			// pan - x,y
			movement.x = data.palmPosition[0];
			movement.y = data.palmPosition[2];

			//zoom - z
			movement.z = data.palmPosition[1];

			//pitch - pitch
			var normal = data.palmNormal;
			movement.pitch = -1 * normal[2]; // leap motion has it that negative is sloping upwards, flipping it for google earth
			//Math.atan2(normal.z, normal.y) * 180/math.pi + 180;

			//yaw - yaw
			movement.yaw = -1 * normal[0]; // roll?
											// LeapMotion flips its roll angles as well
			//Math.atan2(normal.x, normal.y) * 180/math.pi + 180;

			leapData.push(movement);
		}
	}
}

function getMovement(){
	if(leapData.length == 0) return false;
	var data = average();
	
	var movement = {};

	//calculate the heading angle (note that x,y are flipped to calculate angle with the positive Y axis)
	movement.direction = Math.atan2(data.x, -data.y) / Math.PI * 180;
	
	//speed
	movement.speed = speed(data.x, data.y)

	if(Math.abs(movement.speed - NORMAL_SPEED) < SPEED_TOLERANCE){
		movement.speed = 0;
	} else {
		movement.speed = (speed(data.x, data.y) - NORMAL_SPEED) / NORMAL_SPEED;
	}

	//zoom
	if(Math.abs(data.z - NORMAL_Z) < Z_RANGE) {
		movement.zoom = 1
	} else {
		if(data.z < NORMAL_Z){ // zooming in
			movement.zoom = 1 - (NORMAL_Z - data.z) / (NORMAL_Z - Z_LOWER) * (NORMAL_ZOOM - ZOOM_LOWER);
		} else { // zooming out
			movement.zoom = 1 + (Z_UPPER - data.z) / (Z_UPPER - NORMAL_Z) * (ZOOM_HIGHER - NORMAL_ZOOM);
		}

		if(Math.abs(movement.zoom) < ZOOM_TOLERANCE)
			movement.zoom = 1;
	}

	//pitch
	if(Math.abs(data.pitch - NORMAL_PITCH) < PITCH_TOLERANCE){
		movement.pitch = 0;
	} else {
		movement.pitch = (data.pitch - NORMAL_PITCH) / (PITCH_HIGHER - PITCH_LOWER);
	}

	if(Math.abs(data.yaw - NORMAL_YAW) < YAW_TOLERANCE){
		movement.yaw = 0;
	} else {
		movement.yaw = (data.yaw - NORMAL_YAW) / (YAW_HIGHER - YAW_LOWER);
	}

	return movement;
}

function average(){
	var avg = {};
	for(i in keys){
		avg[keys[i]] = 0;
	}

	for(data in leapData){
		for(i in keys){
			avg[keys[i]] += leapData[data][keys[i]];
		}
	}

	for(i in keys){
		avg[keys[i]] /= leapData.length;
	}
	leapData.length = 0;

	return avg;
}

function speed(x, y){
	return Math.sqrt(x * x + y * y);
}