var socket = io();

var localTouchPosition = {
  x: null,
  y: null
}
var otherTouchPosition = {
  x: null,
  y: null
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
    // console.log(socket);
  });

  socket.on('clientsCount', (numberOfConnectedClients) => {
    console.log(numberOfConnectedClients);
    updateClientsStatus(numberOfConnectedClients);
  })

  // TOUCHMOVE
  socket.on('touchmove', (position) => {
    console.log("RECEIVED: touchmove");

    otherTouchPosition = position;

    checkOverlapping();

    var owner = $("#touch-other");
    moveTouch(owner, position);
  });

  // TOUCHSTART
  socket.on('touchstart', (position) => {
    console.log("RECEIVED: touchstart");

    otherTouchPosition = position;

    $("#touch-other").addClass("touching");
    // $("body").addClass("touching");

    var owner = $("#touch-other");
    moveTouch(owner, position);
  });

  // TOUCHEND
  socket.on('touchend', (didHappen) => {
    console.log("RECEIVED: touchend");

    otherTouchPosition = {
      x: null,
      y: null
    }

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
  document.addEventListener('touchmove', throttle(onTouchMove, 25), false);

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

  // Set local coordinates
  localTouchPosition = {
    x: touchX,
    y: touchY
  };

  sendTouchData("touchstart", localTouchPosition);

  // Move Touch indicator
  var owner = $("#touch-local");
  moveTouch(owner, localTouchPosition);
}

function onTouchEnd(e) {
  console.log("ON TOUCH END");

  // Set style
  $("#touch-local").removeClass("touching");
  $("body").removeClass("real-touch");

  localTouchPosition = {
    x: null,
    y: null
  }

  socket.emit("touchend", false)
}

function onTouchMove(e) {
  e.preventDefault();

  // Gather coordinates
  var touch = e.touches[0];
  var touchX = touch.pageX;
  var touchY = touch.pageY;

  // Set & send data object
  localTouchPosition = {
    x: touchX,
    y: touchY
  };

  checkOverlapping();

  sendTouchData("touchmove", localTouchPosition);

  // Move Touch indicator
  var owner = $("#touch-local");
  moveTouch(owner, localTouchPosition);
}

function sendTouchData(eventName, data) {
  socket.emit(eventName, data);
};

function moveTouch(owner, position) {
  owner.css({
    left: position.x,
    top: position.y
  });
}

// Limit the number of events per second
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

// localTouchPosition

function checkOverlapping() {
  if (localTouchPosition.x > (otherTouchPosition.x - 32) &&
    localTouchPosition.x < (otherTouchPosition.x + 32) &&
    localTouchPosition.y > (otherTouchPosition.y - 32) &&
    localTouchPosition.y < (otherTouchPosition.y + 32)) {
    console.log("OVERLAP");

    $("body").addClass("real-touch");

  } else {
    $("body").removeClass("real-touch");
  };
}

function updateClientsStatus(numberOfConnectedClients) {
  if (numberOfConnectedClients <= 1) {
    $("#clients-status").html("Waiting for your friend…");
  } else if (numberOfConnectedClients == 2) {
    $("#clients-status").html("Your friend is here!");
  } else if (numberOfConnectedClients > 2) {
    $("#clients-status").html("Your friends are here!");
  }

}