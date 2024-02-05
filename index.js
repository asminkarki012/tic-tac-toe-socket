const WebSocket = require("ws").Server;
const PLAYERS = Object.freeze({ PLAYER_X: "PLAYER_X", PLAYER_O: "PLAYER_O" });

const startwebSocketServer = (port) => {
  try {
    const socket = new WebSocket({ port: port });
    socket.on("listening", (ws) => {
      console.log("WebSocket server is Listening on port", port);
    });

    let isPlayerX = true;

    const players = {};
    let connectionCount = 1;
    socket.on("connection", (ws) => {
      const clientSize = socket.clients.size;
      ws.on("message", (message) => {
        message = JSON.parse(message);
        if (message.type === "name") {
          //DEFINING SOCKET CONNECTION
          if (isPlayerX) {
            ws.playerName = PLAYERS.PLAYER_X;
            isPlayerX = false;
            players[`${clientSize} connection`] = [];
            players[`${clientSize} connection`].push(ws);
          } else {
            ws.playerName = PLAYERS.PLAYER_O;
            isPlayerX = true;
            players[`${clientSize - 1} connection`].push(ws);
          }

          socket.clients.forEach((client) => {
            if (client === ws) {
              client.send(
                JSON.stringify({
                  name: ws.playerName,
                  type: "assignName",
                  data: {
                    numberOfConnectedPlayers:
                      players[`${connectionCount} connection`]?.length,
                  },
                })
              );
            }
          });
          // console.log("players", players);
          return;
        }

        socket.clients.forEach((client) => {
          const findClientToSendData = Object.keys(players).find((key) => {
            console.log("key", players[key]);
            if (players[key].includes(client)) {
              const index = players[key].findIndex(
                (player) => player !== client
              );
              if (index !== -1) return players[key][index];
            }
          });
          console.log("findClientToSendData", findClientToSendData);
          if (findClientToSendData) {
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
        //When Client is closed then also remove player from playersObj
        Object.keys(players).forEach((key) => {
          const index = players[key].indexOf(ws);
          if (index !== -1) players[key].splice(index, 1);
        });

        isPlayerX = ws.playerName === PLAYERS.PLAYER_X ? true : false;
        console.log(
          `a websocket connection is closed for player ${ws.playerName}`
        );
      });

      ws.on("error", (error) => {
        console.log("WebSocket error ", error.message);
      });

      console.log(
        `${clientSize} ${
          clientSize === 1 ? "client is" : "clients are"
        } connected`
      );
    });
  } catch (error) {
    console.error("error in socket server", error.message);
  }
};

const PORTNO = 5501;
startwebSocketServer(PORTNO);
