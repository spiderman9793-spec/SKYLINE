import asyncio
import json
import os
import subprocess
import sys
import tempfile
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

import edge_tts

VOICE = "hi-IN-SwaraNeural"
PORT = int(os.environ.get("PORT", "8000"))


class SkylineHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/api/speak":
            self.send_error(404)
            return

        length = int(self.headers.get("Content-Length", 0))
        try:
            payload = json.loads(self.rfile.read(length))
            text = str(payload.get("text", "")).strip()[:300]
            if not text:
                raise ValueError("Text is required")
        except (ValueError, json.JSONDecodeError):
            self.send_error(400, "A text value is required")
            return

        audio_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as audio_file:
                audio_path = audio_file.name
            subprocess.run([
                sys.executable,
                "-m",
                "edge_tts",
                "--voice",
                VOICE,
                "--rate",
                "-10%",
                "--pitch",
                "+5Hz",
                "--text",
                text,
                "--write-media",
                audio_path,
            ], check=True, capture_output=True, text=True)
            with open(audio_path, "rb") as audio_file:
                audio = audio_file.read()
        except Exception as error:
            self.send_error(502, f"Speech generation failed: {error}")
            return
        finally:
            if audio_path and os.path.exists(audio_path):
                os.remove(audio_path)

        self.send_response(200)
        self.send_header("Content-Type", "audio/mpeg")
        self.send_header("Content-Length", str(len(audio)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(audio)


if __name__ == "__main__":
    print(f"Skyline voice server running at http://localhost:{PORT}")
    print(f"Using Microsoft Edge voice: {VOICE}")
    ThreadingHTTPServer(("localhost", PORT), SkylineHandler).serve_forever()
