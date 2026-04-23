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

        logger.info(f"EmailService initialized: smtp_user={self.smtp_user}, smtp_host={self.smtp_host}, smtp_port={self.smtp_port}")
        
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
        logger.info(f"Attempting to send email to {to_email}, subject: {subject}")
        
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


# ============ Clinic Registration Email Functions ============

def send_clinic_registration_received_email(to_email: str, clinic_name: str) -> bool:
    """
    Send email to clinic confirming their registration request has been received
    and is pending admin approval.
    """
    subject = "Registration Received - Pending Approval"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #00555A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
            .footer {{ font-size: 12px; color: #888; text-align: center; margin-top: 20px; }}
            .highlight {{ background: #e8f4f8; padding: 15px; border-left: 4px solid #00555A; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Registration Received</h2>
            </div>
            <div class="content">
                <p>Dear <strong>{clinic_name}</strong>,</p>
                <p>Thank you for registering with Krama Care!</p>
                
                <div class="highlight">
                    <p><strong>Your registration request has been received and is now under review.</strong></p>
                    <p>You will receive a response within <strong>24 hours</strong> regarding the status of your application.</p>
                </div>
                
                <p>Please note that you <strong>cannot log in</strong> until your registration has been approved by our admin team.</p>
                
                <p>If you have any questions, please feel free to contact us.</p>
                
                <p>Best regards,<br>
                <strong>Krama Care Team</strong></p>
            </div>
            <div class="footer">
                <p>© 2024 Krama Care. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Registration Received - Pending Approval
    =========================================
    
    Dear {clinic_name},
    
    Thank you for registering with Krama Care!
    
    Your registration request has been received and is now under review.
    You will receive a response within 24 hours regarding the status of your application.
    
    Please note that you cannot log in until your registration has been approved by our admin team.
    
    If you have any questions, please feel free to contact us.
    
    Best regards,
    Krama Care Team
    
    © 2024 Krama Care. All rights reserved.
    """
    
    return email_service._send_email(to_email, subject, text_content, html_content)


def send_clinic_approval_email(to_email: str, clinic_name: str, clinic_id: str) -> bool:
    """
    Send email to clinic confirming their registration has been approved.
    """
    subject = "Registration Approved - Welcome to Krama Care!"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
            .footer {{ font-size: 12px; color: #888; text-align: center; margin-top: 20px; }}
            .success-box {{ background: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; }}
            .clinic-id {{ background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; font-size: 16px; text-align: center; margin: 10px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Registration Approved!</h2>
            </div>
            <div class="content">
                <p>Dear <strong>{clinic_name}</strong>,</p>
                
                <div class="success-box">
                    <p><strong>Congratulations!</strong> Your registration has been approved by our admin team.</p>
                </div>
                
                <p>You can now log in to your clinic dashboard and start managing your appointments.</p>
                
                <p><strong>Your Clinic ID:</strong></p>
                <div class="clinic-id">{clinic_id}</div>
                
                <p>Please keep this ID safe as you will need it for logging in and managing your clinic.</p>
                
                <p><a href="#" style="background: #00555A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Go to Login</a></p>
                
                <p>Welcome to the Krama Care family!</p>
                
                <p>Best regards,<br>
                <strong>Krama Care Team</strong></p>
            </div>
            <div class="footer">
                <p>© 2024 Krama Care. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Registration Approved - Welcome to Krama Care!
    ================================================
    
    Dear {clinic_name},
    
    Congratulations! Your registration has been approved by our admin team.
    
    You can now log in to your clinic dashboard and start managing your appointments.
    
    Your Clinic ID: {clinic_id}
    
    Please keep this ID safe as you will need it for logging in and managing your clinic.
    
    Welcome to the Krama Care family!
    
    Best regards,
    Krama Care Team
    
    © 2024 Krama Care. All rights reserved.
    """
    
    return email_service._send_email(to_email, subject, text_content, html_content)


def send_clinic_rejection_email(to_email: str, clinic_name: str, reason: str = None) -> bool:
    """
    Send email to clinic informing them their registration has been rejected.
    """
    subject = "Registration Status Update"
    
    reason_text = f"<p><strong>Reason:</strong> {reason}</p>" if reason else ""
    reason_text_plain = f"Reason: {reason}" if reason else ""
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
            .footer {{ font-size: 12px; color: #888; text-align: center; margin-top: 20px; }}
            .notice-box {{ background: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Registration Update</h2>
            </div>
            <div class="content">
                <p>Dear <strong>{clinic_name}</strong>,</p>
                
                <div class="notice-box">
                    <p><strong>We regret to inform you that your registration request has not been approved at this time.</strong></p>
                    {reason_text}
                </div>
                
                <p>If you believe this was a mistake or would like to provide additional information, please contact our support team.</p>
                
                <p>Thank you for your interest in Krama Care.</p>
                
                <p>Best regards,<br>
                <strong>Krama Care Team</strong></p>
            </div>
            <div class="footer">
                <p>© 2024 Krama Care. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Registration Update
    ===================
    
    Dear {clinic_name},
    
    We regret to inform you that your registration request has not been approved at this time.
    {reason_text_plain}
    
    If you believe this was a mistake or would like to provide additional information, please contact our support team.
    
    Thank you for your interest in Krama Care.
    
    Best regards,
    Krama Care Team
    
    © 2024 Krama Care. All rights reserved.
    """
    
    return email_service._send_email(to_email, subject, text_content, html_content)
