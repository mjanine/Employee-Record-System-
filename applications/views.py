from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from notifications.utils import send_notification
from .forms import ApplicationActionForm, PositionChangeRequestForm
from .models import Application, ApplicationStatusHistory


ALLOWED_APPLICATION_ROLES = {'HEAD', 'HR', 'SD'}
DASHBOARD_BY_ROLE = {
    'ADMIN': 'admin_dashboard',
    'HR': 'hr_dashboard',
    'HEAD': 'head_dashboard',
    'SD': 'sd_dashboard',
    'EMP': 'employee_dashboard',
}
User = get_user_model()


def _notify_recipients(recipients, message, notification_type):
    for recipient in recipients:
        if recipient and recipient.is_active:
            send_notification(recipient, message, notification_type)


def _notify_application_pending_approval(application):
    message = f"Pending approval: Application #{application.id} ({application.type}) submitted by {application.applicant_name}."

    if application.status == Application.Status.PENDING_HEAD:
        department = application.target_department
        head_user = getattr(department, 'head', None) if department else None
        if head_user:
            _notify_recipients([head_user], message, 'Pending Approval')
            return
        hr_users = User.objects.filter(role='HR', is_active=True)
        _notify_recipients(hr_users, message, 'Pending Approval')
        return

    if application.status == Application.Status.PENDING_HR:
        hr_users = User.objects.filter(role='HR', is_active=True)
        _notify_recipients(hr_users, message, 'Pending Approval')
        return

    if application.status == Application.Status.PENDING_SD:
        sd_users = User.objects.filter(role='SD', is_active=True)
        _notify_recipients(sd_users, message, 'Pending Approval')


def _get_head_department_scope_ids(user):
    """Return department ids that a HEAD user is allowed to manage."""
    department_ids = set()

    if getattr(user, 'department_id', None):
        department_ids.add(user.department_id)

    # FIX: Include departments explicitly assigned to this user as department head.
    department_ids.update(user.headed_department.values_list('id', flat=True))
    return department_ids


def _head_can_access_application(user, application):
    """Check whether a HEAD user can access the given application."""
    if not application.target_department_id:
        return False
    return application.target_department_id in _get_head_department_scope_ids(user)


def _normalize_decision(raw_decision):
    decision = (raw_decision or '').strip().upper()
    if decision in {'APPROVE', 'APPROVED'}:
        return 'APPROVE'
    if decision in {'REJECT', 'REJECTED'}:
        return 'REJECT'
    if decision in {'FORWARD', 'FORWARDED'}:
        return 'FORWARD'
    return None


def _redirect_to_role_dashboard_with_error(request, message_text='You do not have permission to view that module.'):
    role = (request.user.role or '').upper()
    messages.error(request, message_text)
    return redirect(DASHBOARD_BY_ROLE.get(role, 'login'))


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
def sd_application_overview(request):
    """SD view restricted to final-stage application approvals only."""
    role = (request.user.role or '').upper()
    if role != 'SD':
        return _redirect_to_role_dashboard_with_error(request)

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

    if role not in ALLOWED_APPLICATION_ROLES:
        return _redirect_to_role_dashboard_with_error(request)

    if role == 'SD':
        return redirect('sd_application_overview')

    applications = Application.objects.select_related('target_department').order_by('-id')
    context = {'applications': applications}

    if role == 'HR':
        template_name = 'hr/hr_appmanagement.html'
    elif role == 'HEAD':
        template_name = 'head/head_appmanagement.html'
        scope_ids = _get_head_department_scope_ids(request.user)

        # FIX: Gracefully handle null department by resolving all valid department scopes.
        if scope_ids:
            applications = applications.filter(target_department_id__in=scope_ids)
        else:
            applications = applications.none()

        context.update(
            {
                'applications': applications,
                'has_department_scope': bool(scope_ids),
                'head_department_scope_names': sorted(
                    {department.get_name_display() for department in request.user.headed_department.all()}
                    | ({request.user.department.get_name_display()} if request.user.department else set())
                ),
            }
        )
    else:
        template_name = 'hr/hr_appmanagement.html'

    if role != 'HEAD':
        context['applications'] = applications

    return render(request, template_name, context)


@login_required
def application_detail(request, pk):
    """View to inspect a single application and status history."""
    role = (request.user.role or '').upper()
    if role not in ALLOWED_APPLICATION_ROLES:
        return _redirect_to_role_dashboard_with_error(request)

    application = get_object_or_404(
        Application.objects.select_related('target_department').prefetch_related('history__actor'),
        pk=pk,
    )

    if role == 'HEAD' and not _head_can_access_application(request.user, application):
        # FIX: Prevent HEAD users from reading cross-department application details.
        messages.error(request, 'You are not authorized to view this application.')
        return redirect('application_list')

    return render(
        request,
        'application/application_info.html',
        {
            'application': application,
            'form': ApplicationActionForm(user_role=role),
        },
    )


@login_required
@require_POST
def process_application_action(request, pk):
    """Process application actions by workflow stage and actor role."""
    application = get_object_or_404(Application, pk=pk)
    role = (request.user.role or '').upper()

    if role not in ALLOWED_APPLICATION_ROLES:
        return _redirect_to_role_dashboard_with_error(request)

    if role == 'HEAD' and not _head_can_access_application(request.user, application):
        # FIX: Prevent HEAD users from updating applications outside their department scope.
        messages.error(request, 'You are not authorized to update this application.')
        return redirect('application_list')

    form = ApplicationActionForm(request.POST, user_role=role)

    if not form.is_valid():
        messages.error(request, 'Invalid action submission.')
        return redirect('application_detail', pk=pk)

    decision = _normalize_decision(form.cleaned_data['decision'])
    remarks = form.cleaned_data['remarks']

    if not decision:
        messages.error(request, 'Unsupported decision value.')
        return redirect('application_detail', pk=pk)

    if role == 'HEAD':
        if application.status != Application.Status.PENDING_HEAD:
            messages.error(request, 'This application is no longer pending Head review.')
            return redirect('application_detail', pk=pk)

        new_status = (
            Application.Status.PENDING_HR
            if decision in {'APPROVE', 'FORWARD'}
            else Application.Status.REJECTED
        )

    elif role == 'HR':
        if application.status != Application.Status.PENDING_HR:
            messages.error(request, 'This application is not currently actionable by HR.')
            return redirect('application_detail', pk=pk)

        new_status = (
            Application.Status.PENDING_SD
            if decision in {'APPROVE', 'FORWARD'}
            else Application.Status.REJECTED
        )

    else:
        if application.status != Application.Status.PENDING_SD:
            messages.error(request, 'Only Pending SD applications can be decided at this stage.')
            return redirect('sd_application_overview')

        if decision == 'FORWARD':
            messages.error(request, 'Forward is not allowed at SD final review stage.')
            return redirect('application_detail', pk=pk)

        new_status = (
            Application.Status.APPROVED
            if decision == 'APPROVE'
            else Application.Status.REJECTED
        )

    _record_status_change(application, request.user, new_status, remarks)
    _notify_application_pending_approval(application)

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
            position_change.status = Application.Status.PENDING_HEAD
            position_change.save()
            _notify_application_pending_approval(position_change)
            messages.success(request, 'Position change request submitted.')
            return redirect('create_position_change')
    else:
        form = PositionChangeRequestForm()

    return render(request, 'employee/emp_position_change_request.html', {'form': form})
