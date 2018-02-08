const express = require('express');
const Socket = require('socket.io');
const app = express();
const port = 3000;

app.use(express.static(__dirname+'/public'));

const server=app.listen(port,()=>{
  console.log(`listening to port ${port}`);
});

const io = Socket(server);
let sockets = [];

const firstPlayer = 'x';
const secondPlayer = 'o';

io.on('connection',(socket)=>{
  
  sockets.push(socket);

  console.log(sockets.length);
  if(sockets.length === 3){
    socket.emit('assignment',secondPlayer);
  }else {
    socket.emit('assignment',firstPlayer);
  }

  socket.on('turn',function(data){
    io.sockets.emit('turn',data);
  });

  socket.on('restarted',()=>{
    io.sockets.emit('restarted',{});
  });

  socket.on('Tied',()=>{
    io.sockets.emit('Tied',{});
  });
});

app.get('/',(req,res)=>{
  res.sendFile(__dirname+'/public/'+'index.html');
});
