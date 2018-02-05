var socket = io();

$(document).ready(function() {
  // console.log("ready!");
  addListeners();
  setupConnection();
});

function setupConnection() {
  socket.on('touch', (coords) => {

    console.log("RECEIVED");
    var touchX = coords.x;
    var touchY = coords.y;

    var owner = $("#touch-other");
    moveTouch(owner, touchX, touchY);
  });

  socket.on('connect', () => {
    // console.log(socket);
    // var numberOfClients = socket.io.engine.clientsCount;
    // $('#status').html(numberOfClients)
  })
};

function addListeners() {
  document.addEventListener('touchmove', throttle(onTouchMove, 10), false);

};

function onTouchStart(e) {

}

function onTouchMove(e) {
  e.preventDefault();
  var touch = e.touches[0];
  var touchX = touch.pageX;
  var touchY = touch.pageY;

  var touchX = e.pageX;
  var touchY = e.pageY;

  var data = {
    x: touchX,
    y: touchY
  };

  sendTouchData(data);

  var owner = $("#touch-local");
  moveTouch(owner, touchX, touchY);
}

function sendTouchData(data) {
  socket.emit('touch', data);
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