from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Signal handler to perform actions when a user is created.
    This can be extended to create user profiles or other related objects.
    """
    if created:
        # You can add code here to create a profile or perform other actions
        pass