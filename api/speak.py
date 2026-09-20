import asyncio
import json
import tempfile
import os
from http.server import BaseHTTPRequestHandler

import edge_tts

VOICE = "hi-IN-SwaraNeural"


async def synthesize(text):
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as audio_file:
        audio_path = audio_file.name
    try:
        await edge_tts.Communicate(
            text,
            VOICE,
            rate="-10%",
            pitch="+5Hz",
        ).save(audio_path)
        with open(audio_path, "rb") as generated_audio:
            return generated_audio.read()
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(length))
            text = str(payload.get("text", "")).strip()[:600]
            if not text:
                raise ValueError("Text is required")
            audio = asyncio.run(synthesize(text))
        except (ValueError, json.JSONDecodeError) as error:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(error)}).encode())
            return
        except Exception as error:
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": f"Speech generation failed: {error}"}).encode())
            return

        self.send_response(200)
        self.send_header("Content-Type", "audio/mpeg")
        self.send_header("Content-Length", str(len(audio)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(audio)

    def do_GET(self):
        self.send_response(405)
        self.send_header("Allow", "POST")
        self.end_headers()
