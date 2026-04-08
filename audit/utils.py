from .models import ActivityLog

def log_activity(actor, action, target_user=None, details=""):
    ActivityLog.objects.create(
        actor=actor, 
        action=action, 
        target_user=target_user, 
        details=details
    )