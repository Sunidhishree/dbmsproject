from flask import Blueprint, request, jsonify
from db import get_db
from functools import wraps
from datetime import datetime
from bson import ObjectId
from firebase_auth import verify_firebase_token

requests_bp = Blueprint("requests", __name__)

def verify_admin(f):
    """Decorator to verify an authenticated user."""
    @verify_firebase_token
    @wraps(f)
    def decorated_function(*args, **kwargs):
        return f(*args, **kwargs)
    
    return decorated_function

@requests_bp.route("/all", methods=["GET"])
@verify_admin
def get_all_requests():
    """Get all blood requests (admin only)"""
    try:
        db = get_db()
        blood_requests = list(db["blood_requests"].find({}))
        
        # Convert ObjectId to string
        for req in blood_requests:
            req["_id"] = str(req["_id"])
        
        return jsonify({"requests": blood_requests}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@requests_bp.route("/mine", methods=["GET"])
@verify_firebase_token
def get_my_requests():
    """Get all blood requests made by current user"""
    try:
        uid = request.user.get("uid")
        db = get_db()
        blood_requests = list(db["blood_requests"].find({"uid": uid}).sort("createdAt", -1))
        
        # Convert ObjectId to string
        for req in blood_requests:
            req["_id"] = str(req["_id"])
        
        return jsonify({"requests": blood_requests}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@requests_bp.route("/create", methods=["POST"])
@verify_firebase_token
def create_request():
    """Create a blood request"""
    try:
        data = request.json
        uid = request.user.get("uid")
        
        db = get_db()
        users_collection = db["users"]
        
        # Get user info
        user = users_collection.find_one({"uid": uid})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        request_data = {
            "uid": uid,
            "email": user["email"],
            "patientName": data.get("patientName"),
            "contactNumber": data.get("contactNumber"),
            "bloodType": data.get("bloodType"),
            "unitsRequired": data.get("unitsRequired"),
            "hospitalName": data.get("hospitalName"),
            "hospitalLocation": data.get("hospitalLocation"),
            "urgency": data.get("urgency", "Planned Surgery"),
            "notes": data.get("notes", ""),
            "createdAt": datetime.utcnow(),
            "status": "pending"
        }
        
        result = db["blood_requests"].insert_one(request_data)
        return jsonify({"request_id": str(result.inserted_id), "message": "Request created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@requests_bp.route("/<request_id>", methods=["PATCH"])
@verify_admin
def update_request_status(request_id):
    """Update blood request status (admin only)"""
    try:
        data = request.json
        status = data.get("status")
        
        if status not in ["pending", "approved", "rejected", "completed"]:
            return jsonify({"error": "Invalid status"}), 400
        
        db = get_db()
        result = db["blood_requests"].update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {"status": status, "updatedAt": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Request not found"}), 404
        
        return jsonify({"message": "Status updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
