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
  console.log('NODE: user connected');
  // io.emit('clientsCount', io.engine.clientsCount); // need broadcast flag

  // On JOIN
  socket.on('join', (space) => {
    socket.join(space);
    console.log('ROOM: joined ' + space);
    var room = io.sockets.adapter.rooms[space];
    if (room) {
      io.to(space).emit('clientsCount', room.length)
    };
  })
  // On LEAVE
  socket.on('leave', (space) => {
    socket.leave(space);
    console.log('ROOM: left ' + space);
    var room = io.sockets.adapter.rooms[space];
    if (room) {
      io.to(space).emit('clientsCount', room.length); // need broadcast flag
    };
  })
  // On TOUCHMOVE
  socket.on('touchmove', (data) => {
    socket.broadcast.to(data.space).emit('touchmove', data)
  })
  // On TOUCHSTART
  socket.on('touchstart', (data) => {
    socket.broadcast.to(data.space).emit('touchstart', data)
  })
  // On TOUCHEND
  socket.on('touchend', (data) => {
    socket.broadcast.to(data.space).emit('touchend', data)
  })

  // On DISCONNECT
  socket.on('disconnect', () => {
    // Timeout needed for disconnection on window blur
    // setTimeout(() => {
    //   io.emit('clientsCount', io.engine.clientsCount); // need broadcast flag
    // }, 1000); // TODO: Change hack to actual disconnect
    console.log('NODE: user disconnected');
  })
})

http.listen(process.env.PORT || 5000, () => {
  console.log('Listening…');
});