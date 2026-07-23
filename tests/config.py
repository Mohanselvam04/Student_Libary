import os

# Find the path to the .env file in the backend folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, "backend", ".env")

# Default port
PORT = 8001

# Parse .env if it exists
if os.path.exists(ENV_PATH):
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                if key.strip() == "PORT":
                    try:
                        PORT = int(val.strip())
                    except ValueError:
                        pass

BASE_URL = f"http://localhost:{PORT}/api/auth"
