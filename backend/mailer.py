import os
from html import escape

from dotenv import load_dotenv
from flask_mail import Mail, Message

load_dotenv()

mail = Mail()


def _parse_bool(value, default=False):
    """Parse string environment variable to boolean."""
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def setup_mail(app):
    """Configure Flask-Mail using SMTP credentials from environment variables."""
    app.config["MAIL_SERVER"] = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    app.config["MAIL_PORT"] = int(os.getenv("SMTP_PORT", "465"))
    app.config["MAIL_USE_TLS"] = _parse_bool(os.getenv("SMTP_USE_TLS", "false"))
    app.config["MAIL_USE_SSL"] = _parse_bool(os.getenv("SMTP_USE_SSL", "true"))
    app.config["MAIL_USERNAME"] = os.getenv("SMTP_USERNAME", os.getenv("MAIL_USERNAME"))
    app.config["MAIL_PASSWORD"] = os.getenv("SMTP_PASSWORD", os.getenv("MAIL_PASSWORD"))
    app.config["MAIL_DEFAULT_SENDER"] = os.getenv(
        "FROM_EMAIL",
        os.getenv("SMTP_USERNAME", os.getenv("MAIL_USERNAME", "noreply@ritconnect.com"))
    )

    mail.init_app(app)
    return mail


def send_email(to, subject, body, html=None):
    """Send a plain text or HTML email."""
    try:
        msg = Message(subject=subject, recipients=[to], body=body, html=html)
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def _render_notification_email(title, headline, intro, details, closing, cta_label=None, cta_url=None):
    detail_rows = "".join(
        f"""
        <tr>
            <td style=\"padding: 10px 0; color: #6b7280; width: 180px; vertical-align: top;\">{escape(str(label))}</td>
            <td style=\"padding: 10px 0; color: #111827; font-weight: 600; vertical-align: top;\">{escape(str(value))}</td>
        </tr>
        """
        for label, value in details
        if value not in (None, "")
    )

    cta_html = ""
    if cta_label and cta_url:
        cta_html = f"""
            <div style=\"margin-top: 28px;\">
                <a href=\"{escape(cta_url)}\" style=\"display:inline-block;background:#C0152A;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;\">{escape(cta_label)}</a>
            </div>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <body style=\"margin:0;background:#f8fafc;font-family:Segoe UI, Arial, sans-serif;\">
        <div style=\"max-width:640px;margin:0 auto;padding:32px 16px;\">
            <div style=\"background:linear-gradient(135deg,#C0152A 0%,#8b1020 100%);color:#fff;padding:28px;border-radius:20px 20px 0 0;\">
                <div style=\"font-size:14px;letter-spacing:.08em;text-transform:uppercase;opacity:.9;\">{escape(title)}</div>
                <h1 style=\"margin:10px 0 0;font-size:30px;line-height:1.2;\">{escape(headline)}</h1>
            </div>
            <div style=\"background:#ffffff;padding:28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 20px 20px;\">
                <p style=\"margin:0 0 18px;color:#374151;line-height:1.7;\">{escape(intro)}</p>
                <table style=\"width:100%;border-collapse:collapse;margin-top:18px;\">{detail_rows}</table>
                {cta_html}
                <p style=\"margin:28px 0 0;color:#374151;line-height:1.7;\">{escape(closing)}</p>
                <p style=\"margin:20px 0 0;color:#6b7280;font-size:13px;\">RitConnect automated notification</p>
            </div>
        </div>
    </body>
    </html>
    """


def send_welcome_email(to_email, donor_name):
    subject = "Welcome to RitConnect"
    html_body = _render_notification_email(
        title="RitConnect Donor Welcome",
        headline=f"Welcome, {donor_name}",
        intro="Your donor profile is ready. You will now receive alerts when a compatible blood request is created.",
        details=[
            ("What you can do", "View alerts, update your profile, and respond when you are available"),
            ("Why it matters", "Matching donors quickly can save a life in minutes"),
        ],
        closing="Thank you for joining the donor network and helping make emergency blood support faster.",
        cta_label="Open Dashboard",
        cta_url=os.getenv("FRONTEND_URL", "http://localhost:5173")
    )

    body = (
        f"Welcome, {donor_name}\n\n"
        "Your donor profile is ready. You will now receive alerts when a compatible blood request is created.\n\n"
        "Thank you for joining the donor network."
    )
    return send_email(to_email, subject, body, html=html_body)


