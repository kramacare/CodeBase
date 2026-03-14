import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from channels.exceptions import StopConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from .models import QueueToken

User = get_user_model()


class QueueConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time queue updates."""
    
    async def connect(self, scope):
        """Handle WebSocket connection."""
        self.doctor_id = scope['url_route']['kwargs']['doctor_id']
        
        # Validate that user is authenticated and is a clinic staff
        if not scope.get('user') or scope['user'].role != 'CLINIC':
            await self.close(code=4003)
            return
        
        # Validate that the clinic staff owns this doctor
        user = scope['user']
        try:
            clinic_profile = user.clinic_profile
            if not clinic_profile.doctors.filter(id=self.doctor_id).exists():
                await self.close(code=4003)
                return
        except:
            await self.close(code=4003)
            return
        
        self.user = user
        self.doctor_id = self.doctor_id
        self.queue_group_name = f'queue_{self.doctor_id}'
        
        # Join queue group for this doctor
        await self.channel_layer.group_add(
            self.queue_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send current queue status to newly connected client
        await self.send_queue_update()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        # Leave queue group
        await self.channel_layer.group_discard(
            self.queue_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            # Handle different message types
            if message_type == 'get_queue_status':
                await self.send_queue_update()
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                }))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
    
    async def send_queue_update(self):
        """Send current queue status to all connected clients."""
        try:
            # Get current queue data
            queue_data = await self.get_queue_data()
            
            # Broadcast to all clients in this doctor's queue group
            await self.channel_layer.group_send(
                self.queue_group_name,
                {
                    'type': 'queue_update',
                    'data': queue_data
                }
            )
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Failed to get queue data: {str(e)}'
            }))
    
    @database_sync_to_async
    def get_queue_data(self):
        """Get current queue data for this doctor."""
        from django.utils import timezone
        from datetime import date
        
        today = timezone.now().date()
        
        # Get all tokens for today
        tokens = QueueToken.objects.filter(
            doctor_id=self.doctor_id,
            joined_at__date=today
        ).select_related('patient').order_by('token_number')
        
        # Get current token being served
        current_token = tokens.filter(status='WITH_DOCTOR').first()
        
        # Get waiting tokens
        waiting_tokens = tokens.filter(status='WAITING')
        
        # Get completed and skipped tokens
        completed_tokens = tokens.filter(status='COMPLETED').count()
        skipped_tokens = tokens.filter(status='SKIPPED').count()
        
        # Calculate estimated wait times
        avg_consultation_time = 15  # minutes
        waiting_count = waiting_tokens.count()
        estimated_wait_time = waiting_count * avg_consultation_time
        
        return {
            'doctor_id': self.doctor_id,
            'current_token': {
                'id': current_token.id if current_token else None,
                'number': current_token.token_number if current_token else None,
                'label': current_token.token_label if current_token else None,
                'patient_name': current_token.patient.user.get_full_name() if current_token else None,
                'started_at': current_token.started_at.isoformat() if current_token else None
            } if current_token else None,
            'waiting_tokens': [
                {
                    'id': token.id,
                    'number': token.token_number,
                    'label': token.token_label,
                    'patient_name': token.patient.user.get_full_name(),
                    'estimated_wait_time': estimated_wait_time,
                    'joined_at': token.joined_at.isoformat()
                }
                for token in waiting_tokens
            ],
            'stats': {
                'total_waiting': waiting_count,
                'completed_today': completed_tokens,
                'skipped_today': skipped_tokens,
                'estimated_wait_time': estimated_wait_time
            },
            'last_updated': timezone.now().isoformat()
        }
    
    @sync_to_async
    def broadcast_queue_event(self, event_type, token_data):
        """Broadcast queue events to all connected clients."""
        try:
            # Get current queue data
            queue_data = await self.get_queue_data()
            
            # Create event payload
            event_payload = {
                'type': 'queue_event',
                'event_type': event_type,
                'data': {
                    'token': token_data,
                    'queue': queue_data
                },
                'timestamp': timezone.now().isoformat()
            }
            
            # Broadcast to all clients in this doctor's queue group
            await self.channel_layer.group_send(
                self.queue_group_name,
                event_payload
            )
            
        except Exception as e:
            error_payload = {
                'type': 'error',
                'message': f'Failed to broadcast event: {str(e)}',
                'timestamp': timezone.now().isoformat()
            }
            
            await self.channel_layer.group_send(
                self.queue_group_name,
                error_payload
            )


# Global registry for active consumers
active_consumers = {}


def get_consumer_for_doctor(doctor_id):
    """Get active consumer for a specific doctor."""
    return active_consumers.get(doctor_id)


def register_consumer(doctor_id, consumer):
    """Register a consumer for a doctor."""
    active_consumers[doctor_id] = consumer


def unregister_consumer(doctor_id):
    """Unregister a consumer for a doctor."""
    if doctor_id in active_consumers:
        del active_consumers[doctor_id]


# Async function to broadcast events from outside the consumer
@sync_to_async
def broadcast_queue_event(doctor_id, event_type, token_data):
    """Broadcast queue event to all connected clients for a doctor."""
    try:
        from channels.layers import get_channel_layer
        
        queue_group_name = f'queue_{doctor_id}'
        
        # Get queue data
        from django.utils import timezone as dj_timezone
        from datetime import date
        
        today = dj_timezone.now().date()
        tokens = QueueToken.objects.filter(
            doctor_id=doctor_id,
            joined_at__date=today
        ).select_related('patient').order_by('token_number')
        
        waiting_tokens = tokens.filter(status='WAITING')
        current_token = tokens.filter(status='WITH_DOCTOR').first()
        
        queue_data = {
            'doctor_id': doctor_id,
            'current_token': {
                'id': current_token.id if current_token else None,
                'number': current_token.token_number if current_token else None,
                'label': current_token.token_label if current_token else None,
                'patient_name': current_token.patient.user.get_full_name() if current_token else None
            } if current_token else None,
            'waiting_count': waiting_tokens.count()
        }
        
        # Create event payload
        event_payload = {
            'type': 'queue_event',
            'event_type': event_type,
            'data': {
                'token': token_data,
                'queue': queue_data
            },
            'timestamp': timezone.now().isoformat()
        }
        
        # Broadcast to all clients in this doctor's queue group
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            queue_group_name,
            event_payload
        )
        
    except Exception as e:
        print(f"Error broadcasting queue event: {str(e)}")
