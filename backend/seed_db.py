import os
from datetime import datetime, timedelta
import random
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv("MONGODB_URI")
client = MongoClient(mongo_uri)
db = client[os.getenv("MONGODB_DB", "ritconnect")]

# Collections
users_col = db["users"]
donors_col = db["donors"]
requests_col = db["blood_requests"]
admins_col = db["admins"]

print("Clearing old mock data (preserving the real user 'tayichakrika2006@gmail.com')...")

# Don't delete the real user we just created!
users_col.delete_many({"email": {"$ne": "tayichakrika2006@gmail.com"}})
donors_col.delete_many({"fullName": {"$ne": "tayi chakrika"}})
requests_col.delete_many({})
admins_col.delete_many({})

mock_users = []
mock_donors = []
mock_requests = []
mock_admins = []

blood_types = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
cities = ["Bangalore"]  # Focus on Bangalore
statuses = ["pending", "approved", "rejected", "completed"]
hospitals = [
    "MS Ramaiah Medical College Hospital",
    "Ramaiah Hospitals - MSRMC",
    "Apollo Hospitals Bangalore",
    "Fortis Hospital Whitefield",
    "Manipal Hospital Bangalore",
    "Narayana Health Bangalore",
    "Sparsh Hospital MSR Nagar",
    "Altius Hospital",
    "Rainbow Hospitals"
]
urgencies = ["normal", "urgent", "critical"]

hospital_ids = {
    "MS Ramaiah Medical College Hospital": "HOSP-560054-001",
    "Ramaiah Hospitals - MSRMC": "HOSP-560054-002",
    "Apollo Hospitals Bangalore": "HOSP-560054-003",
    "Fortis Hospital Whitefield": "HOSP-560054-004",
    "Manipal Hospital Bangalore": "HOSP-560054-005",
    "Narayana Health Bangalore": "HOSP-560054-006",
    "Sparsh Hospital MSR Nagar": "HOSP-560054-007",
    "Altius Hospital": "HOSP-560054-008",
    "Rainbow Hospitals": "HOSP-560054-009",
}

# Bangalore 560054 localities (MSR Nagar area - Ramaiah Hospital area)
bangalore_560054_localities = [
    "MSR Nagar",
    "Mathikere",
    "Yeshwanthpur",
    "Rajajinagar",
    "Jnanabharathi",
    "Bangalore University",
    "Jalahalli",
    "Peenya",
    "Maruthi Nagar",
    "Bangalore Cantonment",
    "Trinity Park",
    "Bhadramma Garden",
    "Ganga Nagar"
]

# Bangalore 560054 street addresses (realistic for the area)
bangalore_streets = [
    "Tumkur Road",
    "Jnanabharathi Road",
    "MSR Nagar Road",
    "VV Puram Road",
    "Javagal Srinath Road",
    "Yeshwanthpur Main Road",
    "Rajajinagar 1st Block",
    "Jalahalli Main Road",
    "Mathikere Main Road",
    "Peenya Industrial Road",
    "High Grounds Road",
    "Hebbal Bypass Road",
    "Sankey Road",
    "Cantonment Road"
]

first_names = ["Arjun", "Neha", "Rahul", "Priya", "Vikram", "Sneha", "Karan", "Pooja", "Rohan", "Anjali", "Aditya", "Riya", "Siddharth", "Aisha", "Kabir", "Meera", "Aarav", "Kiara", "Rajesh", "Deepak", "Mohan", "Anita", "Sheetal", "Harish", "Suresh", "Veena", "Ramesh", "Pallavi"]
last_names = ["Sharma", "Verma", "Patel", "Singh", "Kumar", "Gupta", "Jain", "Desai", "Joshi", "Mehta", "Reddy", "Rao", "Krishnan", "Iyer", "Murthy", "Das", "Bhat", "Nair"]

