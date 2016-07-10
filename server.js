const express = require('express');
const http = require('http');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const compiler = webpack(webpackConfig);

app.use(express.static(__dirname + '/www'));

app.use(webpackDevMiddleware(compiler, {
  hot: true,
  filename: 'bundle.js',
  publicPath: '/',
  stats: {
    colors: true,
    hash: false,
    version: false,
    timings: false,
    assets: false,
    chunks: false,
    modules: false,
    reasons: false,
    children: false,
    source: false,
    errors: false,
    errorDetails: false,
    warnings: false,
    publicPath: false
  },
  historyApiFallback: true,
}));

io.on('connection', socket => {

  socket.on('userConnect', user => {

    var socketid = socket.id.slice(8)
    socket.username = socketid // store some data about user on socket object

    socket.broadcast.emit('userConnect', {
      name: user.name,
      defaultName: socketid
    })
  })

  socket.on('message', message => {
    var from;
    //message.from !== '' ? from = message.from : from = socket.id.slice(8)
    if (message.from !=='' && message.from !== 'Me') {
      from = message.from
    } else {
      from = socket.id.slice(8)
    }
    socket.broadcast.emit('message', {
      body: message.body, // equivalent to "body: message.body"
      from: from,
      date: message.date
    })
  })

  socket.on('changed name', name => {
    socket.changedUserName = name
    var nameInfo = {
      name: name,
      originalName: socket.username
    }
    socket.broadcast.emit('changed name', nameInfo)
  })

  socket.on('disconnect', () => {
     io.emit('user disconnected', {
       id: socket.changedUserName ? socket.changedUserName : socket.username
     });
   });

})

server.listen(3000);
