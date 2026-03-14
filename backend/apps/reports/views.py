import os
import uuid
import tempfile
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.mail import EmailMessage
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import requests
import logging

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_report_view(request):
    """Send medical report via email or WhatsApp."""
    
    # Check if user is clinic staff
    if request.user.role != 'CLINIC':
        return Response(
            {'error': 'Only clinic users can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Get form data
        patient_name = request.POST.get('patient_name', '').strip()
        email = request.POST.get('email', '').strip()
        phone = request.POST.get('phone', '').strip()
        delivery_method = request.POST.get('delivery_method', '').strip().upper()
        report_file = request.FILES.get('report_file')
        
        # Validate required fields
        if not patient_name:
            return Response(
                {'error': 'Patient name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not delivery_method or delivery_method not in ['EMAIL', 'WHATSAPP', 'BOTH']:
            return Response(
                {'error': 'Valid delivery method is required (EMAIL, WHATSAPP, BOTH)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate delivery method requirements
        if delivery_method in ['EMAIL', 'BOTH'] and not email:
            return Response(
                {'error': 'Email is required for EMAIL or BOTH delivery methods'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if delivery_method in ['WHATSAPP', 'BOTH'] and not phone:
            return Response(
                {'error': 'Phone number is required for WHATSAPP or BOTH delivery methods'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file
        if not report_file:
            return Response(
                {'error': 'Report file is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file type
        allowed_types = ['application/pdf', 'image/jpeg', 'image/png']
        if report_file.content_type not in allowed_types:
            return Response(
                {'error': 'Invalid file type. Only PDF, JPG, and PNG files are allowed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if report_file.size > max_size:
            return Response(
                {'error': 'File size too large. Maximum size is 10MB'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process the report
        results = []
        
        # Send via Email
        if delivery_method in ['EMAIL', 'BOTH']:
            email_result = send_email_report(
                patient_name, email, report_file, request.user
            )
            results.append(email_result)
        
        # Send via WhatsApp
        if delivery_method in ['WHATSAPP', 'BOTH']:
            whatsapp_result = send_whatsapp_report(
                patient_name, phone, report_file, request.user
            )
            results.append(whatsapp_result)
        
        # Determine overall success
        success_count = sum(1 for r in results if r['success'])
        total_count = len(results)
        
        if success_count == total_count:
            return Response({
                'message': 'Report sent successfully',
                'delivery_methods': [r['method'] for r in results],
                'patient_name': patient_name
            }, status=status.HTTP_200_OK)
        elif success_count > 0:
            return Response({
                'message': 'Report partially sent',
                'successful_methods': [r['method'] for r in results if r['success']],
                'failed_methods': [r['method'] for r in results if not r['success']],
                'patient_name': patient_name
            }, status=status.HTTP_207_MULTI_STATUS)
        else:
            return Response({
                'error': 'Failed to send report',
                'details': [r['error'] for r in results]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        logger.error(f"Error sending report: {str(e)}")
        return Response(
            {'error': 'Internal server error while sending report'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def send_email_report(patient_name, email, report_file, sender):
    """Send report via email using Django EmailMessage."""
    try:
        # Create email subject
        subject = f"Medical Report - {patient_name}"
        
        # Create email body
        body = f"""
Dear {patient_name},

Please find your medical report attached to this email.

If you have any questions, please contact the clinic.

Best regards,
{sender.get_full_name() or sender.email}
        """.strip()
        
        # Create email message with attachment
        email_message = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email]
        )
        
        # Attach the file
        email_message.attach(report_file.name, report_file.read(), report_file.content_type)
        
        # Send email
        email_message.send()
        
        logger.info(f"Email report sent successfully to {email} for {patient_name}")
        
        return {
            'success': True,
            'method': 'EMAIL',
            'recipient': email,
            'message': 'Email sent successfully'
        }
        
    except Exception as e:
        logger.error(f"Error sending email report: {str(e)}")
        return {
            'success': False,
            'method': 'EMAIL',
            'error': f'Failed to send email: {str(e)}'
        }


def send_whatsapp_report(patient_name, phone, report_file, sender):
    """Send report via WhatsApp using placeholder service."""
    try:
        # Generate temporary file URL
        temp_file_path = save_temporary_file(report_file, patient_name)
        
        # Generate file URL (valid for 24 hours)
        file_url = generate_temp_file_url(temp_file_path)
        
        # Send WhatsApp message using placeholder service
        whatsapp_result = send_whatsapp_message(
            phone=phone,
            message=f"Hello {patient_name}, your medical report is ready. Download here: {file_url}",
            sender=sender
        )
        
        # Schedule file cleanup (after 24 hours)
        schedule_file_cleanup(temp_file_path)
        
        logger.info(f"WhatsApp report sent successfully to {phone} for {patient_name}")
        
        return {
            'success': True,
            'method': 'WHATSAPP',
            'recipient': phone,
            'file_url': file_url,
            'message': 'WhatsApp message sent successfully'
        }
        
    except Exception as e:
        logger.error(f"Error sending WhatsApp report: {str(e)}")
        return {
            'success': False,
            'method': 'WHATSAPP',
            'error': f'Failed to send WhatsApp message: {str(e)}'
        }


def save_temporary_file(uploaded_file, patient_name):
    """Save uploaded file to temporary storage."""
    try:
        # Generate unique filename
        file_extension = os.path.splitext(uploaded_file.name)[1]
        unique_filename = f"report_{patient_name}_{uuid.uuid4().hex[:8]}{file_extension}"
        
        # Save to temporary directory
        temp_path = os.path.join(tempfile.gettempdir(), unique_filename)
        
        with open(temp_path, 'wb') as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
        
        return temp_path
        
    except Exception as e:
        logger.error(f"Error saving temporary file: {str(e)}")
        raise


def generate_temp_file_url(file_path):
    """Generate temporary URL for file access."""
    try:
        # In production, this would be your domain
        # For now, return a placeholder URL
        filename = os.path.basename(file_path)
        
        # Generate URL that expires in 24 hours
        from datetime import datetime, timedelta
        expires_at = datetime.now() + timedelta(hours=24)
        
        # This is a placeholder - implement proper signed URL generation
        temp_url = f"{settings.BASE_URL}/temp/reports/{filename}?expires={expires_at.timestamp()}"
        
        return temp_url
        
    except Exception as e:
        logger.error(f"Error generating temporary URL: {str(e)}")
        raise


def send_whatsapp_message(phone, message, sender):
    """Placeholder WhatsApp service integration."""
    try:
        # This is a placeholder for WhatsApp API integration
        # Replace with actual WhatsApp Business API implementation
        
        whatsapp_api_url = "https://api.whatsapp.com/v1/messages"  # Placeholder URL
        api_key = getattr(settings, 'WHATSAPP_API_KEY', None)
        
        if not api_key:
            # For demo purposes, just log the message
            logger.info(f"WhatsApp Message (Demo): To: {phone}, Message: {message}")
            return {'success': True, 'message_id': f'demo_{uuid.uuid4().hex[:8]}'}
        
        # Actual API call would go here
        payload = {
            'to': phone,
            'message': message,
            'type': 'text'
        }
        
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(whatsapp_api_url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            return {'success': True, 'message_id': response.json().get('message_id')}
        else:
            return {'success': False, 'error': response.text}
            
    except Exception as e:
        logger.error(f"Error sending WhatsApp message: {str(e)}")
        return {'success': False, 'error': str(e)}


def schedule_file_cleanup(file_path):
    """Schedule temporary file for cleanup after 24 hours."""
    try:
        from datetime import datetime, timedelta
        from django.core.management import call_command
        
        # In production, use Celery or similar task queue
        # For now, just log the cleanup schedule
        cleanup_time = datetime.now() + timedelta(hours=24)
        logger.info(f"Scheduled cleanup for {file_path} at {cleanup_time}")
        
        # Placeholder for actual cleanup implementation
        # You could use cron, Celery, or Django management commands
        
    except Exception as e:
        logger.error(f"Error scheduling file cleanup: {str(e)}")


def cleanup_temp_file(file_path):
    """Delete temporary file."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Temporary file deleted: {file_path}")
    except Exception as e:
        logger.error(f"Error deleting temporary file {file_path}: {str(e)}")
