from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

# Create your models here.
class User(AbstractUser):
    last_active = models.DateTimeField(null=True, blank=True)
    is_online = models.BooleanField(default=False)
    is_typing = models.BooleanField(default=False)
    # Use string reference to avoid circular import
    typing_in_conversation = models.ForeignKey(
        'chat.Conversation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='typing_users'
    )

    def update_last_active(self):
        """Update the last active timestamp to current time"""
        self.last_active = timezone.now()
        self.save(update_fields=['last_active'])

    def set_online_status(self, status):
        """Set user's online status safely"""
        if not isinstance(status, bool):
            return False
        self.is_online = status
        self.save(update_fields=['is_online'])
        return True

    def set_typing_status(self, is_typing, conversation=None):
        """Set user's typing status and the conversation they're typing in"""
        if not isinstance(is_typing, bool):
            return False

        self.is_typing = is_typing
        if is_typing and conversation:
            self.typing_in_conversation = conversation
        else:
            self.typing_in_conversation = None

        self.save(update_fields=['is_typing', 'typing_in_conversation'])
        return True
