from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Count, Q
from django.utils import timezone
from django.contrib import messages
from django.utils.dateparse import parse_date
import calendar

from .models import AttendanceLog
from .forms import AttendanceEditForm
from accounts.models import User, Department

# Create your views here.

# --- Helper functions for role checks ---
def is_hr_or_admin(user):
    return user.is_authenticated and user.role in ['HR', 'ADMIN']

def is_head(user):
    return user.is_authenticated and user.role == 'HEAD'

def is_sd_or_admin(user):
    # Assuming School Director (SD) is a role
    return user.is_authenticated and user.role in ['ADMIN', 'SD']


# @login_required # Temporarily commented out for testing
# @user_passes_test(is_hr_or_admin) # Temporarily commented out for testing
def hr_attendance(request):
    """
    Displays all attendance logs for HR and Admins with filtering.
    """
    logs = AttendanceLog.objects.select_related('employee__department', 'edited_by').order_by('-date', 'employee__last_name')

    # Filtering
    employee_id = request.GET.get('employee')
    department_id = request.GET.get('department')
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')

    if employee_id:
        logs = logs.filter(employee_id=employee_id)
    if department_id:
        logs = logs.filter(employee__department_id=department_id)
    if start_date_str and (start_date := parse_date(start_date_str)):
        logs = logs.filter(date__gte=start_date)
    if end_date_str and (end_date := parse_date(end_date_str)):
        logs = logs.filter(date__lte=end_date)

    context = {
        'attendance_logs': logs,
        'all_employees': User.objects.filter(is_active=True).order_by('last_name', 'first_name'),
        'all_departments': Department.objects.filter(is_active=True).order_by('name'),
        'filter_values': request.GET,
        'page_title': 'Master Attendance Log'
    }
    return render(request, 'attendance/hr_attendance.html', context)

# @login_required # Temporarily commented out for testing
def emp_attendance(request):
    """
    Displays attendance logs for the currently logged-in employee.
    Displays attendance logs for the currently logged-in employee with date filtering.
    """
    if request.user.is_authenticated:
        employee = request.user
        logs = AttendanceLog.objects.filter(employee=employee).order_by('-date')
        
        # Date range filtering
        start_date_str = request.GET.get('start_date')
        end_date_str = request.GET.get('end_date')

        if start_date_str and (start_date := parse_date(start_date_str)):
            logs = logs.filter(date__gte=start_date)
        if end_date_str and (end_date := parse_date(end_date_str)):
            logs = logs.filter(date__lte=end_date)
    else:
        # Fallback for testing: return all logs if no user is logged in
        logs = AttendanceLog.objects.all().order_by('-date') # Or .none() if you prefer empty

    context = {
        'attendance_logs': logs,
        'filter_values': request.GET,
        'page_title': 'My Attendance Records'
    }
    return render(request, 'attendance/emp_attendance.html', context)

# @login_required # Temporarily commented out for testing
# @user_passes_test(is_head) # Temporarily commented out for testing
def head_attendance(request):
    """
    Displays attendance logs for employees in the department of the logged-in Head.
    """
    department = None
    # --- TEMPORARY TESTING CODE ---
    if request.user.is_authenticated and request.user.role == 'HEAD':
        department = request.user.department
    else:
        # Fallback for testing: find the first department that has a head.
        head_user = User.objects.filter(role='HEAD', department__isnull=False).first()
        if head_user:
            department = head_user.department
    # --- END TEMPORARY CODE ---

    if department:
        logs = AttendanceLog.objects.filter(employee__department=department).select_related('employee').order_by('-date', 'employee__last_name')
    else:
        logs = AttendanceLog.objects.none()
    
    context = {
        'attendance_logs': logs,
        'department': department,
        'page_title': f'{department.name} Department Attendance' if department else 'Department Attendance'
    }
    return render(request, 'attendance/head_attendance.html', context)

# @login_required # Temporarily commented out for testing
# @user_passes_test(is_sd_or_admin) # Temporarily commented out for testing
def sd_attendance(request):
    """
    Displays an aggregated summary of attendance for a given month and year.
    """
    today = timezone.now()
    try:
        year = int(request.GET.get('year', today.year))
        month = int(request.GET.get('month', today.month))
    except (ValueError, TypeError):
        year = today.year
        month = today.month

    summary = AttendanceLog.objects.filter(date__year=year, date__month=month).aggregate(
        present_count=Count('id', filter=Q(status='PRESENT')),
        absent_count=Count('id', filter=Q(status='ABSENT')),
        late_count=Count('id', filter=Q(status='LATE')),
        undertime_count=Count('id', filter=Q(status='UNDERTIME')),
    )
    context = {
        'summary': summary,
        'total_employees': User.objects.filter(is_active=True).count(),
        'selected_year': year,
        'selected_month': month,
        'years': range(today.year - 5, today.year + 2),
        'months': [(i, calendar.month_name[i]) for i in range(1, 13)],
        'page_title': 'Monthly Attendance Summary'
    }
    return render(request, 'attendance/sd_attendance.html', context)

# @login_required # Temporarily commented out for testing
# @user_passes_test(is_hr_or_admin) # Temporarily commented out for testing
def edit_log(request, log_id):
    """
    Handles the editing of a specific attendance log by HR/Admin.
    """
    log_instance = get_object_or_404(AttendanceLog, id=log_id)
    
    if request.method == 'POST':
        form = AttendanceEditForm(request.POST, instance=log_instance)
        if form.is_valid():
            log = form.save(commit=False)
            
            # --- TEMPORARY TESTING CODE ---
            if request.user.is_authenticated:
                log.edited_by = request.user
            else:
                # Fallback for testing when no user is logged in
                editor = User.objects.filter(role__in=['ADMIN', 'HR']).first() or User.objects.first()
                log.edited_by = editor
            # --- END TEMPORARY CODE ---
            log.save()
            messages.success(request, f"Attendance log for {log_instance.employee.get_full_name()} on {log_instance.date} has been updated.")
            return redirect('attendance:hr_attendance')
    else:
        form = AttendanceEditForm(instance=log_instance)
        
    context = {
        'form': form,
        'log': log_instance,
        'page_title': f'Edit Log for {log_instance.employee.get_full_name()}'
    }
    return render(request, 'attendance/edit_log.html', context)
