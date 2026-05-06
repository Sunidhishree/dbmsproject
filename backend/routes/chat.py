import os
import json
from flask import Blueprint, request, jsonify
from db import get_db
from firebase_auth import verify_firebase_token
from datetime import datetime

chat_bp = Blueprint("chat", __name__)

# ─── Health Guidelines (system prompt) ───────────────────────────────────────
HEALTH_GUIDELINES = """You are the RitConnect Blood Donation Assistant. Help users find donors, check eligibility, and understand donation rules.

HEALTH RULES:
- Smoking: Doesn't disqualify you, but avoid it 24 hours before donation.
- Alcohol: Avoid for at least 24-48 hours before donation.
- Tattoos/Piercings: Must wait 6-12 months after getting one.
- Last Donation: Males need a 90-day gap; females need 120 days.
- Weight: Must be at least 45-50 kg.
- Hemoglobin: Must be at least 12.5 g/dL.
- Age: Must be between 18 and 65 years.

If a user asks about quitting smoking, alcohol, or any temporary condition, tell them the relevant waiting period.
If unsure, advise them to consult a doctor. Be friendly and concise."""

# ─── Database Helper Functions ────────────────────────────────────────────────
def _find_blood_donors(blood_type, location=None):
    db = get_db()
    query = {"bloodType": blood_type.upper(), "consentCheckbox": True}
    if location:
        query["$or"] = [
            {"city": {"$regex": location, "$options": "i"}},
            {"locality": {"$regex": location, "$options": "i"}},
            {"pinCode": {"$regex": location, "$options": "i"}}
        ]
    donors = list(db["donors"].find(query).limit(5))
    if not donors:
        return f"No donors found for blood type {blood_type.upper()}{' in ' + location if location else ''}."
    result = []
    for d in donors:
        result.append(f"- {d.get('fullName')} ({d.get('bloodType')}) in {d.get('locality', '')}, {d.get('city', '')}")
    return "Found donors:\n" + "\n".join(result)

def _check_donation_eligibility(uid):
    db = get_db()
    donor = db["donors"].find_one({"uid": uid})
    if not donor:
        return "You are not registered as a donor yet. Please complete your donor profile first."
    last_date_str = donor.get("lastDonationDate") or donor.get("last_donation_date")
    if not last_date_str:
        return "We don't have your last donation date. If you've never donated, you're likely eligible!"
    try:
        last_date = datetime.strptime(str(last_date_str)[:10], "%Y-%m-%d")
        days_passed = (datetime.utcnow() - last_date).days
        gender = donor.get("gender", "Male")
        required_days = 90 if gender == "Male" else 120
        if days_passed >= required_days:
            return f"Yes! Your last donation was {days_passed} days ago. Since you are {gender}, you are eligible (required gap: {required_days} days)."
        else:
            return f"Not yet. Your last donation was {days_passed} days ago. You need to wait {required_days - days_passed} more days."
    except Exception as e:
        return f"Could not calculate eligibility: {str(e)}"

def _get_blood_stats(city=None):
    db = get_db()
    req_match = {"hospitalLocation": {"$regex": city, "$options": "i"}} if city else {}
    don_match = {"city": {"$regex": city, "$options": "i"}} if city else {}
    requests_stats = list(db["blood_requests"].aggregate([
        {"$match": req_match}, {"$group": {"_id": "$bloodType", "count": {"$sum": 1}}}
    ]))
    donors_stats = list(db["donors"].aggregate([
        {"$match": don_match}, {"$group": {"_id": "$bloodType", "count": {"$sum": 1}}}
    ]))
    req_dict = {r["_id"]: r["count"] for r in requests_stats}
    don_dict = {d["_id"]: d["count"] for d in donors_stats}
    lines = ["Blood Supply Stats:"]
    all_types = set(list(req_dict.keys()) + list(don_dict.keys()))
    for bt in sorted(all_types):
        lines.append(f"  {bt}: {don_dict.get(bt, 0)} donors, {req_dict.get(bt, 0)} active requests")
    return "\n".join(lines) if len(lines) > 1 else "No data available."

# ─── Tool dispatcher (maps tool name → function) ──────────────────────────────
TOOL_DISPATCH = {
    "find_blood_donors": lambda args: _find_blood_donors(**args),
    "check_donation_eligibility": lambda args: _check_donation_eligibility(**args),
    "get_blood_stats": lambda args: _get_blood_stats(**args),
}

