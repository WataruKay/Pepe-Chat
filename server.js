const express = require('express')
const http = require('http')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpack = require('webpack')
const webpackConfig = require('./webpack.config.js')
const socketIo = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)
const compiler = webpack(webpackConfig)
const connectedUsers = []

app.use(express.static(__dirname + '/www'))

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
    connectedUsers.push(socket.username) // store connected user into server side
    io.emit('userConnect', {
      name: user.name,
      defaultName: socketid,
      serverSideList: connectedUsers
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
    socket.changedName = name
    // check if socket.username 'default id' exists on server side list
    // if it does, that means this user has not changed their name yet, so splice it out, and update with passed in name
    var nameChangeFlag = connectedUsers.indexOf(socket.username)
    if ( nameChangeFlag !== -1) {
      connectedUsers.splice(connectedUsers.indexOf(socket.username),1,name)
    }

    var nameInfo = {
      name: name,
      originalName: socket.username,
      serverSideList: connectedUsers
    }
    io.emit('changed name', nameInfo)
  })

  socket.on('disconnect', () => {
      // remove the disconnected user from server side list of users
      if (socket.changedName) {
        connectedUsers.splice(connectedUsers.indexOf(socket.changedName),1)
      } else {
        connectedUsers.splice(connectedUsers.indexOf(socket.username),1)
      }

     io.emit('user disconnected', {
       id: socket.changedName ? socket.changedName : socket.username,
       serverSideList: connectedUsers
     });
   });

})

server.listen(3000);
