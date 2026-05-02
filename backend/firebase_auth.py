from functools import wraps
import os

from flask import jsonify, request
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token




def verify_firebase_token(f):
    """Verify a Firebase ID token using Google's public certs."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"error": "Missing authorization header"}), 401

        try:
            id_token_value = auth_header.split(" ", 1)[1]
            # Read project ID from env at request time to avoid import-time ordering issues
            project_id = os.getenv("FIREBASE_PROJECT_ID", "githopper")
            decoded_token = id_token.verify_firebase_token(
                id_token_value,
                google_requests.Request(),
                audience=project_id,
            )
            if "uid" not in decoded_token:
                decoded_token["uid"] = decoded_token.get("user_id") or decoded_token.get("sub")
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            print(f"[Token Error] {e}")
            return jsonify({"error": "Invalid token", "details": str(e)}), 401

    return decorated_function