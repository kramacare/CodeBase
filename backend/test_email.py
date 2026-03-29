import asyncio
from app.services.email_service import send_otp

async def test_email():
    """Test email sending functionality"""
    print("Testing email service...")
    
    # Test with a known email
    test_email = "diganths083@gmail.com"
    test_otp = "123456"
    
    result = send_otp(test_email, test_otp)
    
    if result:
        print(f"✅ Email sent successfully to {test_email}")
    else:
        print(f"❌ Failed to send email to {test_email}")
        print("Check SMTP credentials in .env file")

if __name__ == "__main__":
    asyncio.run(test_email())
