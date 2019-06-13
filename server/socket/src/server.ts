import * as fs from "fs";
import * as Dotenv from "dotenv";
import * as express from "express";
//@ts-ignore
import {Socket} from "socket.io";
import {App as MixamoRunnerSerever} from "./App";
import {BadRequestExceptoin} from "./Exceptions/BadRequestExceptoin";
import {GameSocketEvents as GSE} from "./GameSocket/GameSocketEvents";
import {Player} from "./Entities/Player";
import {NewRoadInitRequest} from "./RequestMessageClasses/NewRoadInitRequest";

const ENV = Dotenv.parse(fs.readFileSync(__dirname + '/../.env'));
const app = express();

app.set("port", 3000);
let http = require("http").Server(app);
let io = require("socket.io")(http);

let MRS: MixamoRunnerSerever = MixamoRunnerSerever.getInstance();

io.on(GSE.CONNECTION, (socket: Socket) =>
{
    let currentPlayer = new Player();
    currentPlayer.setName('unknown 1');

    console.log(GSE.CONNECTION, currentPlayer);

    // идентификация подключенного игрока
    socket.on(GSE.PLAYER_INIT, (data: any) =>
    {
        try {
            currentPlayer.setUID(data.UID);
            currentPlayer.setName(data.name);
            currentPlayer.setPosition(data.position);
            currentPlayer.setRotation(data.rotation);

            MRS.playerConnected(currentPlayer);
        } catch (e) {
            console.error(e.message);
        }

        console.log(GSE.PLAYER_INIT, data);
    });

    // создание нового забега
    socket.on(GSE.NEW_ROAD_INIT, (data: any) =>
    {
        try {
            let newRoadInit = new NewRoadInitRequest(data);
            if (!newRoadInit.validate())
                throw new BadRequestExceptoin(newRoadInit.getErrorsMessage());

            MRS.newRoad(data, currentPlayer);
        } catch (e) {
            console.error(e.message);
        }

        console.log(GSE.NEW_ROAD_INIT, data);
    });

    socket.on(GSE.PLAYER_MOVE, (data: any) =>
    {
        try {
            currentPlayer.setPosition(data);
        } catch (e) {
            console.error(e.message);
        }

        console.log(GSE.PLAYER_MOVE, data);
    });

    socket.on(GSE.PLAYER_ROTATE, (data: any) =>
    {
        try {
            currentPlayer.setRotation(data);
        } catch (e) {
            console.error(e.message);
        }

        console.log(GSE.PLAYER_ROTATE, data);
    });

    socket.on(GSE.DISCONNECT, () =>
    {
        try {
            MRS.playerDisconnected(currentPlayer);
        } catch (e) {
            console.error(e.message);
        }

        console.log(GSE.DISCONNECT, currentPlayer);
    });
});

const server = http.listen(3000, function() {
    console.log("listening on *:3000");
});
