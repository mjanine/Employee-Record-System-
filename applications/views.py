from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from utils.decorators import role_required
from .forms import ApplicationActionForm, PositionChangeRequestForm
from .models import Application, ApplicationStatusHistory


def _normalize_decision(raw_decision):
    decision = (raw_decision or '').strip().upper()
    if decision in {'APPROVE', 'APPROVED'}:
        return 'APPROVE'
    if decision in {'REJECT', 'REJECTED'}:
        return 'REJECT'
    return None


def _record_status_change(application, actor, new_status, remarks=''):
    previous_status = application.status
    application.status = new_status
    application.save(update_fields=['status'])
    ApplicationStatusHistory.objects.create(
        application=application,
        previous_status=previous_status,
        new_status=new_status,
        remarks=(remarks or '').strip(),
        actor=actor,
    )


@login_required
@role_required('SD', 'ADMIN')
def sd_application_overview(request):
    """SD view restricted to final-stage application approvals only."""
    pending_sd_apps = (
        Application.objects
        .filter(status=Application.Status.PENDING_SD)
        .select_related('target_department')
        .order_by('-id')
    )

    context = {
        'pending_new_hire_apps': pending_sd_apps.filter(type='New Employee Application'),
        'pending_position_change_apps': pending_sd_apps.filter(type='Position Change Request'),
    }
    return render(request, 'sd/sd_appmanagement.html', context)


@login_required
def application_list(request):
    """Role-based application list router."""
    role = (request.user.role or '').upper()

    if role in {'SD', 'ADMIN'}:
        return redirect('sd_application_overview')

    applications = Application.objects.select_related('target_department').order_by('-id')

    if role == 'HR':
        template_name = 'hr/hr_appmanagement.html'
    elif role == 'HEAD':
        template_name = 'head/head_appmanagement.html'
        # A Head should only see applications targeting their own department.
        if request.user.department:
            applications = applications.filter(target_department=request.user.department)
        else:
            applications = applications.none() # If head has no department, show no applications.
    else:
        template_name = 'hr/hr_appmanagement.html'

    return render(request, template_name, {'applications': applications})


@login_required
def application_detail(request, pk):
    """View to inspect a single application and status history."""
    application = get_object_or_404(
        Application.objects.select_related('target_department').prefetch_related('history__actor'),
        pk=pk,
    )
    return render(
        request,
        'application/application_info.html',
        {
            'application': application,
            'form': ApplicationActionForm(),
        },
    )


@login_required
@role_required('HEAD', 'HR', 'SD', 'ADMIN')
@require_POST
def process_application_action(request, pk):
    """Process application actions by workflow stage and actor role."""
    application = get_object_or_404(Application, pk=pk)
    form = ApplicationActionForm(request.POST)

    if not form.is_valid():
        messages.error(request, 'Invalid action submission.')
        return redirect('application_detail', pk=pk)

    decision = _normalize_decision(form.cleaned_data['decision'])
    remarks = form.cleaned_data['remarks']

    if not decision:
        messages.error(request, 'Unsupported decision value.')
        return redirect('application_detail', pk=pk)

    role = (request.user.role or '').upper()

    if role == 'HEAD':
        if application.status != Application.Status.PENDING:
            messages.error(request, 'This application is no longer pending Head review.')
            return redirect('application_detail', pk=pk)

        new_status = (
            Application.Status.HEAD_APPROVED
            if decision == 'APPROVE'
            else Application.Status.REJECTED
        )

    elif role == 'HR':
        if application.status not in {Application.Status.PENDING, Application.Status.HEAD_APPROVED}:
            messages.error(request, 'This application is not currently actionable by HR.')
            return redirect('application_detail', pk=pk)

        new_status = (
            Application.Status.PENDING_SD
            if decision == 'APPROVE'
            else Application.Status.REJECTED
        )

    else:
        if application.status != Application.Status.PENDING_SD:
            messages.error(request, 'Only Pending SD applications can be decided at this stage.')
            return redirect('sd_application_overview')

        new_status = (
            Application.Status.APPROVED
            if decision == 'APPROVE'
            else Application.Status.REJECTED
        )

    _record_status_change(application, request.user, new_status, remarks)

    if role in {'SD', 'ADMIN'}:
        messages.success(request, f'Application #{application.id} marked as {new_status}.')
        return redirect('sd_application_overview')

    messages.success(request, f'Application #{application.id} updated to {new_status}.')
    return redirect('application_detail', pk=pk)


@login_required
def create_position_change(request):
    """View to create a position change request."""
    if request.method == 'POST':
        form = PositionChangeRequestForm(request.POST, request.FILES)
        if form.is_valid():
            position_change = form.save(commit=False)
            position_change.type = 'Position Change Request'
            position_change.applicant_name = request.user.get_full_name() or request.user.username
            position_change.status = Application.Status.PENDING
            position_change.save()
            messages.success(request, 'Position change request submitted.')
            return redirect('create_position_change')
    else:
        form = PositionChangeRequestForm()

    return render(request, 'employee/emp_position_change_request.html', {'form': form})
