from flask import Blueprint, request, jsonify
from db import get_db
from functools import wraps
from datetime import datetime, timedelta
from bson import ObjectId
from firebase_auth import verify_firebase_token

admin_bp = Blueprint("admin", __name__)

def verify_admin(f):
    """Decorator to verify an authenticated user."""
    @verify_firebase_token
    @wraps(f)
    def decorated_function(*args, **kwargs):
        return f(*args, **kwargs)
    
    return decorated_function

# ===== ANALYTICS ROUTES =====

@admin_bp.route("/stats/bloodtypes", methods=["GET"])
def get_bloodtypes_stats():
    """Get blood type distribution among donors"""
    try:
        db = get_db()
        pipeline = [
            {
                "$group": {
                    "_id": "$bloodType",
                    "count": {"$sum": 1}
                }
            },
            {
                "$sort": {"_id": 1}
            },
            {
                "$project": {
                    "bloodType": "$_id",
                    "count": 1,
                    "_id": 0
                }
            }
        ]
        
        result = list(db["donors"].aggregate(pipeline))
        return jsonify({"data": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/stats/locations", methods=["GET"])
def get_locations_stats():
    """Get donor count by location/area"""
    try:
        db = get_db()
        pipeline = [
            {
                "$group": {
                    "_id": "$locality",
                    "count": {"$sum": 1}
                }
            },
            {
                "$sort": {"count": -1}
            },
            {
                "$limit": 20
            },
            {
                "$project": {
                    "area": "$_id",
                    "count": 1,
                    "_id": 0
                }
            }
        ]
        
        result = list(db["donors"].aggregate(pipeline))
        return jsonify({"data": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/stats/requests-over-time", methods=["GET"])
def get_requests_over_time():
    """Get blood requests count per day for last 30 days"""
    try:
        db = get_db()
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        pipeline = [
            {
                "$match": {
                    "createdAt": {"$gte": thirty_days_ago}
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": "$createdAt"
                        }
                    },
                    "count": {"$sum": 1}
                }
            },
            {
                "$sort": {"_id": 1}
            },
            {
                "$project": {
                    "date": "$_id",
                    "count": 1,
                    "_id": 0
                }
            }
        ]
        
        result = list(db["blood_requests"].aggregate(pipeline))
        return jsonify({"data": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/stats/status-breakdown", methods=["GET"])
def get_status_breakdown():
    """Get blood requests breakdown by status"""
    try:
        db = get_db()
        pipeline = [
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1}
                }
            },
            {
                "$project": {
                    "status": "$_id",
                    "count": 1,
                    "_id": 0
                }
            }
        ]
        
        result = list(db["blood_requests"].aggregate(pipeline))
        return jsonify({"data": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===== QUERY DATABASE ROUTES =====

@admin_bp.route("/areas", methods=["GET"])
def get_areas():
    """Get list of unique areas/localities"""
    try:
        db = get_db()
        areas = db["donors"].distinct("locality")
        return jsonify({"areas": sorted(areas)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/query", methods=["GET"])
def query_donors():
    """Query donors with filters"""
    try:
        db = get_db()
        filters = {}
        
        # Blood Type filter
        blood_type = request.args.get("bloodType")
        if blood_type and blood_type != "All":
            filters["bloodType"] = blood_type
        
        # Area/Locality filter
        area = request.args.get("area")
        if area:
            filters["locality"] = area
        
        # Age Range filter
        age_range = request.args.get("ageRange")
        if age_range and age_range != "All":
            if age_range == "18-25":
                filters["age"] = {"$gte": 18, "$lte": 25}
            elif age_range == "26-35":
                filters["age"] = {"$gte": 26, "$lte": 35}
            elif age_range == "36-50":
                filters["age"] = {"$gte": 36, "$lte": 50}
            elif age_range == "50+":
                filters["age"] = {"$gte": 50}
        
        # Donor Status filter
        donor_status = request.args.get("donorStatus")
        if donor_status and donor_status != "All donors":
            if donor_status == "Smokers":
                filters["smoker"] = True
            elif donor_status == "Non-smokers":
                filters["smoker"] = False
            elif donor_status == "Recent tattoos":
                filters["recentTattoos"] = True
        
        # Consent to contact filter
        consent_only = request.args.get("consentOnly")
        if consent_only == "true":
            filters["consentCheckbox"] = True
        
        # Execute query
        results = list(db["donors"].find(filters).limit(100))
        
        # Convert ObjectId to string
        for donor in results:
            donor["_id"] = str(donor["_id"])
        
        return jsonify({"donors": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/dashboard", methods=["GET"])
def get_dashboard():
    """Get admin dashboard stats"""
    try:
        db = get_db()
        
        stats = {
            "total_donors": db["donors"].count_documents({}),
            "total_requests": db["blood_requests"].count_documents({}),
            "pending_requests": db["blood_requests"].count_documents({"status": "pending"}),
            "total_users": db["users"].count_documents({})
        }
        
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/admins", methods=["GET"])
def get_admin_table():
    """Get seeded admin records with hospital and completed request links."""
    try:
        db = get_db()
        admins = list(db["admins"].find({}))

        for admin in admins:
            admin["_id"] = str(admin["_id"])
            if admin.get("completedRequestId") is not None:
                admin["completedRequestId"] = str(admin["completedRequestId"])
            admin["completedRequestIds"] = [str(request_id) for request_id in admin.get("completedRequestIds", [])]

        return jsonify({"admins": admins}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
