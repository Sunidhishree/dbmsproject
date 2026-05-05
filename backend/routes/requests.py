from flask import Blueprint, request, jsonify
from db import get_db
from functools import wraps
from datetime import datetime
from bson import ObjectId
from firebase_auth import verify_firebase_token
from mailer import (
    send_request_match_email,
    send_request_status_email,
    send_assigned_donor_email,
)

requests_bp = Blueprint("requests", __name__)

BLOOD_COMPATIBILITY = {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"],
}


def get_compatible_donor_types(requested_blood_type):
    blood_type = (requested_blood_type or "").strip().upper()
    return BLOOD_COMPATIBILITY.get(blood_type, [blood_type] if blood_type else [])


def find_matching_donors(db, request_data):
    compatible_types = get_compatible_donor_types(request_data.get("bloodType"))
    if not compatible_types:
        return []

    hospital_text = f"{request_data.get('hospitalName', '')} {request_data.get('hospitalLocation', '')}".lower()
    donors = list(db["donors"].find({
        "bloodType": {"$in": compatible_types},
        "consentCheckbox": True,
        "email": {"$exists": True, "$ne": ""}
    }))

    if not hospital_text:
        return donors

    matched = []
    for donor in donors:
        locality = str(donor.get("locality", "")).strip().lower()
        city = str(donor.get("city", "")).strip().lower()
        pin_code = str(donor.get("pinCode", "")).strip().lower()

        if any(token and token in hospital_text for token in (locality, city, pin_code)):
            matched.append(donor)

    return matched or donors

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

        request_data["_id"] = result.inserted_id
        request_data["request_id"] = str(result.inserted_id)

        notified_donors = 0
        matched_donors = find_matching_donors(db, request_data)
        for donor in matched_donors:
            donor_email = donor.get("email")
            donor_name = donor.get("fullName") or donor.get("name") or "Donor"
            if not donor_email:
                continue
            if send_request_match_email(donor_email, donor_name, request_data):
                notified_donors += 1

        return jsonify({
            "request_id": str(result.inserted_id),
            "message": "Request created successfully",
            "donors_notified": notified_donors
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@requests_bp.route("/<request_id>", methods=["PATCH"])
@verify_admin
def update_request_status(request_id):
    """Update blood request status (admin only)"""
    try:
        data = request.json
        status = data.get("status")
        assigned_donor_uid = data.get("assignedDonorUid") or data.get("assigned_donor_uid")
        
        if status not in ["pending", "approved", "rejected", "completed"]:
            return jsonify({"error": "Invalid status"}), 400
        
        db = get_db()
        request_doc = db["blood_requests"].find_one({"_id": ObjectId(request_id)})

        if not request_doc:
            return jsonify({"error": "Request not found"}), 404

        update_fields = {"status": status, "updatedAt": datetime.utcnow()}
        if assigned_donor_uid:
            update_fields["assignedDonorUid"] = assigned_donor_uid

        result = db["blood_requests"].update_one(
            {"_id": ObjectId(request_id)},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Request not found"}), 404

        users_collection = db["users"]
        requester = users_collection.find_one({"uid": request_doc.get("uid")})
        requester_name = requester.get("name") if requester else request_doc.get("patientName", "Requester")
        requester_email = requester.get("email") if requester else request_doc.get("email")

        if requester and requester_email and status in ["approved", "rejected", "completed", "pending"]:
            send_request_status_email(
                requester_email,
                requester_name or "Requester",
                request_doc,
                status,
                assigned_donor_name=None
            )

        assigned_donor = None
        if assigned_donor_uid:
            assigned_donor = db["donors"].find_one({"uid": assigned_donor_uid})
            if assigned_donor and assigned_donor.get("email"):
                send_assigned_donor_email(
                    assigned_donor["email"],
                    assigned_donor.get("fullName") or "Donor",
                    request_doc,
                    requester_name=requester_name
                )
        
        return jsonify({
            "message": "Status updated successfully",
            "assigned_donor_notified": bool(assigned_donor and assigned_donor.get("email"))
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@requests_bp.route("/donor/all", methods=["GET"])
@verify_admin
def get_all_donors():
    """Get all registered donors (admin only)"""
    try:
        db = get_db()
        donors = list(db["donors"].find({}))
        
        # Convert ObjectId to string and add user info
        for donor in donors:
            donor["_id"] = str(donor["_id"])
        
        return jsonify({"donors": donors}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@requests_bp.route("/message/send", methods=["POST"])
@verify_admin
def send_message():
    """Send a message from admin to a donor/user"""
    try:
        data = request.json
        recipient_uid = data.get("recipient_uid")
        message_text = data.get("message")
        request_id = data.get("request_id")  # Optional: link to specific request
        
        if not recipient_uid or not message_text:
            return jsonify({"error": "recipient_uid and message are required"}), 400
        
        db = get_db()
        
        # Create message document
        message_doc = {
            "recipient_uid": recipient_uid,
            "sender_uid": request.user.get("uid"),
            "sender_name": request.user.get("name", "Admin"),
            "message": message_text,
            "request_id": request_id,
            "read": False,
            "createdAt": datetime.utcnow()
        }
        
        result = db["messages"].insert_one(message_doc)
        
        return jsonify({
            "message_id": str(result.inserted_id),
            "status": "sent"
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@requests_bp.route("/message/my-messages", methods=["GET"])
@verify_firebase_token
def get_my_messages():
    """Get all messages for current user"""
    try:
        uid = request.user.get("uid")
        db = get_db()
        
        messages = list(db["messages"].find({"recipient_uid": uid}).sort("createdAt", -1))
        
        # Convert ObjectId to string
        for msg in messages:
            msg["_id"] = str(msg["_id"])
        
        return jsonify({"messages": messages}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@requests_bp.route("/message/<message_id>/read", methods=["PATCH"])
@verify_firebase_token
def mark_message_read(message_id):
    """Mark message as read"""
    try:
        db = get_db()
        
        result = db["messages"].update_one(
            {"_id": ObjectId(message_id)},
            {"$set": {"read": True}}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Message not found"}), 404
        
        return jsonify({"message": "Message marked as read"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
