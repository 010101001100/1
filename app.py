import asyncio
import websockets
import json
from pathlib import Path

# Store connected clients
CLIENTS = set()
# Store current images
IMAGES = []

async def register(websocket):
    CLIENTS.add(websocket)
    try:
        async for message in websocket:
            data = json.loads(message)
            if data["type"] == "images":
                global IMAGES
                IMAGES = data["images"]
                # Broadcast to all other clients
                websockets.broadcast(
                    CLIENTS - {websocket},
                    json.dumps({"type": "images", "images": IMAGES})
                )
    finally:
        CLIENTS.remove(websocket)

async def main():
    print("WebSocket server starting on ws://localhost:8080")
    async with websockets.serve(register, "localhost", 8080):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())