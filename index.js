var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {

  console.log('USER CONNECTED');

  // On TOUCH
  socket.on('touch', (coords) => {
    socket.broadcast.emit('touch', coords)
  })

  // On DISCONNECT
  socket.on('disconnect', () => {
    console.log('USER DISCONNECTED'); // Can't fire
  })
})

http..listen(process.env.PORT || 5000, () => {
  // This port should go to browser address
  // Google says: "You must be sure that your application code is listening on 8080."

  console.log('Listening…');
});