import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Optional
from datetime import datetime, timedelta
import random
import string


class EmailService:
    def __init__(self):
        # Email configuration
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.sender_email = os.getenv("SENDER_EMAIL", "rewards@nextgen-ai.com")
        self.sender_password = os.getenv("SENDER_PASSWORD", "")
        self.app_name = "NextGen AI Investment Game"

    def generate_coupon_code(self, partner: str) -> str:
        """Generate a unique coupon code for the partner"""
        # Create prefix from partner name (first 3 letters, uppercase)
        prefix = partner.replace(" ", "").upper()[:3]

        # Generate random alphanumeric string
        random_chars = ''.join(random.choices(
            string.ascii_uppercase + string.digits, k=6))

        return f"{prefix}-{random_chars}"

    def create_voucher_email(self, user_email: str, reward_name: str, partner: str,
                             coupon_code: str, reward_description: str) -> MIMEMultipart:
        """Create a professional voucher email"""

        # Email subject
        subject = f"🎁 Your {reward_name} Voucher - {self.app_name}"

        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = self.sender_email
        msg['To'] = user_email
        msg['Subject'] = subject

        # Create both HTML and plain text versions
        html_content = self._create_html_content(
            reward_name, partner, coupon_code, reward_description)
        text_content = self._create_text_content(
            reward_name, partner, coupon_code, reward_description)

        # Attach both versions
        html_part = MIMEText(html_content, 'html')
        text_part = MIMEText(text_content, 'plain')

        msg.attach(text_part)
        msg.attach(html_part)

        return msg

    def _create_text_content(self, reward_name: str, partner: str, coupon_code: str, reward_description: str) -> str:
        """Create plain text version of the email"""
        text_content = f"""
🎁 Your {reward_name} Voucher - {self.app_name}

🎉 Congratulations! Your reward has been successfully redeemed!

📦 Reward Details:
   Name: {reward_name}
   Partner: {partner}
   Description: {reward_description}
   Redeemed on: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}

🎫 Your Voucher Code: {coupon_code}

📱 How to Use Your Voucher:
1. Visit any {partner} store or website
2. Present this voucher code to the staff
3. The staff will scan or enter the code for your discount
4. Enjoy your reward!

⏰ Important: This voucher is valid for 30 days from today.
   Expires on: {(datetime.now() + timedelta(days=30)).strftime('%B %d, %Y')}

🎮 Continue Playing: https://nextgen-ai-nuvc.vercel.app/
🏆 View Leaderboard: https://nextgen-ai-nuvc.vercel.app/timeline

Thank you for playing {self.app_name}!
This is an automated email. Please do not reply to this message.
If you have any questions, contact us at support@nextgen-ai.com
        """
        return text_content.strip()

    def _create_html_content(self, reward_name: str, partner: str, coupon_code: str, reward_description: str) -> str:
        """Create HTML version of the email"""
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Voucher - {self.app_name}</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f8f9fa;
                }}
                .container {{
                    background-color: white;
                    border-radius: 10px;
                    padding: 25px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #e9ecef;
                }}
                .logo {{
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                    margin-bottom: 10px;
                }}
                .voucher-card {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 25px;
                    border-radius: 10px;
                    text-align: center;
                    margin: 20px 0;
                }}
                .coupon-code {{
                    font-family: 'Courier New', monospace;
                    font-size: 24px;
                    font-weight: bold;
                    background-color: white;
                    color: #333;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 15px 0;
                    letter-spacing: 2px;
                }}
                .qr-section {{
                    text-align: center;
                    margin: 25px 0;
                    padding: 15px;
                    background-color: #f8f9fa;
                    border-radius: 10px;
                }}
                .qr-code {{
                    display: inline-block;
                    padding: 15px;
                    background-color: white;
                    border-radius: 10px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    margin: 15px 0;
                }}
                .qr-code img {{
                    width: 200px;
                    height: 200px;
                    display: block;
                }}
                .scan-instructions {{
                    background-color: #d4edda;
                    border: 1px solid #c3e6cb;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 15px 0;
                }}
                .reward-details {{
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 15px 0;
                }}
                .instructions {{
                    background-color: #e3f2fd;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 15px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                    color: #6c757d;
                    font-size: 14px;
                }}
                .button {{
                    display: inline-block;
                    background-color: #28a745;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 5px;
                }}
                .expiry {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    padding: 10px;
                    border-radius: 5px;
                    margin: 15px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🎮 {self.app_name}</div>
                    <h1 style="color: #28a745; margin: 10px 0;">🎉 Congratulations!</h1>
                    <p>Your reward has been successfully redeemed!</p>
                </div>

                <div class="voucher-card">
                    <h2 style="margin: 0 0 15px 0;">{reward_name}</h2>
                    <p style="margin: 0; opacity: 0.9;">{reward_description}</p>
                </div>

                <div class="reward-details">
                    <h3 style="margin-top: 0;">📋 Reward Details</h3>
                    <p><strong>Partner:</strong> {partner}</p>
                    <p><strong>Description:</strong> {reward_description}</p>
                    <p><strong>Redeemed on:</strong> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                </div>

                <div class="qr-section">
                    <h3>📱 Scan QR Code</h3>
                    <p style="color: #666; margin-bottom: 20px;">
                        Show this QR code at any {partner} location for instant redemption
                    </p>
                    <div class="qr-code">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={coupon_code}-{partner}&format=png&margin=10" 
                             alt="Voucher QR Code" 
                             style="width: 200px; height: 200px; border: 1px solid #ddd; border-radius: 8px;" />
                        <p style="margin-top: 10px; font-size: 12px; color: #666;">
                            <strong>If QR code doesn't load, use this code:</strong><br/>
                            <span style="font-family: monospace; font-size: 14px; background: #f0f0f0; padding: 5px; border-radius: 3px;">{coupon_code}</span>
                        </p>
                    </div>
                    <div class="scan-instructions">
                        <h4 style="margin: 0 0 15px 0; color: #155724; text-align: left;">📱 How to Use QR Code</h4>
                        <ol style="margin: 0; padding-left: 20px; color: #155724; text-align: left;">
                            <li style="margin-bottom: 8px;">Open your phone's camera app</li>
                            <li style="margin-bottom: 8px;">Point it at this QR code</li>
                            <li style="margin-bottom: 8px;">Follow the prompt to scan</li>
                            <li style="margin-bottom: 0;">Show the scanned result to staff</li>
                        </ol>
                    </div>
                </div>

                <div style="text-align: center; margin: 25px 0;">
                    <h3>🎫 Your Voucher Code</h3>
                    <div class="coupon-code">{coupon_code}</div>
                    <p style="font-size: 14px; color: #6c757d;">
                        Alternative: Show this code at any {partner} location to redeem your reward
                    </p>
                </div>

                <div class="instructions">
                    <h3 style="margin-top: 0;">📝 How to Use Your Voucher</h3>
                    <ol style="margin: 0; padding-left: 20px;">
                        <li>Visit any {partner} store or website</li>
                        <li>Present this QR code or voucher code to the staff</li>
                        <li>The staff will scan or enter the code for your discount</li>
                        <li>Enjoy your reward!</li>
                    </ol>
                </div>

                <div class="expiry">
                    <strong>⏰ Important:</strong> This voucher is valid for 30 days from today.
                    Expires on {(datetime.now() + timedelta(days=30)).strftime('%B %d, %Y')}.
                </div>

                <div style="text-align: center; margin: 25px 0;">
                    <a href="https://nextgen-ai-nuvc.vercel.app/timeline" class="button">
                        🎮 Continue Playing
                    </a>
                </div>

                <div class="footer">
                    <p>Thank you for playing {self.app_name}!</p>
                    <p>This is an automated email. Please do not reply to this message.</p>
                    <p>If you have any questions, contact us at support@nextgen-ai.com</p>
                </div>
            </div>
        </body>
        </html>
        """
        return html_content

    async def send_voucher_email(self, user_email: str, reward_name: str, partner: str,
                                 reward_description: str) -> dict:
        """Send voucher email to user"""

        try:
            # Generate coupon code
            coupon_code = self.generate_coupon_code(partner)

            # Create email
            msg = self.create_voucher_email(user_email, reward_name, partner,
                                            coupon_code, reward_description)

            # Check if we have SMTP credentials
            if not self.sender_password:
                print(f"⚠️ No SMTP password configured - simulating email send")
                print(f"📧 Would send to: {user_email}")
                print(f"🎫 Coupon code: {coupon_code}")
                return {
                    "success": True,
                    "message": "Email sent successfully (simulated)",
                    "coupon_code": coupon_code,
                    "simulated": True
                }

            # Send email via SMTP
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(msg)

            print(f"✅ Email sent successfully to {user_email}")
            print(f"🎫 Coupon code: {coupon_code}")

            return {
                "success": True,
                "message": "Email sent successfully",
                "coupon_code": coupon_code,
                "simulated": False
            }

        except Exception as e:
            print(f"❌ Error sending email: {e}")
            return {
                "success": False,
                "message": f"Failed to send email: {str(e)}",
                "coupon_code": None,
                "simulated": False
            }
