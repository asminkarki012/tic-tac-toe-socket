const WebSocket = require("ws").Server;
const PLAYERS = Object.freeze({ PLAYER_X: "PLAYER_X", PLAYER_O: "PLAYER_O" });

const startwebSocketServer = (port) => {
  const socket = new WebSocket({ port: port });
  socket.on("listening", (ws) => {
    console.log("WebSocket server is Listening on port", port);
  });

  let isPlayerX = true;

  socket.on("connection", (ws) => {
    ws.on("message", (message) => {
      message = JSON.parse(message);
      if (message.type === "name") {
        if (isPlayerX) {
          ws.playerName = PLAYERS.PLAYER_X;
          isPlayerX = false;
        } else {
          ws.playerName = PLAYERS.PLAYER_O;
          isPlayerX = true;
        }

        socket.clients.forEach((client) => {
          if (client === ws) {
            client.send(
              JSON.stringify({
                name: ws.playerName,
                type: "assignName",
              })
            );
          }
        });
        return;
      }

      socket.clients.forEach((client) => {
        if (client !== ws) {
          if (message.type === "move") {
            console.log("message", message);
            console.log("playerName", ws.playerName);
            client.send(
              JSON.stringify({
                name: ws.playerName,
                type: "move",
                data: {
                  PLAYER_O: message.data.PLAYER_O,
                  PLAYER_X: message.data.PLAYER_X,
                },
              })
            );
          }

          if (message.type === "turn") {
            console.log("message", message);
            console.log("playerName", ws.playerName);
            client.send(
              JSON.stringify({
                name: ws.playerName,
                type: "turn",
                data: {
                  isCircleTurn: message.data.isCircleTurn,
                },
              })
            );
          }

          if (message.type === "endGame") {
            client.send(
              JSON.stringify({
                name: ws.playerName,
                type: "endGame",
                data: { isDraw: message.data.isDraw },
              })
            );
          }
        }
      });
    });

    ws.on("close", () => {
      console.log(`a websocket connection is closed`);
    });

    ws.on("error", (error) => {
      console.log("WebSocket error ", error.message);
    });
    console.log("one more client connected");
  });
};

const PORTNO = 5501;
startwebSocketServer(PORTNO);
