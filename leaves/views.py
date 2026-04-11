from django.shortcuts import render
from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db import transaction

from .models import LeaveRequest, LeaveBalance
from .forms import LeaveRequestForm, LeaveActionForm

# Create your views here.

# --- Role Check Helpers ---
def is_head(user):
    return user.is_authenticated and user.role == 'HEAD'

def is_hr(user):
    return user.is_authenticated and user.role == 'HR'

def is_sd(user):
    # Assuming School Director has ADMIN level privileges for viewing summaries
    return user.is_authenticated and user.role == 'ADMIN'

@login_required
def leave_select_view(request):
    """Renders the main leave selection page for employees."""
    return render(request, 'employee/emp_leaveselect.html')


# --- Employee Views ---

@login_required
def apply_leave(request):
    """View for an employee to apply for leave."""
    if request.method == 'POST':
        form = LeaveRequestForm(request.POST, request.FILES, user=request.user)
        if form.is_valid():
            leave_request = form.save(commit=False)
            leave_request.user = request.user
            leave_request.days_requested = form.cleaned_data['days_requested']
            leave_request.save()
            messages.success(request, "Your leave request has been submitted successfully.")
            return redirect('leaves:leave_history') 
    else:
        form = LeaveRequestForm(user=request.user)

    return render(request, 'employee/emp_applicationleave.html', {'form': form})


@login_required
def leave_history(request):
    """View for an employee to see their leave history."""
    leave_requests = LeaveRequest.objects.filter(user=request.user).order_by('-created_at')
    
    # Support JSON response if requested by frontend JS API calls
    if request.headers.get('Accept') == 'application/json' or request.GET.get('format') == 'json':
        history_data = list(leave_requests.values(
            'id', 'leave_type__name', 'start_date', 'end_date', 'days_requested', 'status', 'reason'
        ))
        return JsonResponse({'history': history_data})
        
    return render(request, 'employee/emp_leaverequest.html', {'leave_requests': leave_requests})


@login_required
def leave_balance(request):
    """View for an employee to see their leave balances."""
    balances = LeaveBalance.objects.filter(user=request.user).select_related('leave_type')
    balance_data = list(balances.values('leave_type__name', 'remaining_days'))
    return JsonResponse({'balances': balance_data})


# --- Head Views (Personal Leave) ---

@login_required
@user_passes_test(is_head)
def head_leave_select(request):
    """Renders the main leave selection page for Department Heads."""
    return render(request, 'head/head_leaveselect.html')


@login_required
@user_passes_test(is_head)
def head_apply_leave(request):
    """View for a Department Head to apply for personal leave."""
    if request.method == 'POST':
        form = LeaveRequestForm(request.POST, request.FILES, user=request.user)
        if form.is_valid():
            leave_request = form.save(commit=False)
            leave_request.user = request.user
            leave_request.days_requested = form.cleaned_data['days_requested']
            leave_request.save()
            messages.success(request, "Your leave request has been submitted successfully.")
            return redirect('leaves:head_leave_history') 
    else:
        form = LeaveRequestForm(user=request.user)

    return render(request, 'head/head_applicationleave.html', {'form': form})


@login_required
@user_passes_test(is_head)
def head_leave_history(request):
    """View for a Department Head to see their personal leave history."""
    leave_requests = LeaveRequest.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'head/head_leaverequest.html', {'leave_requests': leave_requests})


# --- HR Views (Management & Personal) ---

@login_required
@user_passes_test(is_hr)
def hr_leave_select(request):
    """Renders the main leave selection page for HR."""
    return render(request, 'hr/hr_leaveselect.html')


