const WebSocket = require("ws").Server;
const PLAYERS = Object.freeze({ PLAYER_X: "PLAYER_X", PLAYER_O: "PLAYER_O" });

const startwebSocketServer = (port) => {
  const socket = new WebSocket({ port: port });
  socket.on("listening", (ws) => {
    console.log("WebSocket server is Listening on port", port);
  });

  let isPlayerX = true;
  const players = {};
  let closedConnectionName;

  socket.on("connection", (ws) => {
    try {
      let clientSize = socket.clients.size;
      console.log("initial clientSize", clientSize);
      if (!ws) return;
      ws.on("message", (message) => {
        message = JSON.parse(message);
        if (message.type === "name") {
          //DEFINING SOCKET CONNECTION

          if (isPlayerX && clientSize % 2 !== 0) {
            ws.playerName = PLAYERS.PLAYER_X;
            ws.connectionNumber = `${clientSize} connection`;
            players[`${clientSize} connection`] = [];
            players[`${clientSize} connection`].push(ws);
            isPlayerX = false;
          } else if (
            isPlayerX &&
            clientSize % 2 === 0 &&
            closedConnectionName
          ) {
            //When existing playerX is reconnects
            ws.playerName = PLAYERS.PLAYER_X;
            ws.connectionNumber = closedConnectionName;
            players[closedConnectionName].push(ws);
            isPlayerX = false;
          } else if (!isPlayerX && clientSize % 2 == 0) {
            //When new PlayerO is connected
            ws.playerName = PLAYERS.PLAYER_O;
            ws.connectionNumber = `${clientSize - 1} connection`;
            if (players[`${clientSize - 1} connection`])
              players[`${clientSize - 1} connection`].push(ws);
            isPlayerX = true;
          } else if (
            !isPlayerX &&
            clientSize % 2 !== 0 &&
            closedConnectionName
          ) {
            //When exisiting PlayerO reconnects
            ws.playerName = PLAYERS.PLAYER_O;
            ws.connectionNumber = closedConnectionName;
            players[closedConnectionName].push(ws);
            isPlayerX = true;
          } else if (!isPlayerX && clientSize % 2 !== 0) {
            //When exisiting PlayerO disconnects and clientsize is odd then assign new connection for it
            ws.playerName = PLAYERS.PLAYER_X;
            ws.connectionNumber = `${clientSize} connection`;
            players[`${clientSize} connection`] = [];
            players[`${clientSize} connection`].push(ws);
            isPlayerX = false;
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
          console.log("players", Object.keys(players));
          return;
        }

        socket.clients.forEach((client) => {
          let findClientToSendData;
          const { connectionNumber } = ws;

          if (!connectionNumber) return;

          //PLAYERS CAN PLAY ONLY IN PAIR 2,4,6....
          if (players?.[connectionNumber]?.length % 2 !== 0) return;

          if (connectionNumber === client.connectionNumber) {
            const index = players[connectionNumber]?.indexOf(ws);

            if (index !== -1) {
              findClientToSendData = players[connectionNumber][1 - index];
            }
          }

          //sending data to eachother not to themselves
          if (findClientToSendData) {
            if (message.type === "isPair") {
              client.send(
                JSON.stringify({
                  name: findClientToSendData.playerName,
                  type: "isPair",
                  data: {
                    isPair: players[connectionNumber]?.length % 2 === 0,
                  },
                })
              );
            }

            if (message.type === "move") {
              console.log("move", findClientToSendData.playerName);
              client.send(
                JSON.stringify({
                  name: findClientToSendData.playerName,
                  type: "move",
                  data: {
                    PLAYER_O: message.data.PLAYER_O,
                    PLAYER_X: message.data.PLAYER_X,
                  },
                })
              );
            }

            if (message.type === "turn") {
              client.send(
                JSON.stringify({
                  name: findClientToSendData.playerName,
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
                  name: findClientToSendData.playerName,
                  type: "endGame",
                  data: { isDraw: message.data.isDraw },
                })
              );
            }
          }
        });
      });

      ws.on("close", () => {
        clientSize = socket.clients.size;
        //When Client is closed then also remove player from playersObj
        Object.keys(players).forEach((key) => {
          const index = players[key].findIndex((player) => ws === player);
          if (index !== -1) {
            closedConnectionName = key;
            players[key].splice(index, 1);
            socket.clients.forEach((client) => {
              //This is the case to handle when user reconnects or disconnects refresh the state of the game
              if (client?.connectionNumber === closedConnectionName) {
                client.send(
                  JSON.stringify({
                    type: "disconnect",
                    data: { isPair: clientSize % 2 === 0 },
                  })
                );
              }
            });
          }

          if (players[key].length === 0) {
            delete players[key];
            closedConnectionName = null;
          }
        });

        isPlayerX = ws.playerName === PLAYERS.PLAYER_X;

        //when no players exists then new player is assign as PlayerX
        if (Object.keys(players).length <= 0) {
          isPlayerX = true;
        }
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
    } catch (error) {
      console.log("Error on websocket when connecting", error);
    }
  });
};

const PORTNO = 5501;
startwebSocketServer(PORTNO);
