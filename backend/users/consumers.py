import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()

class UserStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add(
            'user_status',
            self.channel_name
        )
        await self.accept()

        # Set user as online when they connect
        if self.scope["user"].is_authenticated:
            await self.set_user_online(self.scope["user"].id, True)

            # Broadcast to all clients that this user is online
            await self.channel_layer.group_send(
                'user_status',
                {
                    'type': 'user_status',
                    'user_id': self.scope["user"].id,
                    'is_online': True
                }
            )

    async def disconnect(self, close_code):
        # Set user as offline when they disconnect
        if self.scope["user"].is_authenticated:
            await self.set_user_online(self.scope["user"].id, False)

            # Update last active time
            await self.update_last_active(self.scope["user"].id)

            # Broadcast to all clients that this user is offline
            await self.channel_layer.group_send(
                'user_status',
                {
                    'type': 'user_status',
                    'user_id': self.scope["user"].id,
                    'is_online': False
                }
            )

        # Leave the group
        await self.channel_layer.group_discard(
            'user_status',
            self.channel_name
        )

    async def receive(self, text_data):
        if not self.scope["user"].is_authenticated:
            return

        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'typing_status':
            conversation_id = data.get('conversation_id')
            is_typing = data.get('is_typing', False)

            # Update user's typing status in the database
            await self.set_typing_status(
                self.scope["user"].id,
                is_typing,
                conversation_id
            )

            # Broadcast typing status to all clients
            await self.channel_layer.group_send(
                'user_status',
                {
                    'type': 'typing_status',
                    'user_id': self.scope["user"].id,
                    'is_typing': is_typing,
                    'conversation_id': conversation_id
                }
            )

    # Handler for user status updates
    async def user_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': event['user_id'],
            'is_online': event['is_online']
        }))

    # Handler for typing status updates
    async def typing_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing_status',
            'user_id': event['user_id'],
            'is_typing': event['is_typing'],
            'conversation_id': event['conversation_id']
        }))

    # Database operations
    @database_sync_to_async
    def set_user_online(self, user_id, status):
        try:
            user = User.objects.get(id=user_id)
            user.set_online_status(status)
            return True
        except User.DoesNotExist:
            return False

    @database_sync_to_async
    def update_last_active(self, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.update_last_active()
            return True
        except User.DoesNotExist:
            return False

    @database_sync_to_async
    def set_typing_status(self, user_id, is_typing, conversation_id=None):
        try:
            from chat.models import Conversation
            user = User.objects.get(id=user_id)

            conversation = None
            if conversation_id:
                try:
                    conversation = Conversation.objects.get(id=conversation_id)
                except Conversation.DoesNotExist:
                    pass

            user.set_typing_status(is_typing, conversation)
            return True
        except User.DoesNotExist:
            return False