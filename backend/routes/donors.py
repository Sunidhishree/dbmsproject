from flask import Blueprint, request, jsonify
from db import get_db
from datetime import datetime
from mailer import send_email
from bson import ObjectId
from firebase_auth import verify_firebase_token

donors_bp = Blueprint("donors", __name__)

@donors_bp.route("/", methods=["GET"])
def get_donors():
    """Get all donors"""
    try:
        db = get_db()
        donors = list(db["donors"].find({}, {"_id": 1, "fullName": 1, "bloodType": 1, "locality": 1}))
        return jsonify({"donors": [{"id": str(d["_id"]), "name": d.get("fullName"), "blood_type": d.get("bloodType"), "location": d.get("locality")} for d in donors]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@donors_bp.route("/<donor_id>", methods=["GET"])
def get_donor(donor_id):
    """Get a specific donor profile"""
    try:
        db = get_db()
        donor = db["donors"].find_one({"_id": ObjectId(donor_id)})
        
        if not donor:
            return jsonify({"error": "Donor not found"}), 404
        
        donor["_id"] = str(donor["_id"])
        return jsonify(donor), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@donors_bp.route("/register", methods=["POST"])
@verify_firebase_token
def register_donor():
    """Register or update donor profile"""
    try:
        data = request.json
        uid = request.user.get("uid")
        
        db = get_db()
        users_collection = db["users"]
        donors_collection = db["donors"]
        
        # Get user info
        user = users_collection.find_one({"uid": uid})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        donor_data = {
            "uid": uid,
            "email": user["email"],
            "fullName": data.get("fullName"),
            "phone": data.get("phone"),
            "age": int(data.get("age", 0)),
            "gender": data.get("gender"),
            "bloodType": data.get("bloodType"),
            "address1": data.get("address1"),
            "city": data.get("city"),
            "state": data.get("state"),
            "pinCode": data.get("pinCode"),
            "locality": data.get("locality"),
            "weight": float(data.get("weight", 0)),
            "hemoglobin": float(data.get("hemoglobin", 0)),
            "existingDisease": data.get("existingDisease", ""),
            "smoker": data.get("smoker", False),
            "alcoholUse": data.get("alcoholUse", False),
            "recentTattoos": data.get("recentTattoos", False),
            "lastDonationDate": data.get("lastDonationDate"),
            "consentCheckbox": data.get("consentCheckbox", False),
            "createdAt": datetime.utcnow()
        }
        
        # Check if donor already exists
        existing_donor = donors_collection.find_one({"uid": uid})
        
        if existing_donor:
            # Update existing donor
            donors_collection.update_one({"uid": uid}, {"$set": donor_data})
            message = "Donor profile updated successfully"
        else:
            # Create new donor
            result = donors_collection.insert_one(donor_data)
            message = "Donor registered successfully"
            
            # Send welcome email
            welcome_email = f"""
Dear {donor_data['fullName']},

Welcome to RitConnect! You're now registered as a blood donor.

Your blood type: {donor_data['bloodType']}

We will contact you immediately if your blood type is needed for an urgent transfusion. Thank you for your valuable contribution to saving lives!

Best regards,
RitConnect Team
            """
            
            send_email(
                to=user["email"],
                subject="Welcome to RitConnect - Blood Donor Registration",
                body=welcome_email
            )
        
        # Update user profile_complete status
        users_collection.update_one({"uid": uid}, {"$set": {"profile_complete": True}})
        
        return jsonify({"message": message}), 200 if existing_donor else 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@donors_bp.route("/me", methods=["GET"])
@verify_firebase_token
def get_my_profile():
    """Get current user's donor profile"""
    try:
        uid = request.user.get("uid")
        db = get_db()
        donor = db["donors"].find_one({"uid": uid})
        
        if not donor:
            return jsonify({"error": "Donor profile not found"}), 404
        
        donor["_id"] = str(donor["_id"])
        return jsonify(donor), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

