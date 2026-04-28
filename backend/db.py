import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

_db_connection = None

def get_db_connection():
    """Get or create MongoDB connection"""
    global _db_connection
    if _db_connection is None:
        mongo_uri = os.getenv("MONGODB_URI")
        if not mongo_uri:
            raise ValueError("MONGODB_URI not set in environment variables")
        
        client = MongoClient(mongo_uri)
        _db_connection = client[os.getenv("MONGODB_DB", "ritconnect")]
    
    return _db_connection

def get_db():
    """Get the database instance"""
    return get_db_connection()
