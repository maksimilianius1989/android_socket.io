"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var Dotenv = require("dotenv");
var express = require("express");
var ENV = Dotenv.parse(fs.readFileSync(__dirname + '/../.env'));
var app = express();
var http = require('http'), server = http.createServer(app), io = require('socket.io').listen(server);
app.get('/', function (req, res) {
    res.send('Chat Server is running on port 3000');
});
io.on('connection', function (socket) {
    console.log('user connected');
    socket.on('join', function (userNickname) {
        console.log(userNickname + " : has joined the chat ");
        socket.broadcast.emit('userjoinedthechat', userNickname + " : has joined the chat ");
    });
    socket.on('messagedetection', function (senderNickname, messageContent) {
        //log the message in console
        console.log(senderNickname + " :" + messageContent);
        //create a message object
        var message = { "message": messageContent, "senderNickname": senderNickname };
        // send the message to the client side
        io.emit('message', message);
    });
    socket.on('disconnect', function () {
        console.log(' user has left ');
        socket.broadcast.emit("userdisconnect", " user has left ");
    });
});
server.listen(3000, function () {
    console.log('Node app is running on port 3000');
});
