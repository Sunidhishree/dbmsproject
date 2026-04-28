import os
from flask_mail import Mail, Message
from dotenv import load_dotenv

load_dotenv()

mail = Mail()

def setup_mail(app):
    """Configure Flask-Mail with Gmail SMTP settings"""
    app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 587))
    app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS", True)
    app.config["MAIL_USE_SSL"] = False
    app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
    app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
    app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_USERNAME", "noreply@ritconnect.com")
    
    mail.init_app(app)
    return mail

def send_email(to, subject, body, html=None):
    """Send a plain text or HTML email"""
    try:
        msg = Message(subject=subject, recipients=[to], body=body, html=html)
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def send_welcome_email(to_email, donor_name):
    """
    Send branded welcome email to new donor.
    
    Args:
        to_email: Recipient email address
        donor_name: Name of the donor
    """
    subject = "Welcome to RitConnect 🩸"
    
    # HTML email template with brand styling
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #f9fafb; }}
            .header {{ background: linear-gradient(135deg, #C0152A 0%, #a00a1f 100%); color: white; padding: 40px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 32px; font-weight: bold; }}
            .header p {{ margin: 10px 0 0 0; font-size: 14px; opacity: 0.9; }}
            .content {{ padding: 40px; background-color: white; }}
            .content h2 {{ color: #C0152A; margin-top: 0; }}
            .content p {{ line-height: 1.6; color: #374151; margin: 15px 0; }}
            .highlight {{ color: #C0152A; font-weight: bold; }}
            .cta-button {{ display: inline-block; background-color: #C0152A; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }}
            .stats {{ background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }}
            .stat-item {{ display: inline-block; margin: 0 15px; }}
            .stat-number {{ font-size: 24px; font-weight: bold; color: #C0152A; }}
            .stat-label {{ font-size: 12px; color: #6b7280; }}
            .footer {{ padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }}
            .footer a {{ color: #C0152A; text-decoration: none; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🩸 RitConnect</h1>
                <p>Every Drop Saves a Life</p>
            </div>
            
            <div class="content">
                <h2>Welcome, <span class="highlight">{donor_name}!</span></h2>
                
                <p>Thank you for registering as a blood donor on RitConnect. Your decision to donate is a life-saving act of compassion.</p>
                
                <p>You are now part of our growing community of <span class="highlight">donors committed to saving lives</span>. When blood is urgently needed, we'll connect you with patients in need.</p>
                
                <h3 style="color: #1f2937; margin-top: 25px;">What Happens Next?</h3>
                <ul style="line-height: 1.8; color: #374151;">
                    <li>✅ Your profile is complete and verified</li>
                    <li>📱 You'll receive notifications when your blood type is needed</li>
                    <li>🏥 Connect directly with hospitals and patients</li>
                    <li>📊 Track your donation history in your dashboard</li>
                </ul>
                
                <div class="stats">
                    <div class="stat-item">
                        <div class="stat-number">1</div>
                        <div class="stat-label">Pint of blood</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">3</div>
                        <div class="stat-label">Lives saved</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">58</div>
                        <div class="stat-label">Days to restore</div>
                    </div>
                </div>
                
                <p><strong>Quick Links:</strong></p>
                <ul style="line-height: 1.8; color: #374151;">
                    <li><a href="https://ritconnect.com/dashboard" style="color: #C0152A;">Go to Your Dashboard</a></li>
                    <li><a href="https://ritconnect.com/faq" style="color: #C0152A;">FAQ & Donation Guidelines</a></li>
                    <li><a href="https://ritconnect.com/contact" style="color: #C0152A;">Contact Support</a></li>
                </ul>
                
                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <strong>Stay healthy, stay connected!</strong><br>
                    The RitConnect Team
                </p>
            </div>
            
            <div class="footer">
                <p>© 2026 RitConnect. All rights reserved.</p>
                <p>
                    <a href="#">Unsubscribe</a> | 
                    <a href="#">Privacy Policy</a> | 
                    <a href="#">Terms of Service</a>
                </p>
                <p>Questions? Contact us at support@ritconnect.com</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, "", html=html_body)