@login_required
@user_passes_test(is_hr)
def hr_apply_leave(request):
    """View for HR to apply for personal leave."""
    if request.method == 'POST':
        form = LeaveRequestForm(request.POST, request.FILES, user=request.user)
        if form.is_valid():
            leave_request = form.save(commit=False)
            leave_request.user = request.user
            leave_request.days_requested = form.cleaned_data['days_requested']
            leave_request.save()
            messages.success(request, "Your leave request has been submitted successfully.")
            return redirect('leaves:hr_leave_history') 
    else:
        form = LeaveRequestForm(user=request.user)
    return render(request, 'hr/hr_applicationleave.html', {'form': form})


@login_required
@user_passes_test(is_hr)
def hr_leave_history(request):
    """View for HR to see all leave requests for approval and history."""
    leave_requests = LeaveRequest.objects.all().order_by('-created_at')
    return render(request, 'hr/hr_leaverequest.html', {'leave_requests': leave_requests})


# --- SD Views (Management & Personal) ---

@login_required
@user_passes_test(is_sd)
def sd_leave_select(request):
    """Renders the main leave selection page for the School Director."""
    return render(request, 'sd/sd_leaveselect.html')


@login_required
@user_passes_test(is_sd)
def sd_apply_leave(request):
    """View for SD to apply for personal leave."""
    if request.method == 'POST':
        form = LeaveRequestForm(request.POST, request.FILES, user=request.user)
        if form.is_valid():
            leave_request = form.save(commit=False)
            leave_request.user = request.user
            leave_request.days_requested = form.cleaned_data['days_requested']
            leave_request.save()
            messages.success(request, "Your leave request has been submitted successfully.")
            return redirect('leaves:sd_leave_history') 
    else:
        form = LeaveRequestForm(user=request.user)
    return render(request, 'sd/sd_applicationleave.html', {'form': form})


@login_required
@user_passes_test(is_sd)
def sd_leave_history(request):
    """View for SD to see all leave requests across the institution."""
    leave_requests = LeaveRequest.objects.all().order_by('-created_at')
    return render(request, 'sd/sd_leaverequest.html', {'leave_requests': leave_requests})


# --- Approval Views ---

@login_required
@user_passes_test(is_head)
@require_POST
def head_approve(request, request_id):
    """View for a Department Head to approve or reject a leave request."""
    leave_request = get_object_or_404(LeaveRequest, id=request_id, status=LeaveRequest.Status.PENDING_HEAD_APPROVAL)
    form = LeaveActionForm(request.POST)
    if form.is_valid():
        action = form.cleaned_data['action']
        leave_request.reviewed_by_head = request.user
        leave_request.head_remarks = form.cleaned_data['remarks']
        leave_request.status = LeaveRequest.Status.PENDING_HR_APPROVAL if action == 'APPROVE' else LeaveRequest.Status.REJECTED
        leave_request.save()
    return redirect('leaves:leave_history') # Placeholder redirect


@login_required
@user_passes_test(is_hr)
@require_POST
@transaction.atomic
def hr_final_approve(request, request_id):
    """View for HR to give final approval or rejection."""
    leave_request = get_object_or_404(LeaveRequest, id=request_id, status=LeaveRequest.Status.PENDING_HR_APPROVAL)
    form = LeaveActionForm(request.POST)
    if form.is_valid():
        action = form.cleaned_data['action']
        leave_request.reviewed_by_hr = request.user
        leave_request.hr_remarks = form.cleaned_data['remarks']
        leave_request.status = LeaveRequest.Status.APPROVED if action == 'APPROVE' else LeaveRequest.Status.REJECTED
        leave_request.save() # This triggers the post_save signal
    return redirect('leaves:leave_history') # Placeholder redirect


# --- SD View ---
@login_required
@user_passes_test(is_sd)
def leave_summary(request):
    """A view-only summary for the School Director."""
    all_requests = LeaveRequest.objects.all().order_by('-created_at')
    summary_data = list(all_requests.values(
        'id', 'user__first_name', 'user__last_name', 'leave_type__name', 
        'start_date', 'end_date', 'status'
    ))
    return JsonResponse({'summary': summary_data})
