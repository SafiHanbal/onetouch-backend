const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'config.env' });

const app = require('./app');

const DB = process.env.DATABASE_URI.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, { useNewUrlParser: true })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.log(err.message));

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: 'https://onetouch-hanbal.netlify.app',
  },
});

io.on('connection', (socket) => {
  console.log('connected to socket.io');

  socket.on('setup', (userData) => {
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log(`User joined Room: ${room}`);
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  socket.on('new message', (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;
    if (!chat.users) return console.log('chat.users not defined');
    chat.users.forEach((user) => {
      if (user === newMessageRecieved.sender._id) return;

      socket.in(user).emit('message recieved', newMessageRecieved);
    });
  });

  socket.off('setup', () => {
    console.log('USER DISCONNECTED');
    socket.leave(userData._id);
  });
});
