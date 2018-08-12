var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// EXPRESS
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// SOCKET IO
io.on('connection', (socket) => {
  console.log('SOCKET: connected');

  // On JOIN
  socket.on('join', (space) => {
    socket.join(space);
    console.log('ROOM: joined ' + space);
    var room = io.sockets.adapter.rooms[space];
    if (room) {
      io.to(space).emit('clientsCount', room.length);
    };
  });

  // On LEAVE
  socket.on('leave', (space) => {
    socket.leave(space);
    console.log('ROOM: left ' + space);
    var room = io.sockets.adapter.rooms[space];
    if (room) {
      io.to(space).emit('clientsCount', room.length);
    };
  });

  // On TOUCHMOVE
  socket.on('touchmove', (data) => {
    socket.broadcast.to(data.space).emit('touchmove', data)
  });

  // On TOUCHSTART
  socket.on('touchstart', (data) => {
    socket.broadcast.to(data.space).emit('touchstart', data)
  });

  // On TOUCHEND
  socket.on('touchend', (data) => {
    socket.broadcast.to(data.space).emit('touchend', data)
  });

  // On DISCONNECT
  socket.on('disconnect', () => {
    console.log('SOCKET: disconnected');
  })
})

http.listen(process.env.PORT || 5000, () => {
  console.log('Listening on port ' + http.address().port);
});