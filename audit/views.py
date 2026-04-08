from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import LoginLog, ActivityLog
from django.utils.dateparse import parse_date
from django.db.models import Q

@login_required
def audit_trail_view(request):
    # Fetch all logs, newest first
    login_logs = LoginLog.objects.all().order_by('-datetime')
    activity_logs = ActivityLog.objects.all().order_by('-timestamp')
    
    # Filtering Logic
    date_from = request.GET.get('from_date')
    date_to = request.GET.get('to_date')
    status = request.GET.get('status')
    action_type = request.GET.get('action_type')
    search_term = request.GET.get('search')

    if search_term:
        login_logs = login_logs.filter(
            Q(username__icontains=search_term) |
            Q(ip_address__icontains=search_term)
        )
        activity_logs = activity_logs.filter(
            Q(actor__username__icontains=search_term) |
            Q(target_user__username__icontains=search_term) |
            Q(ip_address__icontains=search_term) |
            Q(action__icontains=search_term)
        )

    if date_from:
        login_logs = login_logs.filter(datetime__date__gte=parse_date(date_from))
        activity_logs = activity_logs.filter(timestamp__date__gte=parse_date(date_from))
        
    if date_to:
        login_logs = login_logs.filter(datetime__date__lte=parse_date(date_to))
        activity_logs = activity_logs.filter(timestamp__date__lte=parse_date(date_to))
        
    if status:
        login_logs = login_logs.filter(status__iexact=status)

    if action_type:
        activity_logs = activity_logs.filter(action__icontains=action_type)

    context = {
        'login_logs': login_logs,
        'activity_logs': activity_logs,
        'current_search': search_term,
        'current_from_date': date_from,
        'current_to_date': date_to,
        'current_status': status,
        'current_action_type': action_type,
    }
    return render(request, 'admin/audit_trails.html', context)