def send_request_match_email(to_email, donor_name, request_data):
    subject = f"Blood request alert for {request_data.get('bloodType', 'your blood type')}"
    units_required = request_data.get("unitsRequired")
    html_body = _render_notification_email(
        title="New matching blood request",
        headline=f"Hi {donor_name}, a nearby patient may need your help",
        intro="A blood request has been created that may match your donor profile. Please review the details below.",
        details=[
            ("Patient name", request_data.get("patientName", "Unknown")),
            ("Hospital", request_data.get("hospitalName", "Unknown")),
            ("Area", request_data.get("hospitalLocation", "Unknown")),
            ("Blood required", f"{request_data.get('bloodType', 'Unknown')} ({units_required} unit(s))"),
            ("Urgency", request_data.get("urgency", "Normal")),
            ("Contact number", request_data.get("contactNumber", "Not shared")),
            ("Notes", request_data.get("notes", "")),
        ],
        closing="If you are available and medically eligible, please respond from your donor dashboard or contact the hospital team directly."
    )

    body = (
        f"Hi {donor_name},\n\n"
        f"A blood request for {request_data.get('bloodType', 'unknown')} blood has been created at {request_data.get('hospitalName', 'the hospital')} in {request_data.get('hospitalLocation', 'your area')}.\n"
        f"Units needed: {units_required}\n"
        f"Urgency: {request_data.get('urgency', 'Normal')}\n\n"
        "Please check your donor dashboard if you are available to help."
    )
    return send_email(to_email, subject, body, html=html_body)


def send_request_status_email(to_email, recipient_name, request_data, status, assigned_donor_name=None):
    status = (status or "").lower()
    subjects = {
        "approved": "Your blood request has been accepted",
        "rejected": "Your blood request could not be fulfilled",
        "completed": "Your blood request has been completed",
        "pending": "Your blood request is under review",
    }
    subject = subjects.get(status, "Update on your blood request")

    status_messages = {
        "approved": "The admin team has reviewed your request and marked it as accepted. The request is now active and donors can be notified.",
        "rejected": "The request could not be fulfilled because the current donor requirements were not met. You can submit another request with updated details.",
        "completed": "The request has been completed and the blood support process is now closed.",
        "pending": "Your request is currently being reviewed by the admin team.",
    }

    details = [
        ("Patient name", request_data.get("patientName", "Unknown")),
        ("Hospital", request_data.get("hospitalName", "Unknown")),
        ("Area", request_data.get("hospitalLocation", "Unknown")),
        ("Blood required", f"{request_data.get('bloodType', 'Unknown')} ({request_data.get('unitsRequired', 'N/A')} unit(s))"),
        ("Current status", status.capitalize() if status else "Updated"),
    ]

    if assigned_donor_name:
        details.append(("Assigned donor", assigned_donor_name))

    html_body = _render_notification_email(
        title="Blood request status update",
        headline=f"Hello {recipient_name}, your request was updated",
        intro=status_messages.get(status, "Your blood request has been updated by the admin team."),
        details=details,
        closing="You can open your dashboard any time to review the latest request details and messages from the admin team.",
        cta_label="Open Dashboard",
        cta_url=os.getenv("FRONTEND_URL", "http://localhost:5173")
    )

    body = (
        f"Hello {recipient_name},\n\n"
        f"Your blood request status is now {status or 'updated'}.\n"
        f"Hospital: {request_data.get('hospitalName', 'Unknown')}\n"
        f"Area: {request_data.get('hospitalLocation', 'Unknown')}\n"
        f"Blood required: {request_data.get('bloodType', 'Unknown')}\n\n"
        f"{status_messages.get(status, 'Please check your dashboard for more details.')}"
    )
    return send_email(to_email, subject, body, html=html_body)


def send_assigned_donor_email(to_email, donor_name, request_data, requester_name=None):
    subject = "You have been assigned to a blood request"
    requester_label = requester_name or request_data.get("patientName") or "the requester"
    html_body = _render_notification_email(
        title="Donor assignment",
        headline=f"Hi {donor_name}, you have been assigned to help",
        intro=f"The admin team has selected you for a blood request from {requester_label}. Please review the request details below.",
        details=[
            ("Patient name", request_data.get("patientName", "Unknown")),
            ("Hospital", request_data.get("hospitalName", "Unknown")),
            ("Area", request_data.get("hospitalLocation", "Unknown")),
            ("Blood required", f"{request_data.get('bloodType', 'Unknown')} ({request_data.get('unitsRequired', 'N/A')} unit(s))"),
            ("Urgency", request_data.get("urgency", "Normal")),
        ],
        closing="If you are unable to respond, let the admin team know as soon as possible so another donor can be contacted.",
        cta_label="Open Dashboard",
        cta_url=os.getenv("FRONTEND_URL", "http://localhost:5173")
    )

    body = (
        f"Hi {donor_name},\n\n"
        f"You have been assigned to a blood request from {requester_label}.\n"
        f"Hospital: {request_data.get('hospitalName', 'Unknown')}\n"
        f"Area: {request_data.get('hospitalLocation', 'Unknown')}\n"
        f"Blood required: {request_data.get('bloodType', 'Unknown')}\n\n"
        "Please review the request details in your dashboard."
    )
    return send_email(to_email, subject, body, html=html_body)

