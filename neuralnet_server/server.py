"""Echo server using the asyncio API."""

import asyncio
from websockets.asyncio.server import serve
import json
# get neural network move
from model.neuralnet_websocket import get_ai_move


async def echo(websocket):
    if not websocket:
        return
    async for message in websocket:
        client_message = json.loads(message)
        if client_message["type"] == "playerMove":
            board_state = client_message["board"]
            move = get_ai_move(board_state)
            await websocket.send(json.dumps({"type": "aiMove", "move": move}))


async def main(PORT_NO):
    async with serve(echo, "localhost", PORT_NO) as server:
        print("Neural Network Websocket Server is running on", PORT_NO)
        await server.serve_forever()


PORT_NO = 8765
if __name__ == "__main__":
    asyncio.run(main(PORT_NO))
