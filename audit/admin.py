from django.contrib import admin
from .models import LoginLog, ActivityLog

@admin.register(LoginLog)
class LoginLogAdmin(admin.ModelAdmin):
    list_display = ('username', 'ip_address', 'datetime', 'status')
    list_filter = ('status', 'datetime')

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('actor', 'action', 'module', 'timestamp', 'ip_address')
    list_filter = ('module', 'timestamp')