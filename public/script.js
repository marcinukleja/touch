var socket = io();

$(document).ready(function() {
  console.log("DOCUMENT READY");
  addListeners();
  setupConnection();
});

function setupConnection() {
  socket.on('touchmove', (coords) => {
    console.log("RECEIVED: touchmove");

    var touchX = coords.x;
    var touchY = coords.y;

    var owner = $("#touch-other");
    moveTouch(owner, touchX, touchY);
  });

  socket.on('touchstart', (coords) => {
    console.log("RECEIVED: touchstart");

    $("#touch-other").fadeIn();


    var touchX = coords.x;
    var touchY = coords.y;

    var owner = $("#touch-other");
    moveTouch(owner, touchX, touchY);
  });

  socket.on('touchend', (didHappen) => {
    console.log("RECEIVED: touchend");

    $("#touch-other").fadeOut();

    $("#touch-other").fadeOut;
  });


  socket.on('connect', () => {
    console.log("RECEIVED: connect");
    // var numberOfClients = socket.io.engine.clientsCount;
    // $('#status').html(numberOfClients)
  })
};

function addListeners() {
  document.addEventListener('touchmove', throttle(onTouchMove, 10), false);
  document.addEventListener('touchstart', (e) => {
    onTouchStart(e);
  }, false);

  document.addEventListener('touchend', (e) => {
    onTouchEnd(e);
  }, false);
};

function onTouchStart(e) {
  console.log("ON TOUCH START");
  e.preventDefault();

  // Set style
  $("#touch-local").fadeIn();

  // Gather coordinates
  var touch = e.touches[0];
  var touchX = touch.pageX;
  var touchY = touch.pageY;

  // Set & send data object
  var data = {
    x: touchX,
    y: touchY
  };

  sendTouchData("touchstart", data);

  // Move Touch indicator
  var owner = $("#touch-local");
  moveTouch(owner, touchX, touchY);
}

function onTouchEnd(e) {
  console.log("ON TOUCH END");
  e.preventDefault();

  // Set style
  $("#touch-local").fadeOut();

  socket.emit("touchend", false)

}


function onTouchMove(e) {
  console.log("ON TOUCH MOVE");
  e.preventDefault();

  // Gather coordinates
  var touch = e.touches[0];
  var touchX = touch.pageX;
  var touchY = touch.pageY;

  // Set & send data object
  var data = {
    x: touchX,
    y: touchY
  };

  sendTouchData("touchmove", data);

  // Move Touch indicator
  var owner = $("#touch-local");
  moveTouch(owner, touchX, touchY);
}

function sendTouchData(eventName, data) {
  console.log(eventName);
  socket.emit(eventName, data);
};


function moveTouch(owner, x, y) {
  owner.css({
    left: x,
    top: y
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