from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest, HttpResponseForbidden
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.utils.dateparse import parse_date
import json 
from datetime import timedelta
from django.db import models, transaction # Correctly added here
from django.db.models import Q, Count
from django.urls import reverse
from django.urls.exceptions import NoReverseMatch
from django.contrib.sessions.models import Session

from audit.models import LoginLog
from audit.utils import log_activity
from .models import User, Department, EmployeeProfile, SystemConfig, ReportExportHistory
from documents.models import Document
from documents.forms import DocumentUploadForm
from notifications.models import Notification
from evaluations.models import EvaluationRecord
from utils.pdf_generator import generate_pdf
from utils.excel_generator import generate_excel

# ADDED AddEmployeeForm TO THIS LIST BELOW:
from .forms import (
    CustomUserCreationForm, CustomUserChangeForm, AssignRoleForm, 
    AccountStatusForm, AdminPasswordResetForm, DepartmentForm, 
    AddEmployeeForm, SdProfileEditForm
)

# Helper function for admin check
def is_admin(user):
    return user.is_authenticated and user.role == 'ADMIN'

def is_hr(user):
    return user.is_authenticated and user.role == 'HR'

def is_head(user):
    return user.is_authenticated and user.role == 'HEAD'

def is_sd(user):
    return user.is_authenticated and user.role == 'SD'


def is_sd_only(user):
    return user.is_authenticated and user.role == 'SD'

def is_emp(user):
    return user.is_authenticated and user.role == 'EMP'

def is_hr_or_admin(user):
    return user.is_authenticated and user.role in ['HR', 'ADMIN']


def is_hr_admin_or_head(user):
    return user.is_authenticated and user.role in ['HR', 'ADMIN', 'HEAD']


def _get_security_config():
    config, _ = SystemConfig.objects.get_or_create(pk=1)
    return config

def login_view(request):
    # If a user is already logged in, redirect them from the login page.
    if request.user.is_authenticated:
        # If they must change their password, send them there first.
        if getattr(request.user, 'must_change_password', False):
            return redirect('password_change')
        # Otherwise, send them to their respective dashboard.
        if request.user.role == 'ADMIN':
            return redirect('admin_dashboard')
        if request.user.role == 'HR':
            return redirect('hr_dashboard')
        if request.user.role == 'HEAD':
            return redirect('head_dashboard')
        if request.user.role == 'SD':
            return redirect('sd_dashboard')
        return redirect('employee_dashboard')

    if request.method == 'POST':
        username_or_email = request.POST.get('username')
        password = request.POST.get('password')
        
        user = None
        # Try authenticating by username
        try:
            user = User.objects.get(username=username_or_email)
        except User.DoesNotExist:
            # If not found by username, try by email
            try:
                user = User.objects.get(email=username_or_email)
            except User.DoesNotExist:
                pass # User not found by username or email

        if user is not None:
            if user.is_locked:
                messages.error(request, "Your account is locked. Please contact an administrator.")
                return render(request, 'login/login.html')

            if not user.is_active:
                messages.error(request, "Your account is inactive. Please contact an administrator.")
                return render(request, 'login/login.html')

            authenticated_user = authenticate(request, username=user.username, password=password)

            if authenticated_user is not None:
                login(request, authenticated_user)
                # Reset failed login attempts on successful login
                authenticated_user.failed_login_attempts = 0
                authenticated_user.save()

                if authenticated_user.must_change_password:
                    messages.info(request, "You must change your password before proceeding.")
                    return redirect('password_change') # Assuming a password change URL exists
                
                if authenticated_user.role == 'ADMIN':
                    return redirect('admin_dashboard')
                elif authenticated_user.role == 'HR':
                    return redirect('hr_dashboard')
                elif authenticated_user.role == 'HEAD':
                    return redirect('head_dashboard')
                elif authenticated_user.role == 'SD':
                    return redirect('sd_dashboard')
                else:
                    return redirect('employee_dashboard')
            else:
                # Increment failed login attempts
                user.failed_login_attempts += 1
                config = _get_security_config()
                if user.failed_login_attempts >= config.max_failed_login_attempts:
                    user.is_locked = True
                    messages.error(request, "Too many failed login attempts. Your account has been locked.")
                else:
                    messages.error(request, "Invalid username or password.")
                user.save()
        else:
            messages.error(request, "Invalid username or password.")
            
    return render(request, 'login/login.html')

def logout_view(request):
    logout(request)
    messages.info(request, "You have been successfully logged out.")
    return redirect('login')

@login_required
@user_passes_test(is_admin)
def admin_dashboard(request):
    today = timezone.now().date()

    def role_label(role_code):
        return dict(User.ROLE_CHOICES).get(role_code, role_code)

    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True, is_locked=False).count()
    inactive_users = User.objects.filter(is_active=False).count()
    locked_users = User.objects.filter(is_locked=True).count()
    total_departments = Department.objects.count()

    session_count = 0
    for session in Session.objects.filter(expire_date__gte=timezone.now()):
        if session.get_decoded().get('_auth_user_id'):
            session_count += 1

    role_summary = []
    for role_code, _role_name in User.ROLE_CHOICES:
        role_summary.append({
            'role': role_code,
            'label': role_label(role_code),
            'count': User.objects.filter(role=role_code).count(),
        })

    login_logs_qs = LoginLog.objects.order_by('-datetime')
    recent_login_activity = login_logs_qs.select_related('user')[:7]
    successful_login_today = login_logs_qs.filter(status='Success', datetime__date=today).count()
    failed_login_count = login_logs_qs.filter(status='Failed').count()
    failed_login_today = login_logs_qs.filter(status='Failed', datetime__date=today).count()
    pending_actions = locked_users + failed_login_today

    login_chart_labels = []
    login_chart_success = []
    login_chart_failed = []
    for days_ago in range(6, -1, -1):
        target_date = today - timedelta(days=days_ago)
        login_chart_labels.append(target_date.strftime('%b %d'))
        login_chart_success.append(login_logs_qs.filter(status='Success', datetime__date=target_date).count())
        login_chart_failed.append(login_logs_qs.filter(status='Failed', datetime__date=target_date).count())

    system_notifications = Notification.objects.filter(user=request.user).order_by('-created_at')[:5]

    context = {
        'welcome_name': request.user.first_name or request.user.username,
        'stats': {
            'total_users': total_users,
            'active_users': active_users,
            'total_departments': total_departments,
        },
        'system_overview': {
            'total_users': total_users,
            'total_departments': total_departments,
            'active_sessions': session_count,
        },
        'user_account_summary': {
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': inactive_users,
            'locked_users': locked_users,
        },
        'role_summary': role_summary,
        'recent_login_activity': recent_login_activity,
        'failed_login_count': failed_login_count,
        'failed_login_today': failed_login_today,
        'successful_login_today': successful_login_today,
        'pending_actions': pending_actions,
        'system_notifications': system_notifications,
        'login_chart_data': {
            'labels': login_chart_labels,
            'success': login_chart_success,
            'failed': login_chart_failed,
        },
        'dashboard_payload': {
            'login_chart_data': {
                'labels': login_chart_labels,
                'success': login_chart_success,
                'failed': login_chart_failed,
            },
            'role_summary': role_summary,
        },
        'quick_action_urls': {
            'manage_users': reverse('user_management'),
            'manage_departments': reverse('department_management'),
            'audit_trails': reverse('audit_trails'),
            'export_report': reverse('audit_trails'),
        },
    }
    return render(request, 'admin/dashboard.html', context)

