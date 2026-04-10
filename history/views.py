from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from accounts.models import User
from .models import EmploymentHistory

# Create your views here.

# --- Role Check Helpers ---
def is_employee(user):
    return user.is_authenticated and user.role == 'EMP'

def is_hr(user):
    return user.is_authenticated and user.role == 'HR'

def is_head(user):
    return user.is_authenticated and user.role == 'HEAD'

def is_sd(user):
    # Assuming School Director has ADMIN level privileges
    return user.is_authenticated and user.role == 'ADMIN'

@login_required
def employee_timeline(request, employee_id=None):
    """
    Retrieves timeline history for a specific employee.
    If employee_id is not provided, defaults to the logged-in user.
    """
    if employee_id:
        target_employee = get_object_or_404(User, id=employee_id)
    else:
        target_employee = request.user

    user = request.user

    # --- Role-Based Access Control ---
    has_permission = False
    if user == target_employee:
        has_permission = True  # Can view own timeline
    elif user.role in ['HR', 'ADMIN']:
        has_permission = True  # HR/SD can view everyone
    elif user.role == 'HEAD' and user.department == target_employee.department:
        has_permission = True  # Heads can view their own department members

    if not has_permission:
        return JsonResponse({'error': 'Permission Denied. You cannot view this timeline.'}, status=403)

    history_entries = EmploymentHistory.objects.filter(employee=target_employee).order_by('-date')

    # Support JSON response if requested by frontend JS API calls
    if request.headers.get('Accept') == 'application/json' or request.GET.get('format') == 'json':
        data = list(history_entries.values('change_type', 'from_value', 'to_value', 'date', 'recorded_by__first_name', 'recorded_by__last_name'))
        return JsonResponse({'employee': target_employee.username, 'history': data})

    return render(request, 'history/timeline.html', {'target_employee': target_employee, 'history_entries': history_entries})

@login_required
@user_passes_test(is_employee)
def employee_profile(request):
    history_entries = EmploymentHistory.objects.filter(employee=request.user).order_by('-date')
    context = {
        'employee': request.user,
        'target_employee': request.user,
        'history_entries': history_entries
    }
    return render(request, 'employee/emp_profile_view.html', context)

@login_required
@user_passes_test(is_hr)
def hr_profile(request):
    history_entries = EmploymentHistory.objects.filter(employee=request.user).order_by('-date')
    context = {
        'employee': request.user,
        'target_employee': request.user,
        'history_entries': history_entries
    }
    return render(request, 'hr/hr_profile_view.html', context)

@login_required
@user_passes_test(is_head)
def head_profile(request):
    history_entries = EmploymentHistory.objects.filter(employee=request.user).order_by('-date')
    context = {
        'employee': request.user,
        'target_employee': request.user,
        'history_entries': history_entries
    }
    return render(request, 'head/head_profile_view.html', context)

@login_required
@user_passes_test(is_sd)
def sd_profile(request):
    history_entries = EmploymentHistory.objects.filter(employee=request.user).order_by('-date')
    context = {
        'employee': request.user,
        'target_employee': request.user,
        'history_entries': history_entries
    }
    return render(request, 'sd/sd_profile_view.html', context)