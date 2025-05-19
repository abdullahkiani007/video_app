from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message

# You can add signal handlers here for notifications or other functionality
# For example:
# @receiver(post_save, sender=Message)
# def notify_message_received(sender, instance, created, **kwargs):
#     if created:
#         # Send notification logic here
#         pass