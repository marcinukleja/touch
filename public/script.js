var socket = io();

var space = "";

var localTouchPosition = {
  x: null,
  y: null
}
var otherTouchPosition = {
  x: null,
  y: null
}

$(document).ready(function() {
  logAction("document", "ready");
  addSpaceIdToURL();
  addListeners();
  setupConnection();
  // insertLink();
  // setupActionButton();
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

    var owner = $("#touch-other");
    moveTouch(owner, position);
  });

  // TOUCHEND
  socket.on('touchend', (position) => {
    logAction("received", "touchend");

    otherTouchPosition.x = null;
    otherTouchPosition.y = null;

    $("#touch-other").addClass("touching").delay(125).queue(function() {
      $(this).removeClass("touching").dequeue();
    });
    $("body").removeClass("real-touch");
  });
};

function addListeners() {

  disableScroll();

  // FOCUS
  window.addEventListener("focus", (e) => {
    socket.emit("join", space);
    logAction("window", "focus");
  });

  // BLUR
  window.addEventListener("blur", (e) => {
    socket.emit("leave", space);
    logAction("window", "blur");
  })

  // TOUCHMOVE
  // document.addEventListener('touchmove', throttle(onTouchMove, 0), false);

  document.addEventListener('touchmove', (e) => {
    onTouchMove(e);
  }, false);

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

  $("#touch-local").addClass("touching");

  var touch = e.touches[0];
  var touchX = touch.pageX;
  var touchY = touch.pageY;

  localTouchPosition.x = touchX;
  localTouchPosition.y = touchY;

  sendTouchData("touchstart", localTouchPosition);

  var owner = $("#touch-local");
  moveTouch(owner, localTouchPosition);
}

function onTouchEnd(e) {
  logAction("touch", "end");

  $("#touch-local").removeClass("touching");
  $("body").removeClass("real-touch");


  localTouchPosition.x = null;
  localTouchPosition.y = null;

  sendTouchData("touchend", localTouchPosition);
}

function onTouchMove(e) {
  e.preventDefault();

  logAction("touch", "move");

  var touch = e.touches[0];
  var touchX = touch.pageX;
  var touchY = touch.pageY;

  localTouchPosition.x = touchX;
  localTouchPosition.y = touchY;

  checkOverlapping();

  sendTouchData("touchmove", localTouchPosition);

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
    $("#status").html("Waiting for your friend");
    $("#loader").addClass('waiting');
    $("#instruction").removeClass('hidden');

  } else if (numberOfConnectedClients == 2) {
    $("#status").html("Your friend is here");
    $("#loader").removeClass('waiting');
    $("#instruction").addClass('hidden');
  } else if (numberOfConnectedClients > 2) {
    $("#status").html("Your friends are here");
    $("#loader").removeClass('waiting');
    $("#instruction").addClass('hidden');


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

function insertLink() {
  var link = window.location.href;
  $("#link").val(link);
  logAction("link", link);
}

function setupActionButton() {
  $("#action").on("touchstart", (e) => {
    var linkObject = $("#link");
    linkObject.select();
    document.execCommand('cut');
    logAction("action", "hit");
  });
}

function preventDefault(e) {
  e.preventDefault();
}

function disableScroll() {
  document.body.addEventListener('touchmove', preventDefault, {
    passive: false
  });
  logAction("action", "passive listener");
}