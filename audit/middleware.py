import json
from .models import ActivityLog, LoginLog

class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # We only want to log actions of logged-in users 
        # and only "active" actions (POST, PUT, DELETE)
        if request.user.is_authenticated and request.method in ['POST', 'PUT', 'DELETE']:
            
            # Skip logging sensitive login/password pages to keep passwords out of the DB
            if 'login' in request.path or 'password' in request.path:
                return response

            action = f"{request.method} request to {request.path}"
            
            # Get IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')

            ActivityLog.objects.create(
                actor=request.user,
                action=action,
                module=request.path.split('/')[1] if len(request.path.split('/')) > 1 else "Root",
                details=f"User accessed {request.path}",
                ip_address=ip
            )

        return response