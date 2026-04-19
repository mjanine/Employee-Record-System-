import datetime
from django.conf import settings
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.urls import reverse
from accounts.models import SystemConfig

class EnforcePasswordChangeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        config = SystemConfig.objects.first()
        enforce_password_change = bool(config.force_password_change) if config else False

        if request.user.is_authenticated and enforce_password_change and getattr(request.user, 'must_change_password', False):
            allowed_paths = [reverse('password_change'), reverse('logout')]
            # Allow them to navigate to the password change view, logout, or load static media
            if request.path not in allowed_paths and not request.path.startswith('/static/') and not request.path.startswith('/media/'):
                return redirect('password_change')
                
        return self.get_response(request)

class SessionTimeoutMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            # 1. Get your setting from the database
            config = SystemConfig.objects.first()
            timeout_minutes = config.session_timeout if config else 30
            
            last_activity = request.session.get('last_activity')
            now = datetime.datetime.now().timestamp()

            if last_activity:
                elapsed = (now - last_activity) / 60
                if elapsed > timeout_minutes:
                    logout(request)
                    return self.get_response(request) # Redirect happens on next load

            # 2. Update the timestamp for this click
            request.session['last_activity'] = now

        return self.get_response(request)