from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from django.db import transaction
from .models import QueueToken, QueueSession, QueueSettings
from .serializers import (
    QueueTokenSerializer,
    QueueSessionSerializer,
    QueueSettingsSerializer,
    JoinQueueSerializer,
    TokenActionSerializer,
    UpdateTokenSerializer
)
from django.contrib.auth import get_user_model

User = get_user_model()


def generate_token_number(clinic_id, token_prefix='A'):
    """Generate next token number for a clinic."""
    from .models import QueueToken
    import django.utils as timezone
    from datetime import timedelta
    
    # Get today's date
    today = timezone.now().date()
    
    # Find the last token for today
    last_token = QueueToken.objects.filter(
        clinic_id=clinic_id,
        token_label=token_prefix,
        joined_at__date=today
    ).order_by('-token_number').first()
    
    if last_token:
        return last_token.token_number + 1
    else:
        return 1


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_queue_view(request):
    """Join queue endpoint."""
    serializer = JoinQueueSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user = request.user
    if user.role != 'PATIENT':
        return Response(
            {'error': 'Only patients can join queue'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient_profile = user.patient_profile
    except AttributeError:
        return Response(
            {'error': 'Patient profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    with transaction.atomic():
        # Generate token number
        token_number = generate_token_number(
            serializer.validated_data['clinic_id'],
            serializer.validated_data.get('doctor_id', None)
        )
        
        # Create queue token
        queue_token = QueueToken.objects.create(
            clinic_id=serializer.validated_data['clinic_id'],
            doctor_id=serializer.validated_data.get('doctor_id'),
            patient=patient_profile,
            token_number=token_number,
            token_label='A',  # Default to A, can be overridden by doctor
            priority=serializer.validated_data.get('priority', 0),
            notes=serializer.validated_data.get('notes', ''),
            source='ONLINE'
        )
        
        # Get or create today's queue session
        session, created = QueueSession.objects.get_or_create(
            clinic_id=serializer.validated_data['clinic_id'],
            date=timezone.now().date(),
            defaults={'is_active': True}
        )
        
        if created:
            session.total_patients += 1
            session.save()
        
        # Broadcast real-time event
        try:
            from .consumers import broadcast_queue_event
            import asyncio
            
            # Get token data for broadcasting
            token_data = {
                'id': queue_token.id,
                'number': queue_token.token_number,
                'label': queue_token.token_label,
                'patient_name': queue_token.patient.user.get_full_name(),
                'status': queue_token.status,
                'joined_at': queue_token.joined_at.isoformat()
            }
            
            # Broadcast patient joined queue event
            asyncio.create_task(
                broadcast_queue_event(
                    doctor_id=serializer.validated_data.get('doctor_id'),
                    event_type='patient_joined',
                    token_data=token_data
                )
            )
        except Exception as e:
            # Log error but don't fail the request
            pass
        
        return Response({
            'message': 'Successfully joined queue',
            'token': QueueTokenSerializer(queue_token).data,
            'position_in_queue': session.total_patients,
            'estimated_wait_time': queue_token.estimated_wait_time
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_queue_view(request, clinic_id):
    """Get clinic queue view."""
    user = request.user
    if user.role not in ['CLINIC', 'PATIENT']:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Get or create today's queue session
        session, created = QueueSession.objects.get_or_create(
            clinic_id=clinic_id,
            date=timezone.now().date(),
            defaults={'is_active': True}
        )
        
        if created:
            session.total_patients = QueueToken.objects.filter(
                clinic_id=clinic_id,
                joined_at__date=timezone.now().date()
            ).count()
            session.save()
        
        # Get all waiting tokens
        tokens = QueueToken.objects.filter(
            clinic_id=clinic_id,
            status='WAITING'
        ).select_related('patient', 'doctor').order_by('token_number')
        
        serializer = QueueTokenSerializer(tokens, many=True)
        
        return Response({
            'message': 'Queue retrieved successfully',
            'session': QueueSessionSerializer(session).data,
            'tokens': serializer.data,
            'total_waiting': len(tokens)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e),
            'message': 'Failed to retrieve queue'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_live_queue_view(request, doctor_id):
    """Get live queue for doctor."""
    user = request.user
    if user.role != 'CLINIC':
        return Response(
            {'error': 'Only clinic staff can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        clinic_profile = user.clinic_profile
        
        # Get today's active session
        session = QueueSession.objects.filter(
            clinic_id=clinic_profile,
            date=timezone.now().date(),
            is_active=True
        ).first()
        
        if not session:
            return Response(
                {'error': 'No active queue session found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get current token being served
        current_token = QueueToken.objects.filter(
            clinic_id=clinic_profile,
            status='WITH_DOCTOR'
        ).order_by('-started_at').first()
        
        # Get all tokens
        tokens = QueueToken.objects.filter(
            clinic_id=clinic_profile,
            joined_at__date=timezone.now().date()
        ).select_related('patient', 'doctor').order_by('token_number')
        
        # Update session stats
        session.total_patients = tokens.count()
        session.current_token_number = current_token.token_number if current_token else 0
        
        return Response({
            'message': 'Live queue retrieved successfully',
            'session': QueueSessionSerializer(session).data if session else None,
            'current_token': QueueTokenSerializer(current_token).data if current_token else None,
            'total_patients': session.total_patients,
            'tokens': QueueTokenSerializer(tokens, many=True).data,
            'waiting_count': len([t for t in tokens if t.status == 'WAITING'])
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e),
            'message': 'Failed to retrieve live queue'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def call_next_view(request):
    """Call next patient endpoint."""
    user = request.user
    if user.role != 'CLINIC':
        return Response(
            {'error': 'Only clinic staff can call next patient'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        clinic_profile = user.clinic_profile
        
        serializer = TokenActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the first waiting token
        waiting_token = QueueToken.objects.filter(
            clinic_id=clinic_profile,
            status='WAITING',
            joined_at__date=timezone.now().date()
        ).order_by('token_number').first()
        
        if not waiting_token:
            return Response(
                {'error': 'No patients waiting in queue'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update token status
        waiting_token.status = 'WITH_DOCTOR'
        waiting_token.started_at = timezone.now()
        waiting_token.save()
        
        # Broadcast token called event
        try:
            from .consumers import broadcast_queue_event
            import asyncio
            
            token_data = {
                'id': waiting_token.id,
                'number': waiting_token.token_number,
                'label': waiting_token.token_label,
                'patient_name': waiting_token.patient.user.get_full_name(),
                'status': waiting_token.status,
                'started_at': waiting_token.started_at.isoformat()
            }
            
            asyncio.create_task(
                broadcast_queue_event(
                    doctor_id=waiting_token.doctor_id,
                    event_type='token_called',
                    token_data=token_data
                )
            )
        except Exception as e:
            pass
        
        # Update session
        session = QueueSession.objects.filter(
            clinic_id=clinic_profile,
            date=timezone.now().date(),
            is_active=True
        ).first()
        
        if session:
            session.current_token_number = waiting_token.token_number
            session.save()
        
        return Response({
            'message': 'Next patient called successfully',
            'token': QueueTokenSerializer(waiting_token).data,
            'session': QueueSessionSerializer(session).data if session else None
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def skip_patient_view(request):
    """Skip current patient endpoint."""
    user = request.user
    if user.role != 'CLINIC':
        return Response(
            {'error': 'Only clinic staff can skip patients'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        clinic_profile = user.clinic_profile
        
        serializer = TokenActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the current token
        current_token = QueueToken.objects.filter(
            clinic_id=clinic_profile,
            status='WITH_DOCTOR',
            joined_at__date=timezone.now().date()
        ).order_by('-started_at').first()
        
        if not current_token:
            return Response(
                {'error': 'No patient currently with doctor'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update current token status
        current_token.status = 'SKIPPED'
        current_token.completed_at = timezone.now()
        current_token.save()
        
        # Broadcast token skipped event
        try:
            from .consumers import broadcast_queue_event
            import asyncio
            
            token_data = {
                'id': current_token.id,
                'number': current_token.token_number,
                'label': current_token.token_label,
                'patient_name': current_token.patient.user.get_full_name(),
                'status': current_token.status,
                'completed_at': current_token.completed_at.isoformat()
            }
            
            asyncio.create_task(
                broadcast_queue_event(
                    doctor_id=current_token.doctor_id,
                    event_type='token_skipped',
                    token_data=token_data
                )
            )
        except Exception as e:
            pass
        
        # Get the next waiting token
        next_token = QueueToken.objects.filter(
            clinic_id=clinic_profile,
            status='WAITING',
            joined_at__date=timezone.now().date()
        ).order_by('token_number').first()
        
        # Update next token status
        if next_token:
            next_token.status = 'WITH_DOCTOR'
            next_token.started_at = timezone.now()
            next_token.save()
            
            # Broadcast token called event
            try:
                next_token_data = {
                    'id': next_token.id,
                    'number': next_token.token_number,
                    'label': next_token.token_label,
                    'patient_name': next_token.patient.user.get_full_name(),
                    'status': next_token.status,
                    'started_at': next_token.started_at.isoformat()
                }
                
                asyncio.create_task(
                    broadcast_queue_event(
                        doctor_id=next_token.doctor_id,
                        event_type='token_called',
                        token_data=next_token_data
                    )
                )
            except Exception as e:
                pass
        
        # Update session
        session = QueueSession.objects.filter(
            clinic_id=clinic_profile,
            date=timezone.now().date(),
            is_active=True
        ).first()
        
        if session:
            session.skipped_patients += 1
            session.current_token_number = next_token.token_number if next_token else current_token.token_number
            session.save()
        
        return Response({
            'message': 'Patient skipped successfully',
            'skipped_token': QueueTokenSerializer(current_token).data,
            'next_token': QueueTokenSerializer(next_token).data if next_token else None,
            'session': QueueSessionSerializer(session).data if session else None
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_token_view(request):
    """Update token status endpoint."""
    user = request.user
    if user.role != 'CLINIC':
        return Response(
            {'error': 'Only clinic staff can update token status'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        clinic_profile = user.clinic_profile
        
        serializer = UpdateTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token_id = serializer.validated_data.get('status')
        notes = serializer.validated_data.get('notes', '')
        
        try:
            token = QueueToken.objects.get(id=token_id)
            
            # Check if token belongs to this clinic
            if token.clinic != clinic_profile:
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Update token status
            old_status = token.status
            token.status = serializer.validated_data['status']
            token.notes = notes
            
            # Update timestamps based on status changes
            if old_status != 'WITH_DOCTOR' and token.status == 'WITH_DOCTOR':
                token.started_at = timezone.now()
            elif old_status != 'COMPLETED' and token.status == 'COMPLETED':
                token.completed_at = timezone.now()
            elif old_status != 'SKIPPED' and token.status == 'SKIPPED':
                token.completed_at = timezone.now()
            
            token.save()
            
            # Broadcast token status update event
            try:
                from .consumers import broadcast_queue_event
                import asyncio
                
                token_data = {
                    'id': token.id,
                    'number': token.token_number,
                    'label': token.token_label,
                    'patient_name': token.patient.user.get_full_name(),
                    'status': token.status,
                    'notes': token.notes,
                    'updated_at': timezone.now().isoformat()
                }
                
                asyncio.create_task(
                    broadcast_queue_event(
                        doctor_id=token.doctor_id,
                        event_type='token_status_updated',
                        token_data=token_data
                    )
                )
            except Exception as e:
                pass
            
            return Response({
                'message': f'Token status updated from {old_status} to {token.status}',
                'token': QueueTokenSerializer(token).data
            }, status=status.HTTP_200_OK)
            
        except QueueToken.DoesNotExist:
            return Response(
                {'error': 'Token not found'},
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_queue_view(request):
    """Get current user's queue position."""
    user = request.user
    if user.role != 'PATIENT':
        return Response(
            {'error': 'Only patients can view their queue position'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient_profile = user.patient_profile
        
        # Get user's active token
        active_token = QueueToken.objects.filter(
            patient=patient_profile,
            status__in=['WAITING', 'WITH_DOCTOR']
        ).order_by('-joined_at').first()
        
        if not active_token:
            return Response({
                'message': 'You are not currently in queue',
                'position': None,
                'estimated_wait_time': 0
            })
        
        # Calculate position in queue
        tokens_ahead = QueueToken.objects.filter(
            clinic=active_token.clinic,
            status='WAITING',
            token_number__lt=active_token.token_number,
            joined_at__date=timezone.now().date()
        ).count()
        
        return Response({
            'message': 'Queue position retrieved successfully',
            'token': QueueTokenSerializer(active_token).data,
            'position': tokens_ahead + 1,
            'estimated_wait_time': tokens_ahead * 15  # 15 minutes per patient
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_queue_settings_view(request):
    """Get queue settings for clinic staff."""
    user = request.user
    if user.role != 'CLINIC':
        return Response(
            {'error': 'Only clinic users can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        clinic_profile = user.clinic_profile
        
        settings, created = QueueSettings.objects.get_or_create(
            clinic=clinic_profile,
            defaults={
                'max_queue_size': 100,
                'average_consultation_time': 15,
                'token_prefixes': ['A', 'B', 'C'],
                'auto_advance': True,
                'notification_enabled': True,
                'sms_enabled': False,
                'email_enabled': True
            }
        )
        
        return Response({
            'message': 'Queue settings retrieved successfully',
            'settings': QueueSettingsSerializer(settings).data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_queue_settings_view(request):
    """Update queue settings for clinic staff."""
    user = request.user
    if user.role != 'CLINIC':
        return Response(
            {'error': 'Only clinic users can update queue settings'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        clinic_profile = user.clinic_profile
        
        settings = QueueSettings.objects.get(clinic=clinic_profile)
        
        # Update settings
        settings.max_queue_size = request.data.get('max_queue_size', settings.max_queue_size)
        settings.average_consultation_time = request.data.get('average_consultation_time', settings.average_consultation_time)
        settings.token_prefixes = request.data.get('token_prefixes', settings.token_prefixes)
        settings.auto_advance = request.data.get('auto_advance', settings.auto_advance)
        settings.notification_enabled = request.data.get('notification_enabled', settings.notification_enabled)
        settings.sms_enabled = request.data.get('sms_enabled', settings.sms_enabled)
        settings.email_enabled = request.data.get('email_enabled', settings.email_enabled)
        
        settings.save()
        
        return Response({
            'message': 'Queue settings updated successfully',
            'settings': QueueSettingsSerializer(settings).data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
