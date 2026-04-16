from django.shortcuts import render
from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db import transaction

from .models import LeaveRequest, LeaveBalance
from .forms import LeaveRequestForm, LeaveActionForm
from utils.decorators import sd_elevated_required

# Create your views here.

# --- Role Check Helpers ---
def is_head(user):
    return user.is_authenticated and user.role == 'HEAD'

def is_hr(user):
    return user.is_authenticated and user.role == 'HR'

ADMINISTRATIVE_LEAVE_ROLES = {'ADMIN', 'HR', 'HEAD', 'SD'}


def _requires_sd_final_review(leave_request):
    return (leave_request.user.role or '').upper() in ADMINISTRATIVE_LEAVE_ROLES

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
    
    # Return JSON if requested by the JavaScript fetch call
    if request.headers.get('Accept') == 'application/json' or request.GET.get('format') == 'json':
        history_data = list(leave_requests.values(
            'id', 'leave_type__name', 'start_date', 'end_date', 'days_requested', 'status', 'reason', 'created_at'
        ))
        for item in history_data:
            if item.get('created_at'):
                item['dateFiled'] = item['created_at'].strftime('%B %d, %Y')
                item['submitTime'] = item['created_at'].strftime('%I:%M %p')
        return JsonResponse({'history': history_data})

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
@sd_elevated_required
def sd_leave_select(request):
    """Renders the main leave selection page for the School Director."""
    return render(request, 'sd/sd_leaveselect.html')


@login_required
@sd_elevated_required
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
@sd_elevated_required
def sd_leave_history(request):
    """Legacy route maintained for compatibility; redirects to SD approval overview."""
    return redirect('leaves:sd_leave_overview')

@login_required
@sd_elevated_required
def sd_leave_overview(request):
    """SD final-approval queue for leave requests from administrative roles."""
    if request.method == 'POST':
        request_id = request.POST.get('request_id')
        leave_request = get_object_or_404(
            LeaveRequest,
            id=request_id,
            status=LeaveRequest.Status.PENDING_SD_APPROVAL,
        )
        form = LeaveActionForm(request.POST)
        if form.is_valid():
            if not _requires_sd_final_review(leave_request):
                messages.error(request, "This leave request does not require SD final approval.")
                return redirect('leaves:sd_leave_overview')

            action = form.cleaned_data['action']
            leave_request.reviewed_by_sd = request.user
            leave_request.sd_remarks = form.cleaned_data['remarks']
            leave_request.status = (
                LeaveRequest.Status.APPROVED
                if action == 'APPROVE'
                else LeaveRequest.Status.REJECTED
            )
            leave_request.save()
            messages.success(
                request,
                f"Leave request for {leave_request.user.get_full_name()} was {'approved' if action == 'APPROVE' else 'rejected'} by SD.",
            )
        else:
            messages.error(request, "Invalid action submitted.")
        return redirect('leaves:sd_leave_overview')

    leave_requests = LeaveRequest.objects.filter(
        user__role__in=ADMINISTRATIVE_LEAVE_ROLES,
    ).select_related(
        'user', 'leave_type', 'reviewed_by_head', 'reviewed_by_hr', 'reviewed_by_sd'
    ).order_by('-created_at')

    pending_requests = leave_requests.filter(status=LeaveRequest.Status.PENDING_SD_APPROVAL)
    reviewed_requests = leave_requests.exclude(status=LeaveRequest.Status.PENDING_SD_APPROVAL)

    return render(
        request,
        'sd/sd_leaverequest.html',
        {
            'pending_requests': pending_requests,
            'reviewed_requests': reviewed_requests,
        },
    )

@login_required
@sd_elevated_required
@require_POST
def sd_forward_leave(request, request_id):
    """View for SD to forward a leave request (read-only approval exception)."""
    leave_request = get_object_or_404(LeaveRequest, id=request_id)
    leave_request.status = LeaveRequest.Status.PENDING_SD_APPROVAL
    leave_request.save()
    messages.success(request, f"Leave request for {leave_request.user.get_full_name()} has been forwarded.")
    return redirect('leaves:sd_leave_overview')

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
    return redirect('leaves:head_leave_history')


@login_required
@user_passes_test(is_hr)
@require_POST
@transaction.atomic
def hr_final_approve(request, request_id):
    """View for HR to approve/reject and route administrative leaves for SD final approval."""
    leave_request = get_object_or_404(LeaveRequest, id=request_id, status=LeaveRequest.Status.PENDING_HR_APPROVAL)
    form = LeaveActionForm(request.POST)
    if form.is_valid():
        action = form.cleaned_data['action']
        leave_request.reviewed_by_hr = request.user
        leave_request.hr_remarks = form.cleaned_data['remarks']
        if action == 'APPROVE':
            leave_request.status = (
                LeaveRequest.Status.PENDING_SD_APPROVAL
                if _requires_sd_final_review(leave_request)
                else LeaveRequest.Status.APPROVED
            )
        else:
            leave_request.status = LeaveRequest.Status.REJECTED
        leave_request.save() # This triggers the post_save signal
    return redirect('leaves:hr_leave_history')


# --- SD View ---
@login_required
@sd_elevated_required
def leave_summary(request):
    """A view-only summary for the School Director."""
    all_requests = LeaveRequest.objects.all().order_by('-created_at')
    summary_data = list(all_requests.values(
        'id', 'user__first_name', 'user__last_name', 'leave_type__name', 
        'start_date', 'end_date', 'status'
    ))
    return JsonResponse({'summary': summary_data})
