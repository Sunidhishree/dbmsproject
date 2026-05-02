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

print("Clearing old mock data (preserving the real user 'tayichakrika2006@gmail.com')...")

# Don't delete the real user we just created!
users_col.delete_many({"email": {"$ne": "tayichakrika2006@gmail.com"}})
donors_col.delete_many({"fullName": {"$ne": "tayi chakrika"}})
requests_col.delete_many({})

mock_users = []
mock_donors = []
mock_requests = []

blood_types = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
cities = ["Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad", "Pune"]
statuses = ["pending", "approved", "rejected", "fulfilled"]
hospitals = ["Apollo Hospital", "Fortis Hospital", "Manipal Hospital", "Max Super Speciality", "Narayana Health"]
urgencies = ["normal", "urgent", "critical"]

first_names = ["Arjun", "Neha", "Rahul", "Priya", "Vikram", "Sneha", "Karan", "Pooja", "Rohan", "Anjali", "Aditya", "Riya", "Siddharth", "Aisha", "Kabir", "Meera", "Aarav", "Kiara"]
last_names = ["Sharma", "Verma", "Patel", "Singh", "Kumar", "Gupta", "Jain", "Desai", "Joshi", "Mehta"]

# Generate 20 Users and Donors
for i in range(20):
    uid = f"mock_uid_{i}"
    name = f"{random.choice(first_names)} {random.choice(last_names)}"
    email = f"{name.replace(' ', '.').lower()}@example.com"
    
    # Create User
    user = {
        "uid": uid,
        "email": email,
        "name": name,
        "role": "user",
        "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 100)),
        "profile_complete": True
    }
    mock_users.append(user)
    
    # Create Donor Profile
    donor = {
        "uid": uid,
        "email": email,
        "fullName": name,
        "phone": f"9{random.randint(100000000, 999999999)}",
        "age": random.randint(18, 55),
        "gender": random.choice(["Male", "Female"]),
        "bloodType": random.choice(blood_types),
        "address1": f"{random.randint(1, 100)}, Mock Street",
        "city": random.choice(cities),
        "state": "State",
        "pinCode": f"100{random.randint(100, 999)}",
        "locality": f"Sector {random.randint(1, 20)}",
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

# Generate 30 Blood Requests
for i in range(30):
    # Some requests by our mock users
    requester = random.choice(mock_users)
    status = random.choices(statuses, weights=[30, 40, 10, 20])[0] # more pending/approved
    
    request = {
        "uid": requester["uid"],
        "requesterName": requester["name"],
        "contactNumber": f"9{random.randint(100000000, 999999999)}",
        "patientName": f"{random.choice(first_names)} {random.choice(last_names)}",
        "bloodType": random.choice(blood_types),
        "unitsRequired": random.randint(1, 5),
        "hospitalName": random.choice(hospitals),
        "hospitalLocation": f"{random.choice(cities)} Main Road",
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
if mock_requests:
    requests_col.insert_many(mock_requests)

print(f"Successfully seeded database with:")
print(f"- {len(mock_users)} mock users")
print(f"- {len(mock_donors)} mock donors")
print(f"- {len(mock_requests)} mock blood requests")
print("Done!")
