var socket = io();

var localTouchPosition = {
  x: null,
  y: null
}
var otherTouchPosition = {
  x: null,
  y: null
}

var space = "";

$(document).ready(function() {
  logAction("document", "ready");
  addListeners();
  setupConnection();
  addSpaceIdToURL();
});

function setupConnection() {

  // CONNECT
  socket.on('connect', () => {
    logAction("socket", "connect");
    socket.emit("join", space);
  });

  socket.on('clientsCount', (numberOfConnectedClients) => {
    logAction("number of clients", numberOfConnectedClients);
    updateClientsStatus(numberOfConnectedClients);
  })

  // TOUCHMOVE
  socket.on('touchmove', (position) => {
    logAction("received", "touchmove");

    otherTouchPosition = position;

    checkOverlapping();

    var owner = $("#touch-other");
    moveTouch(owner, position);
  });

  // TOUCHSTART
  socket.on('touchstart', (position) => {
    logAction("received", "touchstart");

    otherTouchPosition = position;

    $("#touch-other").addClass("touching");
    // $("body").addClass("touching");

    var owner = $("#touch-other");
    moveTouch(owner, position);
  });

  // TOUCHEND
  socket.on('touchend', (didHappen) => {
    logAction("received", "touchend");

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
  // FOCUS
  window.addEventListener("focus", (e) => {
    socket.emit("join", space);
    // socket.open()
    logAction("window", "focus");
  });

  // BLUR
  window.addEventListener("blur", (e) => {
    socket.emit("leave", space);
    // socket.close();
    logAction("window", "blur");
  })

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
  logAction("touch", "start");
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
  logAction("touch", "end");

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
  logAction("touch", "move");

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
  data.space = space;
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

    logAction("touch", "overlap");

    $("body").addClass("real-touch");

  } else {
    $("body").removeClass("real-touch");
  };
}

function updateClientsStatus(numberOfConnectedClients) {
  if (numberOfConnectedClients <= 1) {
    $("#clients-status").html("Waiting for your friend");
  } else if (numberOfConnectedClients == 2) {
    $("#clients-status").html("Your friend is here");
  } else if (numberOfConnectedClients > 2) {
    $("#clients-status").html("Your friends are here");
  }
}

function logAction(category, action) {
  console.log(category.toUpperCase() + ": " + action);
  $("#version").append(category.toUpperCase() + ": " + action + "<br>");
}

function addSpaceIdToURL() {
  if (document.location.search == "") {
    logAction("space", "empty");
    space = getGeneratedSpace();
    var spaceURI = encodeURI(space);
    document.location.search = spaceURI;
  } else {
    space = document.location.search.substring(1);
    sendTouchData("join", space);
    logAction("space", space);
    //
  }
}

function getGeneratedSpace() {

  var consonants = "bcdfghjklmnpqrstvwxz".split('');
  var vowels = "aeiouy".split('');
  var numbers = '0123456789'.split('');
  var space = "";

  space = consonants[Math.floor(Math.random() * 20)];
  space += vowels[Math.floor(Math.random() * 6)];
  space += consonants[Math.floor(Math.random() * 20)];
  space += vowels[Math.floor(Math.random() * 6)];
  for (var i = 0; i < 4; i++) space += numbers[Math.floor(Math.random() * 10)];
  return space;
}