from attendance.models import AttendanceLog
from leaves.models import LeaveRequest
from applications.models import Application
from notifications.models import Notification

@login_required
@user_passes_test(is_hr)
def hr_dashboard(request):
    today = timezone.now().date()

    def safe_reverse(name, fallback='#'):
        try:
            return reverse(name)
        except NoReverseMatch:
            return fallback
    
    # 1. Summary Cards
    total_employees = User.objects.filter(role='EMP').count()
    active_employees = User.objects.filter(role='EMP', is_active=True, is_locked=False).count()
    
    on_leave_today = LeaveRequest.objects.filter(
        status=LeaveRequest.Status.APPROVED,
        start_date__lte=today,
        end_date__gte=today
    ).values('user').distinct().count()

    # 2. Attendance Pie Chart Data
    present_today = AttendanceLog.objects.filter(date=today, status__in=[AttendanceLog.Status.PRESENT, AttendanceLog.Status.LATE, AttendanceLog.Status.UNDERTIME]).values('employee').distinct().count()
    absent_today = AttendanceLog.objects.filter(date=today, status=AttendanceLog.Status.ABSENT).values('employee').distinct().count()
    
    # If no absent logs, calculate implicit absents (total - present - on leave)
    if absent_today == 0 and total_employees > 0:
        absent_today = max(0, total_employees - present_today - on_leave_today)
        
    attendance_data = {
        'present': present_today,
        'absent': absent_today,
        'on_leave': on_leave_today
    }

    pending_notifications_qs = Notification.objects.filter(user=request.user, is_read=False)
    pending_notifications = pending_notifications_qs[:5]

    context = {
        'welcome_name': request.user.first_name or request.user.username,
        'welcome_date': today.strftime('%B %d, %Y'),
        'pending_notification_count': pending_notifications_qs.count(),
        'pending_notifications': pending_notifications,
        'total_employees': total_employees,
        'active_employees': active_employees,
        'on_leave_today': on_leave_today,
        'attendance_chart_data': attendance_data,
        'attendance_data': json.dumps(attendance_data),
        'quick_action_urls': {
            'add_employee': safe_reverse('add_employee', '#'),
            'approve_leave': safe_reverse('leaves:hr_leave_history', '#'),
            'generate_report': safe_reverse('hr_reports', '#'),
        },
    }
    return render(request, 'hr/hr_dash.html', context)


@login_required
@user_passes_test(is_hr_or_admin)
def hr_reports_page_view(request):
    departments = Department.objects.filter(is_active=True).order_by('name')
    return render(
        request,
        'hr/hr_reports.html',
        {
            'departments': departments,
            'pdf_export_endpoint': reverse('hr_export_pdf'),
            'excel_export_endpoint': reverse('hr_export_excel'),
        },
    )


@login_required
@user_passes_test(is_head)
def head_dashboard(request):
    today = timezone.now().date()
    
    # Broaden department scope to include explicitly assigned headed departments 
    # to fix visibility gaps when user.department is None or out of sync
    department_scope_ids = set()
    if getattr(request.user, 'department_id', None):
        department_scope_ids.add(request.user.department_id)
    department_scope_ids.update(Department.objects.filter(head=request.user).values_list('id', flat=True))

    primary_department = request.user.department or Department.objects.filter(head=request.user).first()

    def safe_reverse(name, fallback='#'):
        try:
            return reverse(name)
        except NoReverseMatch:
            return fallback

    department_employees = User.objects.filter(department_id__in=department_scope_ids).exclude(role__in=['ADMIN', 'HR', 'SD'])
    total_department_employees = department_employees.count()
    active_department_employees = department_employees.filter(is_active=True, is_locked=False).count()

    department_attendance = AttendanceLog.objects.filter(
        employee__department_id__in=department_scope_ids,
        date=today,
    )

    attendance_counts = {'present': 0, 'absent': 0, 'on_leave': 0}
    attendance_counts['present'] = department_attendance.filter(
        status__in=[AttendanceLog.Status.PRESENT, AttendanceLog.Status.LATE, AttendanceLog.Status.UNDERTIME]
    ).values('employee').distinct().count()
    attendance_counts['absent'] = department_attendance.filter(status=AttendanceLog.Status.ABSENT).values('employee').distinct().count()
    attendance_counts['on_leave'] = LeaveRequest.objects.filter(
        user__department_id__in=department_scope_ids,
        status=LeaveRequest.Status.APPROVED,
        start_date__lte=today,
        end_date__gte=today,
    ).values('user').distinct().count()

    pending_leave_approvals = LeaveRequest.objects.filter(
        user__department_id__in=department_scope_ids,
        status=LeaveRequest.Status.PENDING_HEAD_APPROVAL,
    ).exclude(user=request.user).select_related('user', 'leave_type').order_by('-created_at')[:5]

    evaluation_reminders = Notification.objects.filter(
        user=request.user,
        notification_type='Evaluation Reminder',
        is_read=False,
    ).order_by('-created_at')[:5]

    head_leave_history_url = safe_reverse('leaves:head_leave_history', '#')
    if head_leave_history_url != '#':
        head_leave_history_url = f"{head_leave_history_url}?queue=1"

    context = {
        'welcome_name': request.user.first_name or request.user.username,
        'department_name': primary_department.name if primary_department else 'No Department',
        'total_department_employees': total_department_employees,
        'active_department_employees': active_department_employees,
        'pending_leave_count': pending_leave_approvals.count(),
        'attendance_chart_data': attendance_counts,
        'attendance_data': json.dumps(attendance_counts),
        'pending_leave_approvals': pending_leave_approvals,
        'evaluation_reminders': evaluation_reminders,
        'quick_action_urls': {
            'view_leaves': head_leave_history_url,
            'view_evaluations': safe_reverse('history:head_profile', '#'),
            'view_attendance': safe_reverse('attendance:employee_attendance_records', '#'),
        },
    }
    return render(request, 'head/head_dash.html', context)


