"""
Firebase Admin SDK initialization for token verification.
Requires: serviceAccountKey.json in backend/ directory.

Get this file:
1. Firebase Console → Your Project → Settings (gear icon)
2. Service Accounts tab → Generate new private key
3. Save as 'serviceAccountKey.json' in this directory
"""

import firebase_admin
from firebase_admin import credentials, auth
import os

# Check if credentials file exists
cred_path = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')

if os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
else:
    print("[WARNING] serviceAccountKey.json not found. Firebase Admin features disabled.")
    print(f"Expected path: {cred_path}")
    print("Get this from: Firebase Console → Project Settings → Service Accounts → Generate Key")


def verify_token(token_string):
    """
    Verify Firebase ID token and return decoded token.
    
    Args:
        token_string: ID token from Authorization header
        
    Returns:
        dict: Decoded token with uid and other claims
        
    Raises:
        firebase_admin.auth.InvalidIdTokenError: If token is invalid
        firebase_admin.auth.ExpiredIdTokenError: If token is expired
    """
    try:
        decoded_token = auth.verify_id_token(token_string)
        return decoded_token
    except Exception as e:
        raise e
