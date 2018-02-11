var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('NODE: user connected');
  io.emit('clientsCount', io.engine.clientsCount); // need broadcast flag

  // On TOUCHMOVE
  socket.on('touchmove', (coords) => {
    socket.broadcast.emit('touchmove', coords)
  })
  // On TOUCHSTART
  socket.on('touchstart', (coords) => {
    socket.broadcast.emit('touchstart', coords)
  })
  // On TOUCHEND
  socket.on('touchend', (coords) => {
    socket.broadcast.emit('touchend', coords)
  })

  // On DISCONNECT
  socket.on('disconnect', () => {
    console.log('NODE: user disconnected'); // Can't fire
    io.emit('clientsCount', io.engine.clientsCount); // need broadcast flag
  })
})

http.listen(process.env.PORT || 5000, () => {
  console.log('Listening…');
});