# Generate 30 Users and Donors (increased for Bangalore focus)
for i in range(30):
    uid = f"mock_uid_{i}"
    name = f"{random.choice(first_names)} {random.choice(last_names)}"
    email = f"{name.replace(' ', '.').lower()}@example.com"
    
    # Create User
    user = {
        "uid": uid,
        "email": email,
        "name": name,
        "role": "user",
        "emailVerified": True,
        "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 100)),
        "profile_complete": True
    }
    mock_users.append(user)
    
    # Create Donor Profile with Bangalore 560054 data
    donor = {
        "uid": uid,
        "email": email,
        "fullName": name,
        "phone": f"9{random.randint(100000000, 999999999)}",
        "age": random.randint(18, 55),
        "gender": random.choice(["Male", "Female"]),
        "bloodType": random.choice(blood_types),
        "address1": f"{random.randint(1, 250)}, {random.choice(bangalore_streets)}",
        "city": "Bangalore",
        "state": "Karnataka",
        "pinCode": "560054",
        "locality": random.choice(bangalore_560054_localities),
        "weight": random.randint(55, 95),
        "hemoglobin": round(random.uniform(12.5, 16.5), 1),
        "existingDisease": "None",
        "smoker": random.choice([True, False, False, False]),
        "alcoholUse": random.choice([True, False, False]),
        "recentTattoos": False,
        "lastDonationDate": (datetime.utcnow() - timedelta(days=random.randint(100, 500))).strftime("%Y-%m-%d"),
        "consentCheckbox": True,
        "createdAt": datetime.utcnow() - timedelta(days=random.randint(1, 100))
    }
    mock_donors.append(donor)

# Generate 50 Blood Requests (increased for Bangalore focus with Ramaiah Hospital)
for i in range(50):
    # Some requests by our mock users
    requester = random.choice(mock_users)
    status = random.choices(statuses, weights=[30, 40, 10, 20])[0] # more pending/approved
    
    # Focus 60% of requests on Ramaiah Hospital
    if random.random() < 0.6:
        hospital = "MS Ramaiah Medical College Hospital"
        location = "MSR Nagar, Tumkur Road, Bangalore - 560054"
    else:
        hospital = random.choice(hospitals)
        location = f"{random.choice(bangalore_560054_localities)}, Bangalore - 560054"
    
    request = {
        "uid": requester["uid"],
        "requesterName": requester["name"],
        "contactNumber": f"9{random.randint(100000000, 999999999)}",
        "patientName": f"{random.choice(first_names)} {random.choice(last_names)}",
        "bloodType": random.choice(blood_types),
        "unitsRequired": random.randint(1, 5),
        "hospitalName": hospital,
        "hospitalLocation": location,
        "urgency": random.choice(["Planned Surgery", "Emergency", "Critical"]),
        "notes": "Surgery / Medical Emergency",
        "status": status,
        "createdAt": datetime.utcnow() - timedelta(days=random.randint(0, 30)),
        "updatedAt": datetime.utcnow() - timedelta(days=random.randint(0, 5))
    }
    mock_requests.append(request)

if mock_users:
    users_col.insert_many(mock_users)
if mock_donors:
    donors_col.insert_many(mock_donors)

request_insert_result = None
inserted_request_ids = []
if mock_requests:
    request_insert_result = requests_col.insert_many(mock_requests)
    inserted_request_ids = request_insert_result.inserted_ids

completed_request_ids = [
    str(request_id)
    for request_doc, request_id in zip(mock_requests, inserted_request_ids)
    if request_doc.get("status") == "completed"
]

if not completed_request_ids and inserted_request_ids:
    completed_request_ids = [str(inserted_request_ids[0])]

# Generate admin records linked to hospitals and completed request IDs
admin_templates = [
    {"name": "Dr. Ananya Rao", "email": "ananya.rao@ritconnect.local"},
    {"name": "Dr. Karthik Menon", "email": "karthik.menon@ritconnect.local"},
    {"name": "Dr. Priya Sharma", "email": "priya.sharma@ritconnect.local"},
]

for index, admin in enumerate(admin_templates):
    assigned_hospital = random.choice(hospitals)
    assigned_completed_id = random.choice(completed_request_ids) if completed_request_ids else None
    admin_doc = {
        "adminUid": f"admin_uid_{index}",
        "adminName": admin["name"],
        "adminEmail": admin["email"],
        "role": "admin",
        "hospitalId": hospital_ids[assigned_hospital],
        "hospitalName": assigned_hospital,
        "completedRequestId": assigned_completed_id,
        "completedRequestIds": [assigned_completed_id] if assigned_completed_id else [],
        "createdAt": datetime.utcnow() - timedelta(days=random.randint(1, 30))
    }
    mock_admins.append(admin_doc)

if mock_admins:
    admins_col.insert_many(mock_admins)

print(f"Successfully seeded database with:")
print(f"- {len(mock_users)} mock users")
print(f"- {len(mock_donors)} mock donors")
print(f"- {len(mock_requests)} mock blood requests")
print(f"- {len(mock_admins)} mock admins")
print("Done!")
