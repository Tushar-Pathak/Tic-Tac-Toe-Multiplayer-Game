const express = require('express');
const Socket = require('socket.io');
const app = express();
const port = 3000;

app.use(express.static(__dirname + '/public'));

const server = app.listen(port, () => {
  console.log(`listening to port ${port}`);
});

const io = Socket(server);
let connection = [];

const firstPlayer = 'x';
const secondPlayer = 'o';

function even(no) {
  if (no % 2 === 0)
    return true;
  else
    return false;
}

io.on('connection', (socket) => {

  connection.push(socket);

  console.log("No of connections: ",connection.length);
  if (even(connection.length) === true) {
    socket.emit('assignment', secondPlayer);
  } else {
    socket.emit('assignment', firstPlayer);
  }

  socket.on('turn', function (data) {
    io.sockets.emit('turn', data);
  });

  socket.on('restarted', () => {
    io.sockets.emit('restarted', {});
  });

  socket.on('Tied', () => {
    io.sockets.emit('Tied', {});
  });

  socket.on('disconnect', (data) => {
    connection.splice(connection.indexOf(socket), 1);
    console.log("disconnected " + connection.length);
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/' + 'index.html');
});
