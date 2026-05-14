import os
import environ
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

db_url = f"postgis://{env('DB_USER', default='postgres')}:{env('DB_PASSWORD', default='')}@{env('DB_HOST', default='localhost')}:{env('DB_PORT', default='5432')}/{env('DB_NAME', default='transporte')}"
print(f"Generated DB URL: {db_url}")
print(f"DB_PORT from env: {env('DB_PORT')}")
