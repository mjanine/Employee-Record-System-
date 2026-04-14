from django.db import models
from django.conf import settings

class LoginLog(models.Model):
    # Foreign Key to your custom accounts.User
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    username = models.CharField(max_length=150)
    ip_address = models.GenericIPAddressField()
    user_agent = models.CharField(max_length=255, null=True, blank=True)
    datetime = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20) # Success/Failed
    is_success = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} - {self.status}"

class ActivityLog(models.Model):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activity_logs')
    target_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='targeted_activity_logs')
    action = models.CharField(max_length=255)
    module = models.CharField(max_length=100)
    details = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)

    