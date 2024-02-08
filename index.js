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
      let clientSize = socket.clients.size;
      console.log("initial clientSize", clientSize);
      if (!ws) return;
      ws.on("message", (message) => {
        // console.log("message: " + message);
        console.log("client socket size when messaging", socket.clients.size);
        message = JSON.parse(message);
        if (message.type === "name") {
          //DEFINING SOCKET CONNECTION

          console.log("isPlayerrx initally", isPlayerX);
          console.log("clientSize before name", clientSize);
          if (isPlayerX || clientSize % 2 !== 0) {
            ws.playerName = PLAYERS.PLAYER_X;
            ws.connectionNumber = `${clientSize} connection`;
            players[`${clientSize} connection`] = [];
            players[`${clientSize} connection`].push(ws);
            isPlayerX = false;
          } else {
            ws.playerName = PLAYERS.PLAYER_O;
            ws.connectionNumber = `${clientSize - 1} connection`;
            if (players[`${clientSize - 1} connection`])
              players[`${clientSize - 1} connection`].push(ws);
            isPlayerX = true;
          }

          socket.clients.forEach((client) => {
            if (client === ws) {
              console.log("when assigningName ws", ws.playerName);
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
          //PLAYERS CAN PLAY ONLY IN PAIR 2,4,6....
          console.log("after connection is established");
          const { connectionNumber } = client;

          if (connectionNumber) {
            if (players?.[connectionNumber]?.length % 2 !== 0) return;

            console.log("connectionNumber", connectionNumber);
            const index = players[connectionNumber]?.findIndex(
              (player) => player !== client
            );
            console.log("index for client", index);
            if (index !== -1) {
              findClientToSendData = players[connectionNumber][index];
            }
          }
          // Object.keys(players).find((key) => {
          //   if (players[key].includes(client)) {
          //     console.log("key", key);
          //     console.log("key", client.playerName);
          //     const index = players[key].findIndex(
          //       (player) => player !== client
          //     );
          //     console.log("Key", key);
          //     console.log("index for client", index);
          //     if (index !== -1) findClientToSendData = players[key][index];
          //   }
          // });
          console.log("findClientToSendData", findClientToSendData.playerName);
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
              console.log("message", message);
              console.log("playerName", ws.playerName);
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
        // clientSize = socket.clients.size;
        //When Client is closed then also remove player from playersObj
        Object.keys(players).forEach((key) => {
          const index = players[key].findIndex((player) => ws === player);
          if (index !== -1) players[key].splice(index, 1);
        });

        Object.keys(players).forEach((key) => {
          console.log("keys and length", key, players[key].length);
          if (players[key].length === 0) delete players[key];
        });

        console.log("clienSizee on close", clientSize);
        isPlayerX = ws.playerName === PLAYERS.PLAYER_X;
        console.log("isPlayerX", isPlayerX);
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
