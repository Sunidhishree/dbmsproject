from flask import Blueprint, request, jsonify
from db import get_db
from datetime import datetime
from firebase_auth import verify_firebase_token
from dotenv import load_dotenv
import os

load_dotenv()

# Admin codes list
ADMIN_CODES = [
    "HP098", "HP067", "HP214", "HP543", "HP879",
    "HP302", "HP761", "HP455", "HP128", "HP906"
]

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
        email_verified = data.get("emailVerified", False)

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
                        "emailVerified": email_verified,
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
            "emailVerified": email_verified,
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
                "emailVerified": request.user.get("emailVerified", False),
                "profile_complete": False,
                "source": "firebase-fallback"
            }), 200

        return jsonify({
            "user_id": str(user["_id"]),
            "uid": user["uid"],
            "email": user["email"],
            "name": user["name"],
            "role": user.get("role", "user"),
            "emailVerified": user.get("emailVerified", False),
            "profile_complete": user.get("profile_complete", False)
        }), 200

    except Exception as e:
        print(f"[Me ERROR] {e}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/verify-email", methods=["POST"])
@verify_firebase_token
def verify_email():
    """Mark user email as verified"""
    try:
        db = get_db()
        users = db["users"]
        uid = request.user.get("uid")

        result = users.update_one(
            {"uid": uid},
            {
                "$set": {
                    "emailVerified": True,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        if result.matched_count == 0:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "message": "Email verified successfully",
            "emailVerified": True
        }), 200

    except Exception as e:
        print(f"[Verify Email ERROR] {e}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/check-verification", methods=["GET"])
@verify_firebase_token
def check_verification():
    """Check if current user's email is verified"""
    try:
        db = get_db()
        users = db["users"]
        user = users.find_one({"uid": request.user.get("uid")})

        if not user:
            return jsonify({"emailVerified": False}), 200

        return jsonify({
            "emailVerified": user.get("emailVerified", False)
        }), 200

    except Exception as e:
        print(f"[Check Verification ERROR] {e}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/validate-admin-code", methods=["POST"])
def validate_admin_code():
    """Validate admin registration code"""
    try:
        data = request.json
        code = data.get("code", "").strip().upper()

        if not code:
            return jsonify({"error": "Admin code is required"}), 400

        if code in ADMIN_CODES:
            return jsonify({
                "valid": True,
                "message": "Admin code is valid"
            }), 200
        else:
            return jsonify({
                "valid": False,
                "error": "Invalid admin code. Please check and try again."
            }), 401

    except Exception as e:
        print(f"[Validate Admin Code ERROR] {e}")
        return jsonify({"error": str(e)}), 500