@login_required
@user_passes_test(is_sd)
def sd_dashboard(request):
    today = timezone.now().date()

    def safe_reverse(name, fallback='#'):
        try:
            return reverse(name)
        except NoReverseMatch:
            return fallback

    institution_employees = User.objects.exclude(role__in=['ADMIN'])
    total_employees = institution_employees.count()
    active_employees = institution_employees.filter(is_active=True, is_locked=False).exclude(role='ADMIN').count()
    total_departments = Department.objects.filter(is_active=True).count()

    attendance_logs = AttendanceLog.objects.filter(date=today)
    attendance_counts = {
        'present': attendance_logs.filter(status__in=[AttendanceLog.Status.PRESENT, AttendanceLog.Status.LATE, AttendanceLog.Status.UNDERTIME]).values('employee').distinct().count(),
        'absent': attendance_logs.filter(status=AttendanceLog.Status.ABSENT).values('employee').distinct().count(),
        'on_leave': LeaveRequest.objects.filter(
            status=LeaveRequest.Status.APPROVED,
            start_date__lte=today,
            end_date__gte=today,
        ).values('user').distinct().count(),
    }

    leave_overview = {
        'pending_head': LeaveRequest.objects.filter(status=LeaveRequest.Status.PENDING_HEAD_APPROVAL).count(),
        'pending_hr': LeaveRequest.objects.filter(status=LeaveRequest.Status.PENDING_HR_APPROVAL).count(),
        'pending_sd': LeaveRequest.objects.filter(status=LeaveRequest.Status.PENDING_SD_APPROVAL).count(),
        'approved': LeaveRequest.objects.filter(status=LeaveRequest.Status.APPROVED).count(),
        'rejected': LeaveRequest.objects.filter(status=LeaveRequest.Status.REJECTED).count(),
    }

    pending_new_hire_sd = Application.objects.filter(
        type=Application.Type.NEW_EMPLOYEE,
        status=Application.Status.PENDING_SD,
    ).count()
    pending_position_change_sd = Application.objects.filter(
        type=Application.Type.POSITION_CHANGE,
        status=Application.Status.PENDING_SD,
    ).count()

    pending_sd_actions = {
        'leave_requests': leave_overview['pending_sd'],
        'new_hire_applications': pending_new_hire_sd,
        'position_change_requests': pending_position_change_sd,
        'total': leave_overview['pending_sd'] + pending_new_hire_sd + pending_position_change_sd,
    }

    hr_announcements = Notification.objects.filter(
        user=request.user,
        notification_type='System Announcement',
    ).order_by('-created_at')[:5]

    context = {
        'welcome_name': request.user.first_name or request.user.username,
        'total_employees': total_employees,
        'active_employees': active_employees,
        'total_departments': total_departments,
        'leave_overview': leave_overview,
        'pending_sd_actions': pending_sd_actions,
        'attendance_chart_data': attendance_counts,
        'attendance_data': json.dumps(attendance_counts),
        'hr_announcements': hr_announcements,
        'quick_action_urls': {
            'view_leave_summary': safe_reverse('leaves:sd_leave_overview', '#'),
            'view_application_queue': safe_reverse('sd_application_overview', '#'),
            'view_history': safe_reverse('history:sd_profile', '#'),
        },
    }
    return render(request, 'sd/sd_dash.html', context)

@login_required
@user_passes_test(is_emp)
def employee_dashboard(request):
    today = timezone.now().date()
    current_month = today.month
    current_year = today.year
    
    # 1. Current Month Attendance Summary
    attendance_summary = AttendanceLog.objects.filter(
        employee=request.user, 
        date__month=current_month, 
        date__year=current_year
    ).values('status').annotate(count=Count('id'))
    
    # Restructure into a dictionary for easier template access
    attendance_stats = { 'PRESENT': 0, 'ABSENT': 0, 'LATE': 0, 'UNDERTIME': 0 }
    for item in attendance_summary:
        attendance_stats[item['status']] = item['count']
        
    # 2. Recent Leave Requests (Last 5)
    recent_leaves = LeaveRequest.objects.filter(user=request.user).order_by('-created_at')[:5]
    
    # 3. Recent Notifications (Dashboard specific, even though global exists)
    recent_notifications = Notification.objects.filter(user=request.user).order_by('-created_at')[:5]

    month_attendance_summary = {
        'present': attendance_stats.get(AttendanceLog.Status.PRESENT, 0),
        'late': attendance_stats.get(AttendanceLog.Status.LATE, 0),
        'undertime': attendance_stats.get(AttendanceLog.Status.UNDERTIME, 0),
        'absent': attendance_stats.get(AttendanceLog.Status.ABSENT, 0),
    }
    month_attendance_summary['total'] = sum(month_attendance_summary.values())
    
    context = {
        'welcome_name': request.user.first_name or request.user.username,
        'attendance_stats': attendance_stats,
        'month_attendance_summary': month_attendance_summary,
        'recent_leaves': recent_leaves,
        'recent_notifications': recent_notifications,
        'pending_notification_count': Notification.objects.filter(user=request.user, is_read=False).count(),
        'current_month_name': today.strftime('%B %Y')
    }
    return render(request, 'employee/emp_dash.html', context)

@login_required
def employee_profile(request):
    # Fetch all Document objects belonging to the logged-in user
    documents = Document.objects.filter(employee__user=request.user).select_related('employee')
    
    context = {
        'documents': documents,
        'user': request.user,
        'upload_form': DocumentUploadForm(user=request.user)
    }
    return render(request, 'employee/emp_profile_view.html', context)

@login_required
def head_profile(request):
    documents = Document.objects.filter(employee__user=request.user).select_related('employee')
    context = {
        'documents': documents,
        'user': request.user,
        'upload_form': DocumentUploadForm(user=request.user)
    }
    return render(request, 'head/head_profile_view.html', context)

@login_required
def sd_profile(request):
    documents = Document.objects.filter(employee__user=request.user).select_related('employee')
    context = {
        'documents': documents,
        'user': request.user,
        'upload_form': DocumentUploadForm(user=request.user)
    }
    return render(request, 'sd/sd_profile_view.html', context)

