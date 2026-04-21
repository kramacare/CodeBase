import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
from dotenv import load_dotenv, find_dotenv

# Load environment variables (ensure we pick up backend/.env when running uvicorn)
load_dotenv(find_dotenv())

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SMTP"""
    
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = (os.getenv("SMTP_USERNAME", "") or "").strip()
        # Gmail app-passwords are often copied with spaces; remove whitespace.
        self.smtp_password = (os.getenv("SMTP_PASSWORD", "") or "").strip().replace(" ", "")
        self.sender_email = (os.getenv("FROM_EMAIL", self.smtp_user) or "").strip()
        self.sender_name = os.getenv("SENDER_NAME", "Krama Clinic")

        if not self.smtp_user or not self.smtp_password:
            logger.warning(
                "EmailService SMTP is not fully configured. SMTP_USERNAME or SMTP_PASSWORD missing."
            )
    
    def send_otp_email(self, to_email: str, otp_code: str) -> bool:
        """
        Send OTP verification email
        
        Args:
            to_email: Recipient email address
            otp_code: 6-digit OTP code
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        subject = "Your OTP Verification Code"
        
        # HTML email content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .otp-box {{ background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }}
                .otp-code {{ font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #00555A; }}
                .footer {{ font-size: 12px; color: #888; text-align: center; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>OTP Verification</h2>
                <p>Your OTP verification code is:</p>
                <div class="otp-box">
                    <div class="otp-code">{otp_code}</div>
                </div>
                <p>This code expires in <strong>5 minutes</strong>.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <div class="footer">
                    <p>© 2024 Krama Clinic. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text fallback
        text_content = f"""
        Your OTP Verification Code
        ==========================
        
        Your OTP is: {otp_code}
        
        This code expires in 5 minutes.
        
        If you didn't request this code, please ignore this email.
        
        © 2024 Krama Clinic
        """
        
        return self._send_email(to_email, subject, text_content, html_content)

    def send_queue_alert_email(
        self,
        to_email: str,
        patient_name: str,
        clinic_name: str,
        alert_type: str
    ) -> bool:
        """Send queue progress alerts for patients nearing their turn."""
        safe_name = patient_name or "Patient"
        safe_clinic = clinic_name or "the clinic"

        if alert_type == "immediate":
            subject = f"Please reach {safe_clinic} now"
            heading = "Please reach the clinic ASAP"
            detail = "It is almost your turn. Please come to the clinic now so you are ready when called."
        else:
            subject = f"2 patients ahead of you at {safe_clinic}"
            heading = "Please start heading to the clinic"
            detail = "There are 2 patients ahead of you now. Please plan to reach the clinic as soon as possible."

        text_content = f"""
        Hello {safe_name},

        {detail}

        Clinic: {safe_clinic}

        Thank you,
        Krama Clinic
        """.strip()

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .card {{ background: #f7fbfb; border: 1px solid #d8ecec; border-radius: 10px; padding: 24px; }}
                .title {{ color: #00555A; margin-bottom: 12px; }}
                .footer {{ font-size: 12px; color: #777; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <h2 class="title">{heading}</h2>
                    <p>Hello {safe_name},</p>
                    <p>{detail}</p>
                    <p><strong>Clinic:</strong> {safe_clinic}</p>
                </div>
                <div class="footer">Krama Clinic</div>
            </div>
        </body>
        </html>
        """.strip()

        return self._send_email(to_email, subject, text_content, html_content)
    
    def _send_email(self, to_email: str, subject: str, text_content: str, html_content: str) -> bool:
        """
        Internal method to send email
        
        Args:
            to_email: Recipient email
            subject: Email subject
            text_content: Plain text content
            html_content: HTML content
            
        Returns:
            bool: Success status
        """
        if not self.smtp_user or not self.smtp_password:
            logger.warning(
                "SMTP credentials not configured (SMTP_USERNAME/SMTP_PASSWORD). Email not sent."
            )
            return False
        
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.sender_name} <{self.sender_email}>"
            msg["To"] = to_email
            
            # Attach both plain text and HTML
            part1 = MIMEText(text_content, "plain")
            part2 = MIMEText(html_content, "html")
            msg.attach(part1)
            msg.attach(part2)
            
            # Connect to SMTP server and send
            with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=20) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.sender_email, to_email, msg.as_string())

            logger.info("Email sent successfully to %s (subject=%s)", to_email, subject)
            return True
            
        except smtplib.SMTPException as e:
            logger.error("Failed to send email to %s: %s", to_email, str(e))
            return False
        except Exception as e:
            logger.error("Unexpected error sending email to %s: %s", to_email, str(e))
            return False


# Singleton instance
email_service = EmailService()


def send_otp(to_email: str, otp_code: str) -> bool:
    """Convenience function to send OTP email"""
    return email_service.send_otp_email(to_email, otp_code)


def send_queue_alert(to_email: str, patient_name: str, clinic_name: str, alert_type: str) -> bool:
    """Convenience function to send queue alert email"""
    return email_service.send_queue_alert_email(to_email, patient_name, clinic_name, alert_type)
