"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Dotenv = require("dotenv");
const express = require("express");
const ENV = Dotenv.parse(fs.readFileSync(__dirname + '/../.env'));
const app = express();
let http = require('http'), server = http.createServer(app), io = require('socket.io').listen(server);
app.get('/', (req, res) => {
    res.send('Chat Server is running on port 3000');
});
io.on('connection', (socket) => {
    console.log('user connected');
    socket.on('join', function (userNickname) {
        console.log(userNickname + " : has joined the chat ");
        socket.broadcast.emit('userjoinedthechat', userNickname + " : has joined the chat ");
    });
    socket.on('messagedetection', (senderNickname, messageContent) => {
        console.log(senderNickname + " :" + messageContent);
        let message = { "message": messageContent, "senderNickname": senderNickname };
        io.emit('message', message);
    });
    socket.on('disconnect', function () {
        console.log(' user has left ');
        socket.broadcast.emit("userdisconnect", " user has left ");
    });
});
server.listen(3000, () => {
    console.log('Node app is running on port 3001');
});
//# sourceMappingURL=server.js.map