var animRunning = false;
var PAN_CONSTANT = 0.010363892368497602;

function startAnimation() {
  if (!animRunning) {
    ge.getOptions().setFlyToSpeed(ge.SPEED_TELEPORT);
    animRunning = true;
    // google.earth.addEventListener(ge, 'frameend', stepFrame);
    // setTimeout(stepFrame, 100);
    // start it off
    recieving_data = true;
  }
}

function stopAnimation() {
  if (animRunning) {
    recieving_data = false;
    animRunning = false;
  }
}

function stepFrame(){
  console.log("stepping!");
  var movement = getMovement();
  if(movement){
    pan(movement.direction, movement.speed);
    zoom(movement.zoom);
    pitch(movement.pitch);
    yaw(movement.yaw);
  }
}

//speed is a positive value from 0 to 10
//direction is angle (degrees) where 0 = straign ahead, then clockwise
function pan(direction, speed) {
  console.log("panning!");
  // an example of some camera manipulation that's possible w/ the Earth API
  var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
  // debugger;

  var height = lookAt.getRange() * Math.cos(lookAt.getTilt()/180*Math.PI);

  var dest = destination(lookAt.getLatitude(), lookAt.getLongitude(), speed * height * PAN_CONSTANT,
                         lookAt.getHeading() + direction);

  // camera.setAltitude(ANIM_ALTITUDE);
  lookAt.setLatitude(dest[0]);
  lookAt.setLongitude(dest[1]);

  ge.getView().setAbstractView(lookAt);
}

function zoom(factor){
  // Get the current view.
  var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

  // Zoom out to twice the current range.
  lookAt.setRange(lookAt.getRange() * factor);

  // Update the view in Google Earth.
  ge.getView().setAbstractView(lookAt);
}

// negative magnitude -> tilting towards the ground
function pitch(magnitude){
    // Get the current view.
    var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

    lookAt.setTilt(lookAt.getTilt() + magnitude);

    // Update the view in Google Earth.
    ge.getView().setAbstractView(lookAt);
}

// positive magnitude -> yaw-ing clockwise
function yaw(magnitude){
    // Get the current view.
    var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

    lookAt.setHeading(lookAt.getHeading() + magnitude);

    // Update the view in Google Earth.
    ge.getView().setAbstractView(lookAt);
}

// function pan(latitude, longitude){
//   // Get the current view.
//   var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

//   // Add 25 degrees to the current latitude and longitude values.
//   lookAt.setLatitude(lookAt.getLatitude() + latitude);
//   lookAt.setLongitude(lookAt.getLongitude() + longitude);

//   // Update the view in Google Earth.
//   ge.getView().setAbstractView(lookAt);
// }

/* Helper functions, courtesy of
   http://www.movable-type.co.uk/scripts/latlong.html */
function distance(lat1, lng1, lat2, lng2) {
  var a = Math.sin(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180);
  var b = Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.cos((lng2 - lng1) * Math.PI / 180);
  return 6371000 * Math.acos(a + b);
}

function destination(lat, lng, dist, heading) {
  lat *= Math.PI / 180;
  lng *= Math.PI / 180;
  heading *= Math.PI / 180;
  dist /= 6371000; // angular dist
  
  var lat2 = Math.asin(Math.sin(lat) * Math.cos(dist) + 
                       Math.cos(lat) * Math.sin(dist) * Math.cos(heading));

  return [
      180 / Math.PI * lat2,
      180 / Math.PI *
        (lng + Math.atan2(Math.sin(heading) * Math.sin(dist) * Math.cos(lat2),
                          Math.cos(dist) - Math.sin(lat) * Math.sin(lat2)))];
}