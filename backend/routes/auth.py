from flask import Blueprint, request, jsonify
from db import get_db
from datetime import datetime
from firebase_auth import verify_firebase_token
from dotenv import load_dotenv
import os

load_dotenv()

auth_bp = Blueprint("auth", __name__)
@auth_bp.route("/register", methods=["POST"])
@verify_firebase_token
def register():
    """User registration endpoint - save user to MongoDB"""
    try:
        data = request.json
        print(f"[Register] Incoming data: {data}")

        uid = data.get("uid")
        email = data.get("email")
        name = data.get("name")
        role = data.get("role", "user")

        if not all([uid, email, name]):
            return jsonify({"error": "uid, email, and name are required"}), 400

        db = get_db()
        users = db["users"]

        existing = users.find_one({"uid": uid})
        if existing:
            result = users.update_one(
                {"uid": uid},
                {
                    "$set": {
                        "email": email,
                        "name": name,
                        "role": role,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            print(f"[Register] User updated: {uid}")
            return jsonify({
                "user_id": str(existing["_id"]),
                "message": "User updated successfully"
            }), 200

        user = {
            "uid": uid,
            "email": email,
            "name": name,
            "role": role,
            "created_at": datetime.utcnow(),
            "profile_complete": False
        }

        result = users.insert_one(user)
        print(f"[Register] User created: {result.inserted_id}")
        return jsonify({
            "user_id": str(result.inserted_id),
            "message": "User registered successfully"
        }), 201

    except Exception as e:
        print(f"[Register ERROR] {e}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/me", methods=["GET"])
@verify_firebase_token
def get_current_user():
    """Get current user profile from MongoDB"""
    try:
        db = get_db()
        users = db["users"]
        user = users.find_one({"uid": request.user.get("uid")})

        if not user:
            fallback_name = (
                request.user.get("name")
                or request.user.get("email", "")
                .split("@", 1)[0]
                or "User"
            )
            return jsonify({
                "user_id": request.user.get("uid"),
                "uid": request.user.get("uid"),
                "email": request.user.get("email"),
                "name": fallback_name,
                "role": request.user.get("role", "user"),
                "profile_complete": False,
                "source": "firebase-fallback"
            }), 200

        return jsonify({
            "user_id": str(user["_id"]),
            "uid": user["uid"],
            "email": user["email"],
            "name": user["name"],
            "role": user.get("role", "user"),
            "profile_complete": user.get("profile_complete", False)
        }), 200

    except Exception as e:
        print(f"[Me ERROR] {e}")
        return jsonify({"error": str(e)}), 500