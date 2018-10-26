// https://socket.io/docs/server-api/

class IoSocketService {

  constructor() {
    this.ioSocketServer = null;
  }


  init() {
  //var users = [];
  var userCount = 0;

  var connectedUsers = {
  };

  this.ioSocketServer.use((socket, next) => {
      if (socket.request.headers.cookie) return next();
      next(new Error('Authentication error'));
  });

    this.ioSocketServer.on('connection', function(socket){
    console.log("new connection");
    //users.push(socket);
    userCount++;


    connectedUsers[socket.id] = socket;

    socket.emit('welcome', { hello: 'new user', socket_id: socket.id, usersCount : 1 });

    socket.broadcast.emit('serverMessage', {evtName:"welcome",  hello: 'new user', socket_id: socket.id, usersCount : userCount });



    socket.on('clientRequest', function (data) {
      console.log(data);
      socket.emit('response', { clientRequestFromServer: data });
      connectedUsers[data.toUserId].emit({msg:"hello"});
      //users.find(useid);

    });

    socket.on('disconnect', function (data) {
      console.log("disconnect");
      //console.log(socket);
      userCount--;

      delete connectedUsers[socket.id];

      console.log(connectedUsers);
      socket.broadcast.emit('serverMessage', {evtName:"welcome",  hello: 'new user', socket_id: socket.id, usersCount : userCount });

      // users.splice(
      //   users.findIndex(
      //     (i) => i.id === data.id
      // ), 1 );
      if(!data)
      {
        data={see:'this'};
      }
      for(var connId in connectedUsers)
      {
        var sock = connectedUsers[connId];
        sock.emit('userDisconnected', {user:data, usersCount : userCount });
      }
    });

  });

}


  connect(server)
{
  this.ioSocketServer = require('socket.io').listen(server);
  this.ioSocketServer.set("log level", 0);
  this.init();
}

  broadcast(obj) {
    debugger;
    this.ioSocketServer.emit('serverMessage', obj);
}

}

module.exports = new IoSocketService();