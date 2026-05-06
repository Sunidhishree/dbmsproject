import os
from functools import wraps
from flask import jsonify, request
import firebase_admin
from firebase_admin import auth, credentials

# Initialize Firebase Admin SDK
cred_path = os.path.join(os.path.dirname(__file__), 'firebase-credentials.json')
if not firebase_admin._apps:
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        # Fallback to default initialization (uses GOOGLE_APPLICATION_CREDENTIALS)
        firebase_admin.initialize_app()

def verify_firebase_token(f):
    """Verify a Firebase ID token using the Firebase Admin SDK."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"error": "Missing authorization header"}), 401

        try:
            # Expected format: "Bearer <id_token>"
            parts = auth_header.split(" ")
            if len(parts) != 2 or parts[0].lower() != "bearer":
                return jsonify({"error": "Invalid authorization header format"}), 401
            
            id_token = parts[1]
            
            try:
                # Primary verification (matches backend credentials)
                decoded_token = auth.verify_id_token(id_token)
            except Exception as primary_err:
                # Fallback: Check if it's the 'githopper' project token
                # This is a development workaround for the student's project mismatch
                print(f"[Auth Warning] Primary verification failed: {primary_err}")
                print("[Auth] Attempting fallback verification for 'githopper'...")
                # We use the lower-level library to check the audience manually
                from google.oauth2 import id_token as google_id_token
                from google.auth.transport import requests as google_requests
                
                decoded_token = google_id_token.verify_firebase_token(
                    id_token,
                    google_requests.Request(),
                    audience="githopper"
                )
                print("[Auth] Fallback verification SUCCESS for 'githopper'")
            
            # Ensure uid is in the token
            if "uid" not in decoded_token:
                decoded_token["uid"] = decoded_token.get("user_id") or decoded_token.get("sub")
            
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            print(f"[Token Error] {str(e)}")
            return jsonify({"error": "Invalid token", "details": str(e)}), 401

    return decorated_function