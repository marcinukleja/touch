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
  })
};

function addListeners() {
  document.addEventListener('mousemove', function(e) {
    e.preventDefault();
    //        var touch = e.touches[0];
    //        var touchX = touch.pageX;
    //        var touchY = touch.pageY;

    var touchX = e.pageX;
    var touchY = e.pageY;

    var data = {
      x: touchX,
      y: touchY
    }

    sendTouchData(data);

    var owner = $("#touch-local");
    moveTouch(owner, touchX, touchY);

  }, false);

};

function sendTouchData(data) {
  socket.emit('touch', data);
};


function moveTouch(owner, x, y) {
  owner.css({
    left: x,
    top: y
  });
}