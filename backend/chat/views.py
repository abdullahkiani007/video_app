from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from .serializers import ConversationSerializer, ConversationDetailSerializer, MessageSerializer

User = get_user_model()

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return only conversations where the current user is a participant
        return Conversation.objects.filter(participants=self.request.user)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ConversationDetailSerializer
        return ConversationSerializer

    def create(self, request):
        # Extract the user IDs from the request data
        participant_ids = request.data.get('participants', [])

        # Ensure the current user is included in participants
        if request.user.id not in participant_ids:
            participant_ids.append(request.user.id)

        # Check if all participants exist
        try:
            participants = [User.objects.get(id=user_id) for user_id in participant_ids]
        except User.DoesNotExist:
            return Response({"error": "One or more users do not exist"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if a conversation with these exact participants already exists
        # This is a simplified approach; for larger applications, you might need a more efficient method
        existing_conversations = Conversation.objects.all()
        for conv in existing_conversations:
            conv_participants = set(conv.participants.values_list('id', flat=True))
            if conv_participants == set(participant_ids):
                serializer = self.get_serializer(conv)
                return Response(serializer.data, status=status.HTTP_200_OK)

        # Create a new conversation
        conversation = Conversation.objects.create()
        conversation.participants.set(participants)

        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        conversation = self.get_object()

        # Check if the user is a participant in this conversation
        if not conversation.participants.filter(id=request.user.id).exists():
            return Response({"error": "You are not a participant in this conversation"},
                           status=status.HTTP_403_FORBIDDEN)

        # Create the message
        content = request.data.get('content')
        if not content:
            return Response({"error": "Message content is required"},
                           status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content
        )

        # Update the conversation's updated_at timestamp
        conversation.save()  # This will trigger the auto_now field

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        messages = conversation.messages.all()

        # Mark messages as read if the current user is not the sender
        unread_messages = messages.filter(is_read=False).exclude(sender=request.user)
        for message in unread_messages:
            message.is_read = True
            message.save()

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


class MessageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return all messages since every user is a participant in every conversation
        return Message.objects.all()

    @action(detail=False, methods=['get'])
    def global_messages(self, request):
        # Return all messages
        messages = Message.objects.all()
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)