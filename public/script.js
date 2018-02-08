var socket = io();
var localCoords = {
  x: 0,
  y: 0
}
var otherCoords = {
  x: 0,
  y: 0
}

$(document).ready(function() {
  console.log("DOCUMENT READY");
  addListeners();
  setupConnection();
});

function setupConnection() {

  // CONNECT
  socket.on('connect', () => {
    console.log("RECEIVED: connect");
  });

  // TOUCHMOVE
  socket.on('touchmove', (coords) => {
    console.log("RECEIVED: touchmove");

    otherCoords = coords;

    var owner = $("#touch-other");
    moveTouch(owner, coords);
  });

  // TOUCHSTART
  socket.on('touchstart', (coords) => {
    console.log("RECEIVED: touchstart");

    otherCoords = coords;

    $("#touch-other").addClass("touching");
    // $("body").addClass("touching");

    var owner = $("#touch-other");
    moveTouch(owner, coords);
  });

  // TOUCHEND
  socket.on('touchend', (didHappen) => {
    console.log("RECEIVED: touchend");

    $("#touch-other").addClass("touching").delay(125).queue(function() {
      $(this).removeClass("touching").dequeue();
    });

    $("body").removeClass("real-touch");


    // $("body").addClass("touching").delay(125).queue(function() {
    //   $(this).removeClass("touching").dequeue();
    // });

  });
};

function addListeners() {
  // TOUCHMOVE
  document.addEventListener('touchmove', throttle(onTouchMove, 10), false);
  // TOUCHSTART
  document.addEventListener('touchstart', (e) => {
    onTouchStart(e);
  }, false);
  // TOUCHEND
  document.addEventListener('touchend', (e) => {
    onTouchEnd(e);
  }, false);
};

function onTouchStart(e) {
  console.log("ON TOUCH START");
  e.preventDefault();

  // Set style
  $("#touch-local").addClass("touching");

  // Gather coordinates
  var touch = e.touches[0];
  var touchX = touch.pageX;
  var touchY = touch.pageY;

  // Set & send data object
  var coords = {
    x: touchX,
    y: touchY
  };

  sendTouchData("touchstart", coords);

  // Move Touch indicator
  var owner = $("#touch-local");
  moveTouch(owner, coords);
}

function onTouchEnd(e) {
  console.log("ON TOUCH END");
  e.preventDefault();

  // Set style
  $("#touch-local").removeClass("touching");
  $("body").removeClass("real-touch");

  socket.emit("touchend", false)
}

function onTouchMove(e) {
  e.preventDefault();

  // Gather coordinates
  var touch = e.touches[0];
  var touchX = touch.pageX;
  var touchY = touch.pageY;

  // Set & send data object
  localCoords = {
    x: touchX,
    y: touchY
  };

  // console.log("ON TOUCH MOVE: " + localCoords.x + ":" + otherCoords.x + " " + localCoords.y + ":" + otherCoords.y);


  if (localCoords.x > (otherCoords.x - 32) &&
    localCoords.x < (otherCoords.x + 32) &&
    localCoords.y > (otherCoords.y - 32) &&
    localCoords.y < (otherCoords.y + 32)) {
    console.log("REAL TOUCH");


    $("body").addClass("real-touch");

  } else {
    $("body").removeClass("real-touch");
  };

  sendTouchData("touchmove", localCoords);

  // Move Touch indicator
  var owner = $("#touch-local");
  moveTouch(owner, localCoords);
}

function sendTouchData(eventName, data) {
  console.log(eventName);
  socket.emit(eventName, data);
};

function moveTouch(owner, coords) {
  owner.css({
    left: coords.x,
    top: coords.y
  });
}

// limit the number of events per second
function throttle(callback, delay) {
  var previousCall = new Date().getTime();
  return function() {
    var time = new Date().getTime();

    if ((time - previousCall) >= delay) {
      previousCall = time;
      callback.apply(null, arguments);
    }
  };
}