@login_required
@user_passes_test(is_sd_only)
def sd_profile_edit(request):
    EmployeeProfile.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        form = SdProfileEditForm(request.POST, user=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your profile has been updated successfully.')
            return redirect('history:sd_profile')
        messages.error(request, 'Please review the highlighted fields and try again.')
    else:
        form = SdProfileEditForm(user=request.user)

    return render(request, 'sd/sd_profile_edit.html', {'form': form, 'user': request.user})

@login_required
@user_passes_test(is_sd)
def sd_documents_view(request):
    documents = Document.objects.filter(employee__user=request.user).select_related('employee')
    return render(request, 'sd/sd_documents_view.html', {'documents': documents})

@login_required
@user_passes_test(is_sd)
def sd_reports(request):
    return render(
        request,
        'sd/sd_reports.html',
        {
            'summary_endpoint': reverse('sd_reports_summary'),
            'pdf_export_endpoint': reverse('sd_export_pdf'),
            'excel_export_endpoint': reverse('sd_export_excel'),
        },
    )


@login_required
@user_passes_test(is_sd)
def sd_reports_summary_api(request):
    total_employees = User.objects.filter(role='EMP').count()
    attendance_logs = AttendanceLog.objects.count()
    leave_requests = LeaveRequest.objects.count()
    evaluation_records = EvaluationRecord.objects.count()

    recent_reports = [
        {
            'generated_on': timezone.localtime(entry.created_at).strftime('%Y-%m-%d %H:%M'),
            'report_type': entry.report_type,
            'format': entry.export_format,
            'scope': entry.scope,
        }
        for entry in ReportExportHistory.objects.select_related('exported_by').all()[:10]
    ]

    return JsonResponse(
        {
            'totals': {
                'total_employees': total_employees,
                'attendance_logs': attendance_logs,
                'leave_requests': leave_requests,
            },
            'report_counts': {
                'employee_list': total_employees,
                'attendance_report': attendance_logs,
                'leave_report': leave_requests,
                'evaluation_summary': evaluation_records,
            },
            'recent_reports': recent_reports,
        }
    )


def _normalize_report_type(report_type):
    value = (report_type or '').strip().lower()
    mapping = {
        'employee list': 'Employee List',
        'attendance report': 'Attendance Report',
        'leave report': 'Leave Report',
        'evaluation summary': 'Evaluation Summary',
    }
    return mapping.get(value)


def _apply_department_filter(queryset, department_value, field_prefix):
    if not department_value:
        return queryset
    department_value = str(department_value).strip()
    if not department_value:
        return queryset
    if department_value.isdigit():
        return queryset.filter(**{f'{field_prefix}__id': int(department_value)})
    return queryset.filter(**{f'{field_prefix}__name__iexact': department_value})


def _get_allowed_status_values(report_type):
    if report_type == 'Employee List':
        return {'ACTIVE', 'INACTIVE', 'ON_LEAVE'}
    if report_type == 'Attendance Report':
        return {
            AttendanceLog.Status.PRESENT,
            AttendanceLog.Status.ABSENT,
            AttendanceLog.Status.LATE,
            AttendanceLog.Status.UNDERTIME,
        }
    if report_type == 'Leave Report':
        return {
            'PENDING_HEAD',
            'PENDING_HR',
            'PENDING_SD',
            'APPROVED',
            'REJECTED',
            'CANCELLED',
        }
    if report_type == 'Evaluation Summary':
        return {
            EvaluationRecord.Status.DRAFT,
            EvaluationRecord.Status.COMPLETED,
        }
    return set()


def _validate_report_status(report_type, raw_status):
    status = (raw_status or '').strip().upper()
    if not status:
        return ''

    allowed_statuses = _get_allowed_status_values(report_type)
    if status not in allowed_statuses:
        allowed_list = ', '.join(sorted(allowed_statuses)) if allowed_statuses else 'No statuses supported'
        raise ValueError(f'Invalid status for {report_type}: {status}. Allowed values: {allowed_list}.')

    return status


def _build_report_queryset(report_type, start_date, end_date, department, status, institution_wide=True):
    if report_type == 'Employee List':
        queryset = (
            EmployeeProfile.objects
            .filter(user__role='EMP')
            .select_related('user', 'user__department')
            .order_by('user__last_name', 'user__first_name')
        )
        queryset = _apply_department_filter(queryset, department if institution_wide else None, 'user__department')

        status_value = (status or '').upper()
        if status_value == 'ACTIVE':
            queryset = queryset.filter(is_active=True, user__is_active=True, user__is_locked=False)
        elif status_value == 'INACTIVE':
            queryset = queryset.filter(
                models.Q(is_active=False)
                | models.Q(user__is_active=False)
                | models.Q(user__is_locked=True)
            )
        elif status_value == 'ON_LEAVE':
            today = timezone.now().date()
            queryset = queryset.filter(
                user__leave_requests__status=LeaveRequest.Status.APPROVED,
                user__leave_requests__start_date__lte=today,
                user__leave_requests__end_date__gte=today,
            ).distinct()

        if start_date:
            queryset = queryset.filter(date_hired__gte=start_date)
        if end_date:
            queryset = queryset.filter(date_hired__lte=end_date)
        return queryset

    if report_type == 'Attendance Report':
        queryset = AttendanceLog.objects.select_related('employee', 'employee__department').order_by('-date', 'employee__last_name')
        queryset = _apply_department_filter(queryset, department if institution_wide else None, 'employee__department')

        if status:
            queryset = queryset.filter(status=status)

        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        return queryset

    if report_type == 'Leave Report':
        queryset = LeaveRequest.objects.select_related('user', 'user__department', 'leave_type').order_by('-created_at')
        queryset = _apply_department_filter(queryset, department if institution_wide else None, 'user__department')

        if status:
            status_mapping = {
                'PENDING_HEAD': LeaveRequest.Status.PENDING_HEAD_APPROVAL,
                'PENDING_HR': LeaveRequest.Status.PENDING_HR_APPROVAL,
                'PENDING_SD': LeaveRequest.Status.PENDING_SD_APPROVAL,
                'APPROVED': LeaveRequest.Status.APPROVED,
                'REJECTED': LeaveRequest.Status.REJECTED,
                'CANCELLED': LeaveRequest.Status.CANCELLED,
            }
            queryset = queryset.filter(status=status_mapping.get(status, status))

        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        return queryset

    if report_type == 'Evaluation Summary':
        queryset = (
            EvaluationRecord.objects
            .select_related('employee', 'employee__department', 'evaluated_by')
            .order_by('-evaluated_at', '-created_at')
        )
        queryset = _apply_department_filter(queryset, department if institution_wide else None, 'employee__department')

        if status:
            queryset = queryset.filter(status=status)

        if start_date:
            queryset = queryset.filter(evaluated_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(evaluated_at__lte=end_date)
        return queryset

    raise ValueError(f'Unsupported report type: {report_type}')


def _build_report_request_data(request, allow_department_filter=True):
    report_type = _normalize_report_type(request.GET.get('report_type'))
    if not report_type:
        raise ValueError('Invalid or missing report_type.')

    start_date = parse_date(request.GET.get('start_date') or '')
    end_date = parse_date(request.GET.get('end_date') or '')
    if start_date and end_date and start_date > end_date:
        raise ValueError('start_date cannot be after end_date.')

    department = request.GET.get('department', '') if allow_department_filter else ''
    status = _validate_report_status(report_type, request.GET.get('status', ''))

    queryset = _build_report_queryset(
        report_type=report_type,
        start_date=start_date,
        end_date=end_date,
        department=department,
        status=status,
        institution_wide=allow_department_filter,
    )

    filters = {
        'start_date': start_date.isoformat() if start_date else '',
        'end_date': end_date.isoformat() if end_date else '',
        'department': department,
        'status': status,
    }
    return report_type, queryset, filters


def _record_report_export(request, report_type, export_format, scope, filters):
    ReportExportHistory.objects.create(
        exported_by=request.user if request.user.is_authenticated else None,
        role=getattr(request.user, 'role', ''),
        report_type=report_type,
        export_format=export_format,
        scope=scope,
        filters=filters or {},
    )


def _build_export_response(buffer, filename, content_type):
    response = HttpResponse(buffer.getvalue(), content_type=content_type)
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


def _export_pdf_for_hr(request):
    report_type, queryset, filters = _build_report_request_data(request, allow_department_filter=True)
    pdf_buffer = generate_pdf(report_type, queryset, filters)
    filename = f"hr_{report_type.lower().replace(' ', '_')}.pdf"
    hr_scope = f"HR - {filters.get('department') or 'All Departments'}"
    _record_report_export(request, report_type, ReportExportHistory.ExportFormat.PDF, hr_scope, filters)
    return _build_export_response(pdf_buffer, filename, 'application/pdf')


def _export_excel_for_hr(request):
    report_type, queryset, filters = _build_report_request_data(request, allow_department_filter=True)
    excel_buffer = generate_excel(report_type, queryset, filters)
    filename = f"hr_{report_type.lower().replace(' ', '_')}.xlsx"
    hr_scope = f"HR - {filters.get('department') or 'All Departments'}"
    _record_report_export(request, report_type, ReportExportHistory.ExportFormat.EXCEL, hr_scope, filters)
    return _build_export_response(
        excel_buffer,
        filename,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )


def _export_pdf_for_sd(request):
    report_type, queryset, filters = _build_report_request_data(request, allow_department_filter=False)
    pdf_buffer = generate_pdf(report_type, queryset, filters)
    filename = f"sd_{report_type.lower().replace(' ', '_')}.pdf"
    _record_report_export(
        request,
        report_type,
        ReportExportHistory.ExportFormat.PDF,
        'Institution-wide',
        filters,
    )
    return _build_export_response(pdf_buffer, filename, 'application/pdf')


def _export_excel_for_sd(request):
    report_type, queryset, filters = _build_report_request_data(request, allow_department_filter=False)
    excel_buffer = generate_excel(report_type, queryset, filters)
    filename = f"sd_{report_type.lower().replace(' ', '_')}.xlsx"
    _record_report_export(
        request,
        report_type,
        ReportExportHistory.ExportFormat.EXCEL,
        'Institution-wide',
        filters,
    )
    return _build_export_response(
        excel_buffer,
        filename,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )


@login_required
@user_passes_test(is_hr_or_admin)
def hr_export_pdf_view(request):
    try:
        return _export_pdf_for_hr(request)
    except ValueError as exc:
        return HttpResponseBadRequest(str(exc))


@login_required
@user_passes_test(is_hr_or_admin)
def hr_export_excel_view(request):
    try:
        return _export_excel_for_hr(request)
    except ValueError as exc:
        return HttpResponseBadRequest(str(exc))


@login_required
@user_passes_test(is_sd_only)
def sd_export_pdf_view(request):
    try:
        return _export_pdf_for_sd(request)
    except ValueError as exc:
        return HttpResponseBadRequest(str(exc))


@login_required
@user_passes_test(is_sd_only)
def sd_export_excel_view(request):
    try:
        return _export_excel_for_sd(request)
    except ValueError as exc:
        return HttpResponseBadRequest(str(exc))


@login_required
def reports_export_pdf_view(request):
    try:
        if request.user.role == 'HR':
            return _export_pdf_for_hr(request)
        if request.user.role == 'SD':
            return _export_pdf_for_sd(request)
    except ValueError as exc:
        return HttpResponseBadRequest(str(exc))
    return HttpResponseForbidden('You are not allowed to export reports from this endpoint.')


@login_required
def reports_export_excel_view(request):
    try:
        if request.user.role == 'HR':
            return _export_excel_for_hr(request)
        if request.user.role == 'SD':
            return _export_excel_for_sd(request)
    except ValueError as exc:
        return HttpResponseBadRequest(str(exc))
    return HttpResponseForbidden('You are not allowed to export reports from this endpoint.')

@login_required
def employee_attendance(request):
    # This view will render the employee's attendance page
    return render(request, 'dashboards/employee_attendance.html')

@login_required
def employee_documents(request):
    # This view will render the employee's documents page
    return render(request, 'dashboards/employee_documents.html')

@login_required
@user_passes_test(is_admin)
def user_management(request):
    search_term = (request.GET.get('search') or '').strip()
    role_filter = (request.GET.get('role') or '').strip().upper()
    status_filter = (request.GET.get('status') or '').strip().lower()
    department_filter = (request.GET.get('department') or '').strip()

    users = User.objects.select_related('department').all().order_by('-date_joined')

    if search_term:
        users = users.filter(
            Q(first_name__icontains=search_term)
            | Q(last_name__icontains=search_term)
            | Q(username__icontains=search_term)
            | Q(email__icontains=search_term)
        )

    if role_filter and role_filter in dict(User.ROLE_CHOICES):
        users = users.filter(role=role_filter)

    if status_filter == 'active':
        users = users.filter(is_active=True)
    elif status_filter == 'inactive':
        users = users.filter(is_active=False)

    if department_filter.isdigit():
        users = users.filter(department_id=int(department_filter))

    departments = Department.objects.filter(is_active=True).order_by('name')

    context = {
        'users': users,
        'departments': departments,
        'filters': {
            'search': search_term,
            'role': role_filter,
            'status': status_filter,
            'department': department_filter,
        },
    }
    return render(request, 'admin/user_management.html', context)


@login_required
@user_passes_test(is_admin)
@require_POST
def create_user(request):
    # This matches the form data sent by your JS
    form = CustomUserCreationForm(request.POST, request.FILES)
    
    if form.is_valid():
        try:
            with transaction.atomic():
                user = form.save()
                
                # Log the activity correctly
                log_activity(
                    actor=request.user,
                    action="Create User",
                    target_user=user,
                    details=f"Created new user {user.username}"
                )
                
            return JsonResponse({
                'status': 'success', 
                'message': f'User {user.username} created successfully.'
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error', 
                'message': f'Database Error: {str(e)}'
            }, status=500)
    else:
        # If the form is invalid (e.g., password mismatch), send errors back to JS
        errors = json.loads(form.errors.as_json())
        return JsonResponse({
            'status': 'error', 
            'message': 'Validation failed.', 
            'errors': errors
        }, status=400)


@login_required
@user_passes_test(is_admin)
def get_user_data(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    data = {
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'username': user.username,
        'role': user.role,
        'department_id': user.department.id if user.department else None,
        'is_active': user.is_active,
        'is_locked': user.is_locked,
        'must_change_password': user.must_change_password,
        'profile_pic_url': user.profile_pic.url if user.profile_pic else None,
        'date_joined': user.date_joined.strftime('%Y-%m-%d %H:%M:%S'),
    }
    return JsonResponse(data)


@login_required
@user_passes_test(is_admin)
def edit_user(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    form = CustomUserChangeForm(request.POST, request.FILES, instance=user)
    if form.is_valid():
        form.save()
        log_activity(
            actor=request.user,
            action="Edit User",
            target_user=user,
            details=f"Updated details for {user.username}"
        )
        messages.success(request, f"User {user.username} updated successfully.")
        return JsonResponse({'status': 'success', 'message': 'User updated successfully.'})
    else:
        errors = form.errors.as_json()
        return JsonResponse({'status': 'error', 'message': 'Error updating user.', 'errors': json.loads(errors)}, status=400)

@login_required
@user_passes_test(is_admin)
@require_POST
def assign_role(request):
    form = AssignRoleForm(request.POST)
    if form.is_valid():
        user_id = form.cleaned_data['user_id']
        new_role = form.cleaned_data['role']
        department = form.cleaned_data['department']

        user = get_object_or_404(User, pk=user_id)
        old_role = user.role
        user.role = new_role
        user.department = department if new_role in ['HEAD', 'EMP'] else None # Allow both Heads and Employees to retain department bindings
        user.save()
        log_activity(
            actor=request.user,
            action="Assign Role",
            target_user=user,
            details=f"Changed role from {old_role} to {new_role}"
        )
        messages.success(request, f"Role for {user.username} updated to {new_role}.")
        return JsonResponse({'status': 'success', 'message': 'Role assigned successfully.'})
    else:
        errors = form.errors.as_json()
        return JsonResponse({'status': 'error', 'message': 'Error assigning role.', 'errors': json.loads(errors)}, status=400)

@login_required
@user_passes_test(is_admin)
@require_POST
def update_account_status(request):
    form = AccountStatusForm(request.POST)
    if form.is_valid():
        user_ids = request.POST.getlist('user_ids[]') # Expecting a list for bulk actions
        action = form.cleaned_data['action']
        
        users_to_update = User.objects.filter(pk__in=user_ids)
        
        for user in users_to_update:
            if action == 'activate':
                user.is_active = True
                user.is_locked = False # Unlock if activating
                user.failed_login_attempts = 0
            elif action == 'deactivate':
                user.is_active = False
            elif action == 'lock':
                user.is_locked = True
            elif action == 'unlock':
                user.is_locked = False
                user.failed_login_attempts = 0 # Reset attempts on unlock
            user.save()
            log_activity(
                actor=request.user,
                action="Update Account Status",
                target_user=user,
                details=f"Account status changed to {action}"
            )
        
        messages.success(request, f"Selected accounts {action}d successfully.")
        return JsonResponse({'status': 'success', 'message': f"Accounts {action}d successfully."})
    else:
        errors = form.errors.as_json()
        return JsonResponse({'status': 'error', 'message': 'Error updating account status.', 'errors': json.loads(errors)}, status=400)

@login_required
@user_passes_test(is_admin)
@require_POST
def reset_password(request):
    form = AdminPasswordResetForm(request.POST)
    if form.is_valid():
        user_id = form.cleaned_data['user_id']
        new_password = form.cleaned_data['new_password1']
        
        user = get_object_or_404(User, pk=user_id)
        user.set_password(new_password)
        user.must_change_password = True # Enforce password change on next login
        user.last_password_change = timezone.now()
        user.save()
        log_activity(
            actor=request.user,
            action="Reset Password",
            target_user=user,
            details="Password reset by administrator"
        )
        messages.success(request, f"Password for {user.username} reset successfully. User must change password on next login.")
        return JsonResponse({'status': 'success', 'message': 'Password reset successfully.'})
    else:
        errors = form.errors.as_json()
        return JsonResponse({'status': 'error', 'message': 'Error resetting password.', 'errors': json.loads(errors)}, status=400)

@login_required
@user_passes_test(is_admin)
@require_POST
def delete_user(request):
    user_ids = request.POST.getlist('user_ids[]')
    if not user_ids:
        return JsonResponse({'status': 'error', 'message': 'No users selected for deletion.'}, status=400)

    # Prevent deleting the currently logged-in admin
    if str(request.user.id) in user_ids:
        return JsonResponse({'status': 'error', 'message': 'Cannot delete your own account.'}, status=400)

    users_to_delete = User.objects.filter(pk__in=user_ids)
    for u in users_to_delete:
        log_activity(
            actor=request.user,
            action="Delete User",
            target_user=None,
            details=f"Deleted user {u.username}"
        )
    deleted_count, _ = users_to_delete.delete()
    messages.success(request, f"{deleted_count} user(s) deleted successfully.")
    return JsonResponse({'status': 'success', 'message': f"{deleted_count} user(s) deleted successfully."})

# Placeholder for password change view if must_change_password is true
@login_required
def password_change(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            # Save the new password first
            updated_user = form.save()
            # Update session hash so the user stays logged in
            update_session_auth_hash(request, updated_user)
            # Explicitly clear the first-login flag
            user = request.user
            user.must_change_password = False
            user.last_password_change = timezone.now()
            user.save()
            messages.success(request, 'Password updated successfully. Welcome back!')
            if user.role == 'ADMIN':
                return redirect('admin_dashboard')
            if user.role == 'HR':
                return redirect('hr_dashboard')
            if user.role == 'HEAD':
                return redirect('head_dashboard')
            if user.role == 'SD':
                return redirect('sd_dashboard')
            return redirect('employee_dashboard')
        else:
            messages.error(request, 'Please correct the error below.')
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'accounts/password_change.html', {'form': form})


@login_required
@user_passes_test(is_admin)
def department_management(request):
    # Using annotate is perfect for keeping the database query efficient
    departments = Department.objects.all().annotate(employee_count=Count('user')).order_by('-is_active', 'name')
    users = User.objects.all().order_by('last_name')
    assigned_head_ids = Department.objects.filter(head__isnull=False).values_list('head_id', flat=True)
    eligible_head_users = users.exclude(id__in=assigned_head_ids)
    
    context = {
        'departments': departments,
        'users': users,
        'eligible_head_users': eligible_head_users,
        'total_user_count': users.count(),
        'eligible_head_count': eligible_head_users.count(),
    }
    return render(request, 'admin/department_management.html', context)

@login_required
@user_passes_test(is_admin)
@require_POST
def create_department(request):
    form = DepartmentForm(request.POST)
    if form.is_valid():
        dept_obj = form.save()
        if dept_obj.head:
            dept_obj.head.role = 'HEAD'
            dept_obj.head.department = dept_obj
            dept_obj.head.save()
            log_activity(
                actor=request.user,
                action="Assign Department Head",
                target_user=dept_obj.head,
                details=f"Assigned as head of {dept_obj.name}"
            )
        return JsonResponse({'status': 'success', 'message': 'Department created successfully.'})
    return JsonResponse({'status': 'error', 'message': 'Invalid form data.', 'errors': json.loads(form.errors.as_json())}, status=400)

@login_required
@user_passes_test(is_admin)
@require_POST
def edit_department(request, dept_id):
    print("--- DEBUG DATA ---")
    print(request.POST)
    dept = get_object_or_404(Department, pk=dept_id)
    
    # Get the IP address from the request metadata
    user_ip = request.META.get('REMOTE_ADDR')
    
    form = DepartmentForm(request.POST, instance=dept)
    if form.is_valid():
        dept_obj = form.save()
        if dept_obj.head:
            dept_obj.head.role = 'HEAD'
            dept_obj.head.department = dept_obj
            dept_obj.head.save()
            
            # Now passing ip_address to satisfy the NOT NULL constraint
            log_activity(
                actor=request.user,
                action="Assign Department Head",
                target_user=dept_obj.head,
                details=f"Assigned as head of {dept_obj.name}",
                ip_address=user_ip  # Ensure this argument name matches your log_activity function
            )
        return JsonResponse({'status': 'success', 'message': 'Department updated successfully.'})
    else:
        print("--- FORM ERRORS ---")
        print(form.errors.as_data())
        return JsonResponse({'status': 'error', 'errors': form.errors.get_json_data()}, status=400)

@login_required
@user_passes_test(is_admin)
def get_department_data(request, dept_id):
    dept = get_object_or_404(Department, pk=dept_id)
    return JsonResponse({
        'name': dept.name,
        'college': dept.college,
        'head_id': dept.head.id if dept.head else None,
        'is_active': dept.is_active
    })

@login_required
@user_passes_test(is_admin)
@require_POST
def deactivate_department(request, dept_id):
    dept = get_object_or_404(Department, pk=dept_id)
    # Toggle logic: if active, deactivate. If inactive, re-activate.
    dept.is_active = not dept.is_active
    dept.save()
    status = "activated" if dept.is_active else "deactivated"
    return JsonResponse({'status': 'success', 'message': f'Department {status} successfully.'})

# ===========================================================
# TASK 04: EMPLOYEE RECORDS (HR CORE)
# ===========================================================

# === TASK 04: EMPLOYEE RECORDS (HR CORE) ===

@login_required
def employee_list(request):
    user = request.user
    search_term = (request.GET.get('search') or '').strip()
    role_filter = (request.GET.get('role') or '').strip().upper()
    employment_type_filter = (request.GET.get('employment_type') or '').strip().upper()
    status_filter = (request.GET.get('status') or '').strip().lower()
    
    # 1. If Admin or HR: See everyone
    if user.role in ['ADMIN', 'HR']:
        employees = User.objects.select_related('department', 'profile').all().order_by('-date_joined')
        template_name = 'hr/hr_employeelist.html'

    # 2. SD: institution-wide read-only list (non-admin staff)
    elif user.role == 'SD':
        employees = User.objects.select_related('department', 'profile').exclude(role='ADMIN').order_by('-date_joined')
        template_name = 'sd/sd_employeelist.html'

    # 3. If Department Head: See ONLY their department
    elif user.role == 'HEAD' or user.role == 'Department Head':
        employees = User.objects.select_related('department', 'profile').filter(department=user.department).order_by('-date_joined')
        template_name = 'hr/hr_employeelist.html'

    # 4. Regular employees see only themselves
    else:
        employees = User.objects.select_related('department', 'profile').filter(id=user.id)
        template_name = 'hr/hr_employeelist.html'

    if search_term:
        employees = employees.filter(
            Q(first_name__icontains=search_term)
            | Q(last_name__icontains=search_term)
            | Q(username__icontains=search_term)
            | Q(profile__employee_id__icontains=search_term)
            | Q(department__name__icontains=search_term)
        )

    if role_filter and role_filter in dict(User.ROLE_CHOICES):
        employees = employees.filter(role=role_filter)

    if employment_type_filter in ['REG', 'PROB', 'CONT']:
        employees = employees.filter(profile__employment_type=employment_type_filter)

    if status_filter == 'active':
        employees = employees.filter(is_active=True, is_locked=False, profile__is_active=True)
    elif status_filter == 'inactive':
        employees = employees.filter(Q(is_active=False) | Q(is_locked=True) | Q(profile__is_active=False))

    employees = list(employees)
    for employee in employees:
        EmployeeProfile.objects.get_or_create(user=employee)

    return render(
        request,
        template_name,
        {
            'employees': employees,
            'search_term': search_term,
            'filters': {
                'role': role_filter,
                'employment_type': employment_type_filter,
                'status': status_filter,
            },
        },
    )


@login_required
@user_passes_test(is_sd_only)
def sd_employee_profile_view(request, user_id):
    target_employee = get_object_or_404(
        User.objects.select_related('department', 'profile'),
        id=user_id,
    )
    target_profile, _ = EmployeeProfile.objects.get_or_create(user=target_employee)
    documents = Document.objects.filter(employee=target_profile).select_related('employee').order_by('-upload_date')
    history_entries = target_employee.employment_history.all().order_by('-date')

    context = {
        'employee': target_employee,
        'target_employee': target_employee,
        'documents': documents,
        'history_entries': history_entries,
        'employee_profile': target_profile,
    }
    return render(request, 'sd/sd_employee_view.html', context)


@login_required
@user_passes_test(is_hr_or_admin)
def add_employee(request):
    """ View to create both a User and their EmployeeProfile safely """
    # 1. FETCH DEPARTMENTS for the dropdown
    departments = Department.objects.filter(is_active=True)

    if request.method == 'POST':
        form = AddEmployeeForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                with transaction.atomic():
                    # 2. CAPTURE THE SELECTED DEPARTMENT
                    dept_id = request.POST.get('department')
                    
                    # 3. CREATE USER (Assign department_id here!)
                    user = User.objects.create(
                        username=form.cleaned_data['username'],
                        email=form.cleaned_data['email'],
                        first_name=form.cleaned_data['first_name'],
                        last_name=form.cleaned_data['last_name'],
                        role='EMP', 
                        department_id=dept_id,  # <-- Link to Department
                        must_change_password=True
                    )
                    user.set_password('UPH_Employee2026!') 
                    
                    if 'profile_pic' in request.FILES:
                        user.profile_pic = request.FILES['profile_pic']
                    user.save()

                    # 4. CREATE PROFILE
                    profile, created = EmployeeProfile.objects.get_or_create(user=user)
                    
                    profile.employee_id = form.cleaned_data.get('employee_id')
                    profile.employment_type = form.cleaned_data.get('employment_type')
                    profile.middle_name = form.cleaned_data.get('middle_name')
                    profile.contact_number = form.cleaned_data.get('contact_number')
                    profile.address = form.cleaned_data.get('address')
                    profile.birth_date = form.cleaned_data.get('birth_date')
                    profile.emergency_contact_name = form.cleaned_data.get('emergency_contact_name')
                    profile.emergency_contact_num = form.cleaned_data.get('emergency_contact_num')
                    
                    profile.save()

                messages.success(request, f"Employee {user.get_full_name()} added successfully!")
                return redirect('employee_list')
                
            except Exception as e:
                messages.error(request, f"Error creating employee: {str(e)}")
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = AddEmployeeForm()

    # 5. PASS DEPARTMENTS TO THE HTML CONTEXT
    return render(request, 'hr/hr_addemployee.html', {
        'form': form, 
        'departments': departments 
    })

@login_required
def employee_profile_view(request, user_id):
    # 1. Grab the employee they clicked on
    target_employee = get_object_or_404(User, id=user_id)
    viewer = request.user

    # 2. ROLE-BASED SECURITY CHECK
    if viewer.role in ['ADMIN', 'HR', 'SD']:
        pass # Allow access to see anyone
        
    elif viewer.role == 'HEAD' or viewer.role == 'Department Head':
        # Check if the target employee's department matches Janine's department
        if target_employee.department != viewer.department:
            messages.error(request, "Access Denied: This employee is not in your department.")
            return redirect('head_dashboard') # Kick them back to dashboard
            
    else:
        # Regular employees shouldn't be snooping on other profiles at all
        if viewer.id != target_employee.id:
            messages.error(request, "Access Denied.")
            return redirect('employee_dashboard')

    target_profile, _ = EmployeeProfile.objects.get_or_create(user=target_employee)
    documents = Document.objects.filter(employee=target_profile).select_related('employee').order_by('-upload_date')
    upload_form = DocumentUploadForm(user=viewer)

    context = {
        'employee': target_employee,
        'target_employee': target_employee,
        'documents': documents,
        'upload_form': upload_form,
        'employee_profile': target_profile,
        'can_toggle_self_upload': viewer.role in ['HR', 'ADMIN'] and target_employee.role == 'EMP',
        'is_self_upload_enabled': target_profile.can_self_upload,
        'is_self_profile': viewer.id == target_employee.id,
    }

    # 3. If they pass the check, show the profile with document management context.
    return render(request, 'hr/hr_profile_view.html', context)


@login_required
@user_passes_test(is_hr_or_admin)
@require_POST
def update_employee_self_upload(request, user_id):
    target_employee = get_object_or_404(User, id=user_id)
    target_profile, _ = EmployeeProfile.objects.get_or_create(user=target_employee)

    if target_employee.role != 'EMP':
        messages.error(request, "Self-upload permission can only be configured for employees.")
        return redirect('employee_profile_view', user_id=target_employee.id)

    target_profile.can_self_upload = request.POST.get('can_self_upload') == 'on'
    target_profile.save(update_fields=['can_self_upload'])

    if target_profile.can_self_upload:
        messages.success(request, f"Self-upload enabled for {target_employee.get_full_name()}.")
    else:
        messages.success(request, f"Self-upload disabled for {target_employee.get_full_name()}.")

    return redirect('employee_profile_view', user_id=target_employee.id)

@login_required
@user_passes_test(is_hr_or_admin)
def edit_employee(request, user_id):
    employee = get_object_or_404(User, id=user_id)
    profile = getattr(employee, 'profile', None)

    if request.method == 'POST':
        # We still initialize the form to keep our validation for email/names
        form = AddEmployeeForm(request.POST, request.FILES)
        
        # 🚩 MANUALLY GRAB THE DATA (This bypasses the choice/unique errors)
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        emp_id = request.POST.get('employee_id')
        emp_type = request.POST.get('employment_type')
        address = request.POST.get('address')
        contact = request.POST.get('contact_number')

        try:
            with transaction.atomic():
                # 1. Update User
                employee.first_name = first_name
                employee.last_name = last_name
                employee.email = email
                employee.save()

                # 2. Update/Create Profile
                if not profile:
                    from accounts.models import EmployeeProfile
                    profile = EmployeeProfile.objects.create(user=employee)
                
                profile.employee_id = emp_id
                profile.employment_type = emp_type # This bypasses the Choice check
                profile.address = address
                profile.contact_number = contact
                profile.save()

            messages.success(request, f"Successfully updated {employee.get_full_name()}!")
            return redirect('employee_profile_view', user_id=employee.id)
            
        except Exception as e:
            messages.error(request, f"Database Error: {str(e)}")
            
    else:
        # GET request: Load current data into the form
        initial_data = {
            'first_name': employee.first_name,
            'last_name': employee.last_name,
            'email': employee.email,
            'employee_id': profile.employee_id if profile else "",
            'employment_type': profile.employment_type if profile else "Regular",
        }
        form = AddEmployeeForm(initial=initial_data)

    return render(request, 'hr/hr_employee_edit.html', {'form': form, 'employee': employee})

@login_required
@user_passes_test(is_hr_or_admin)
def delete_employee(request, user_id):
    employee = get_object_or_404(User, id=user_id)
    if request.method == 'POST':
        employee.is_active = False
        employee.is_locked = True
        employee.save(update_fields=['is_active', 'is_locked'])

        profile, _ = EmployeeProfile.objects.get_or_create(user=employee)
        profile.is_active = False
        profile.save(update_fields=['is_active'])

        messages.success(request, "Employee record deactivated successfully.")
        return redirect('employee_list')
    return redirect('employee_profile_view', user_id=user_id)

@login_required
@user_passes_test(is_hr_or_admin)
def hr_training(request):
    return redirect('trainings:hr_training_list')

@login_required
@user_passes_test(is_admin)
def security_settings_view(request):
    config = _get_security_config()

    if request.method == 'POST':
        try:
            min_password_length = int(request.POST.get('min_password_length', config.min_password_length))
            session_timeout = int(request.POST.get('session_timeout', config.session_timeout))
            max_failed_attempts = int(request.POST.get('max_failed_login_attempts', config.max_failed_login_attempts))
        except (TypeError, ValueError):
            messages.error(request, "Numeric fields contain invalid values.")
            return redirect('security_settings')

        config.min_password_length = max(6, min_password_length)
        config.session_timeout = max(1, session_timeout)
        config.max_failed_login_attempts = max(1, max_failed_attempts)
        config.require_complexity = request.POST.get('require_complexity') == 'on'
        config.force_password_change = request.POST.get('force_password_change') == 'on'
        config.save()

        if config.force_password_change:
            User.objects.exclude(role='ADMIN').update(must_change_password=True)

        messages.success(request, "Security policies updated successfully!")
        return redirect('security_settings')

    return render(
        request,
        'admin/security_settings.html',
        {
            'config': config,
            'current_timeout': config.session_timeout,
        },
    )

# Add this somewhere in your accounts/views.py
def forgot_password_page(request):
    """ Public page for users who forgot their password """
    if request.method == 'POST':
        # We will add the actual email-sending logic here later!
        pass
        
    return render(request, 'login/forpass.html')
