import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from db import get_db_connection
from mailer import setup_mail

load_dotenv()

app = Flask(__name__)
# Allow frontend dev origins (Vite may pick a different port)
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174"
        ]
    }
}, supports_credentials=True)

# Initialize Mail
mail = setup_mail(app)

# Initialize Database
get_db_connection()

# Register Blueprints
from routes.auth import auth_bp
from routes.donors import donors_bp
from routes.requests import requests_bp
from routes.admin import admin_bp

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(donors_bp, url_prefix="/api/donors")
app.register_blueprint(requests_bp, url_prefix="/api/requests")
app.register_blueprint(admin_bp, url_prefix="/api/admin")

@app.route("/api/health", methods=["GET"])
def health_check():
    return {"status": "ok"}, 200
@app.after_request
def add_headers(response):
    # Do not set COOP/COEP in dev to avoid blocking Firebase popup flows.
    return response
if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG", False), host="0.0.0.0", port=5000)
