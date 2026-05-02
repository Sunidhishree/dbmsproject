from dotenv import load_dotenv
import os
from pymongo import MongoClient
import sys

load_dotenv()
uri = os.getenv("MONGODB_URI")
if not uri:
    print("No URI found in .env")
    sys.exit(1)

print(f"Connecting to: {uri.split('@')[-1]}")
try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("Successfully connected to MongoDB!")
    sys.exit(0)
except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)
