from django.db import models
from django.conf import settings

class NotificationPreference(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_preference')
    receive_leave_updates = models.BooleanField(default=True)
    receive_approvals = models.BooleanField(default=True)
    receive_evaluation_reminders = models.BooleanField(default=True)
    receive_system_announcements = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username}'s Notification Preferences"

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('Leave Update', 'Leave Update'),
        ('Pending Approval', 'Pending Approval'),
        ('System Announcement', 'System Announcement'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    target_url = models.CharField(max_length=500, blank=True, null=True)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notification_type}] {self.user.username}: {self.message[:20]}"