# ─── Groq tool definitions (JSON Schema) ─────────────────────────────────────
GROQ_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "find_blood_donors",
            "description": "Find blood donors matching a specific blood type and optional location.",
            "parameters": {
                "type": "object",
                "properties": {
                    "blood_type": {"type": "string", "description": "Blood type e.g. 'A+', 'O-'"},
                    "location": {"type": "string", "description": "Optional city or locality to filter by"}
                },
                "required": ["blood_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "check_donation_eligibility",
            "description": "Check if the current logged-in user is eligible to donate based on their last donation date stored in the database.",
            "parameters": {
                "type": "object",
                "properties": {
                    "uid": {"type": "string", "description": "The Firebase UID of the current user"}
                },
                "required": ["uid"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_blood_stats",
            "description": "Get live statistics on blood demand and donor availability.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "Optional city to filter statistics"}
                },
                "required": []
            }
        }
    }
]

# ─── Convert frontend history format to Groq/OpenAI format ───────────────────
def convert_history(history):
    """Convert {'role': 'model', 'parts': ['text']} → {'role': 'assistant', 'content': 'text'}"""
    messages = []
    for h in history:
        role = "assistant" if h.get("role") == "model" else h.get("role", "user")
        parts = h.get("parts", [])
        content = parts[0] if parts else h.get("content", "")
        if content and "[System:" not in str(content):  # Skip injected system context
            messages.append({"role": role, "content": str(content)})
    return messages

# ─── Groq chat with tool calling ─────────────────────────────────────────────
def chat_with_groq(messages, uid):
    from groq import Groq
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        tools=GROQ_TOOLS,
        tool_choice="auto",
        max_tokens=1024
    )

    msg = response.choices[0].message

    # If the model wants to call a tool
    if msg.tool_calls:
        # Append the assistant's tool-call request to messages
        messages.append({"role": "assistant", "content": msg.content or "", "tool_calls": [
            {
                "id": tc.id,
                "type": "function",
                "function": {"name": tc.function.name, "arguments": tc.function.arguments}
            } for tc in msg.tool_calls
        ]})

        # Execute each tool call
        for tc in msg.tool_calls:
            fn_name = tc.function.name
            fn_args = json.loads(tc.function.arguments)

            # Auto-inject uid for eligibility check
            if fn_name == "check_donation_eligibility" and "uid" not in fn_args:
                fn_args["uid"] = uid

            print(f"[Tool Call] {fn_name}({fn_args})")
            fn_result = TOOL_DISPATCH[fn_name](fn_args)

            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": str(fn_result)
            })

        # Get the final response with tool results injected
        final_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=1024
        )
        return final_response.choices[0].message.content
    else:
        return msg.content

# ─── Gemini chat (primary, with tool calling) ─────────────────────────────────
def chat_with_gemini(history, uid, user_message):
    import google.generativeai as genai
    from datetime import datetime

    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

    # Wrap Python functions as tools
    def find_blood_donors(blood_type: str, location: str = None):
        return _find_blood_donors(blood_type, location)

    def check_donation_eligibility(uid: str):
        return _check_donation_eligibility(uid)

    def get_blood_stats(city: str = None):
        return _get_blood_stats(city)

    model = genai.GenerativeModel(
        model_name='gemini-1.5-flash',
        tools=[find_blood_donors, check_donation_eligibility, get_blood_stats],
        system_instruction=HEALTH_GUIDELINES
    )
    session = model.start_chat(history=history, enable_automatic_function_calling=True)
    response = session.send_message(f"[System: Current User UID is {uid}] {user_message}")
    return response.text

# ─── Route ────────────────────────────────────────────────────────────────────
@chat_bp.route("/", methods=["POST"])
@verify_firebase_token
def chat():
    try:
        data = request.json
        user_message = data.get("message", "").strip()
        history = data.get("history", [])
        uid = request.user.get("uid")

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # ── Try Gemini first ──
        response_text = None
        try:
            response_text = chat_with_gemini(history, uid, user_message)
            print("[AI] Used Gemini")
        except Exception as gemini_err:
            print(f"[AI] Gemini failed: {gemini_err}. Falling back to Groq...")
            # Build Groq messages from history + current message
            groq_messages = [{"role": "system", "content": HEALTH_GUIDELINES}]
            groq_messages += convert_history(history)
            groq_messages.append({"role": "user", "content": f"[Context: My UID is {uid}] {user_message}"})
            response_text = chat_with_groq(groq_messages, uid)
            print("[AI] Used Groq (fallback)")

        return jsonify({
            "response": response_text,
            "history": history + [
                {"role": "user", "parts": [user_message]},
                {"role": "model", "parts": [response_text]}
            ]
        })

    except Exception as e:
        print(f"[Chat Error] {str(e)}")
        return jsonify({"error": str(e)}), 500
