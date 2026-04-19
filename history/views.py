from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from django.views.decorators.http import require_POST
from accounts.models import User, EmployeeProfile
from .models import EmploymentHistory
from documents.models import Document
from documents.forms import DocumentUploadForm

# Create your views here.

# --- Role Check Helpers ---
def is_employee(user):
    return user.is_authenticated and user.role == 'EMP'

def is_hr(user):
    return user.is_authenticated and user.role == 'HR'

def is_head(user):
    return user.is_authenticated and user.role == 'HEAD'

def is_sd(user):
    return user.is_authenticated and user.role == 'SD'

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
    elif user.role in ['HR', 'SD', 'ADMIN']:
        has_permission = True  # HR/SD/Admin can view everyone
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
    employee_profile_obj, _ = EmployeeProfile.objects.get_or_create(user=request.user)
    history_entries = EmploymentHistory.objects.filter(employee=request.user).order_by('-date')
    documents = Document.objects.filter(employee=employee_profile_obj).select_related('employee').order_by('-upload_date')
    context = {
        'employee': request.user,
        'target_employee': request.user,
        'history_entries': history_entries,
        'documents': documents,
        'upload_form': DocumentUploadForm(user=request.user),
        'employee_profile': employee_profile_obj,
    }
    return render(request, 'employee/emp_profile_view.html', context)

@login_required
@user_passes_test(is_hr)
def hr_profile(request):
    employee_profile_obj, _ = EmployeeProfile.objects.get_or_create(user=request.user)
    history_entries = EmploymentHistory.objects.filter(employee=request.user).order_by('-date')
    documents = Document.objects.filter(employee=employee_profile_obj).select_related('employee').order_by('-upload_date')
    context = {
        'employee': request.user,
        'target_employee': request.user,
        'history_entries': history_entries,
        'documents': documents,
        'upload_form': DocumentUploadForm(user=request.user),
        'employee_profile': employee_profile_obj,
        'can_toggle_self_upload': False,
        'is_self_upload_enabled': employee_profile_obj.can_self_upload,
        'is_self_profile': True,
    }
    return render(request, 'hr/hr_profile_view.html', context)

@login_required
@user_passes_test(is_head)
def head_profile(request):
    employee_profile_obj, _ = EmployeeProfile.objects.get_or_create(user=request.user)
    history_entries = EmploymentHistory.objects.filter(employee=request.user).order_by('-date')
    documents = Document.objects.filter(employee=employee_profile_obj).select_related('employee').order_by('-upload_date')
    context = {
        'employee': request.user,
        'target_employee': request.user,
        'history_entries': history_entries,
        'documents': documents,
    }
    return render(request, 'head/head_profile_view.html', context)

@login_required
@user_passes_test(is_sd)
def sd_profile(request):
    employee_profile_obj, _ = EmployeeProfile.objects.get_or_create(user=request.user)
    history_entries = EmploymentHistory.objects.filter(employee=request.user).order_by('-date')
    documents = Document.objects.filter(employee=employee_profile_obj).select_related('employee').order_by('-upload_date')
    context = {
        'employee': request.user,
        'target_employee': request.user,
        'history_entries': history_entries,
        'documents': documents,
    }
    return render(request, 'sd/sd_profile_view.html', context)


@login_required
@user_passes_test(is_sd)
def sd_employment_history(request):
    history_entries = EmploymentHistory.objects.filter(employee=request.user).order_by('-date')
    context = {
        'employee': request.user,
        'history_entries': history_entries,
    }
    return render(request, 'sd/sd_employment_history.html', context)


@login_required
@user_passes_test(lambda u: u.role in ['HR', 'ADMIN'])
@require_POST
def add_timeline_event(request):
    employee_id = request.POST.get('employee_id')
    event_year = (request.POST.get('event_year') or '').strip()
    event_title = (request.POST.get('event_title') or '').strip()
    event_description = (request.POST.get('event_description') or '').strip()

    if not (employee_id and event_year and event_title and event_description):
        return JsonResponse({'status': 'error', 'message': 'All timeline fields are required.'}, status=400)

    target_employee = get_object_or_404(User, id=employee_id)
    EmploymentHistory.objects.create(
        employee=target_employee,
        change_type=event_title,
        from_value='',
        to_value=event_description,
        date=f'{event_year}-01-01',
        recorded_by=request.user,
    )
    return JsonResponse({'status': 'success', 'message': 'Timeline event saved.'})