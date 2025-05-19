# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, Conversation
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Use a global room name instead of dynamic room_name
        self.room_group_name = 'global_chat'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Send last 50 messages
        messages = await self.get_last_messages(50)
        if messages:
            await self.send(text_data=json.dumps({
                'type': 'history',
                'messages': messages
            }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Notify others that user has left
        if hasattr(self, 'user_id'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'userId': self.user_id
                }
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type', '')

        if message_type == 'join':
            self.user_id = data.get('userId', '')
            self.username = data.get('username', '')

            # Store user in connected users
            await self.add_user_to_room()

            # Send current users list to all
            await self.send_users_list()

        elif message_type == 'message':
            # Store message in database
            await self.save_message(data)

            # Broadcast message to room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': data
                }
            )

        elif message_type in ['join-call', 'leave-call', 'offer', 'answer', 'ice-candidate']:
            # Handle WebRTC signaling
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': message_type.replace('-', '_'),
                    'data': data
                }
            )

    # Handler for chat messages
    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))

    # Handler for user left notification
    async def user_left(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user-left',
            'userId': event['userId']
        }))

    # Handler for WebRTC offer
    async def offer(self, event):
        await self.send(text_data=json.dumps(event['data']))

    # Handler for WebRTC answer
    async def answer(self, event):
        await self.send(text_data=json.dumps(event['data']))

    # Handler for ICE candidates
    async def ice_candidate(self, event):
        await self.send(text_data=json.dumps(event['data']))

    # Handler for join call
    async def join_call(self, event):
        await self.send(text_data=json.dumps(event['data']))

    # Handler for leave call
    async def leave_call(self, event):
        await self.send(text_data=json.dumps(event['data']))

    # Database operations
    @database_sync_to_async
    def get_last_messages(self, count):
        # Get or create global conversation
        conversation, _ = Conversation.objects.get_or_create(name='global')

        # Get last messages
        messages = Message.objects.filter(conversation=conversation).order_by('-created_at')[:count]

        # Convert to list of dicts
        return [
            {
                'type': 'message',
                'userId': str(msg.sender.id),
                'username': msg.sender.username,
                'text': msg.content,
                'timestamp': msg.created_at.isoformat()
            }
            for msg in reversed(messages)
        ]

    @database_sync_to_async
    def save_message(self, data):
        # Get or create global conversation
        conversation, _ = Conversation.objects.get_or_create(name='global')

        # Get user
        try:
            user = User.objects.get(id=data.get('userId'))
        except User.DoesNotExist:
            # Create anonymous user if needed
            user = User.objects.get_or_create(username='Anonymous')[0]

        # Create message
        Message.objects.create(
            conversation=conversation,
            sender=user,
            content=data.get('text', '')
        )

    # Room user management
    @database_sync_to_async
    def add_user_to_room(self):
        # This would typically involve some caching mechanism or database
        # For simplicity, we'll just broadcast the join event
        return self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_join',
                'userId': self.user_id,
                'username': self.username
            }
        )

    async def user_join(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user-join',
            'userId': event['userId'],
            'username': event['username']
        }))

    async def send_users_list(self):
        # In a real implementation, you'd get this from a cache or database
        # For now, we'll just send a placeholder
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'users_list',
                'users': []  # This would be populated from your user tracking system
            }
        )

    async def users_list(self, event):
        await self.send(text_data=json.dumps({
            'type': 'users',
            'users': event['users']
        }))