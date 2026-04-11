from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.conf import settings
from django.utils import timezone
import json 
from django.db import models, transaction # Correctly added here
from django.db.models import Q, Count

from audit.utils import log_activity
from .models import User, Department, EmployeeProfile, SystemConfig
from documents.models import Document
from documents.forms import DocumentUploadForm

# ADDED AddEmployeeForm TO THIS LIST BELOW:
from .forms import (
    CustomUserCreationForm, CustomUserChangeForm, AssignRoleForm, 
    AccountStatusForm, AdminPasswordResetForm, DepartmentForm, 
    AddEmployeeForm
)

# Helper function for admin check
def is_admin(user):
    return user.is_authenticated and user.role == 'ADMIN'

def login_view(request):
    # If a user is already logged in, redirect them from the login page.
    if request.user.is_authenticated:
        # If they must change their password, send them there first.
        if getattr(request.user, 'must_change_password', False):
            return redirect('password_change')
        # Otherwise, send them to their respective dashboard.
        if request.user.role == 'ADMIN':
            return redirect('admin_dashboard')
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
                else:
                    return redirect('employee_dashboard')
            else:
                # Increment failed login attempts
                user.failed_login_attempts += 1
                if user.failed_login_attempts >= getattr(settings, 'MAX_FAILED_LOGIN_ATTEMPTS', 5):
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
    # This view will now serve as the user management list
    users = User.objects.all().order_by('last_name', 'first_name')
    all_users = User.objects.all().order_by('last_name', 'first_name')
    departments = Department.objects.all()
    
    # Apply filters if present in GET request
    search_term = request.GET.get('search', '')
    role_filter = request.GET.get('role', '')
    status_filter = request.GET.get('status', '')
    department_filter = request.GET.get('department', '')

    if search_term:
        users = users.filter(
            Q(first_name__icontains=search_term) |
            Q(last_name__icontains=search_term) |
            Q(email__icontains=search_term) |
            Q(username__icontains=search_term)
        )
    if role_filter:
        users = users.filter(role=role_filter)
    if status_filter:
        if status_filter == 'active':
            users = users.filter(is_active=True, is_locked=False)
        elif status_filter == 'inactive':
            users = users.filter(is_active=False)
        elif status_filter == 'locked':
            users = users.filter(is_locked=True)
    if department_filter:
        try:
            users = users.filter(department__id=int(department_filter))
            department_filter = int(department_filter) # Convert for template comparison
        except ValueError:
            pass

    # Dashboard Statistics
    stats = {
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(is_active=True, is_locked=False).count(),
        'total_departments': Department.objects.count(),
    }

    context = {
        'users': users,
        'all_users': all_users,
        'roles': User.ROLE_CHOICES,
        'departments': departments,
        'current_search': search_term,
        'current_role_filter': role_filter,
        'current_status_filter': status_filter,
        'current_department_filter': department_filter,
        'stats': stats,
    }
    return render(request, 'admin/user_management.html', context) # Changed to user_management.html

@login_required
def employee_dashboard(request):
    return render(request, 'employee/emp_dash.html')

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
def employee_attendance(request):
    # This view will render the employee's attendance page
    return render(request, 'dashboards/employee_attendance.html')

@login_required
def employee_documents(request):
    # This view will render the employee's documents page
    return render(request, 'dashboards/employee_documents.html')

@login_required
@user_passes_test(is_admin)
@require_POST
def create_user(request):
    form = CustomUserCreationForm(request.POST, request.FILES)
    if form.is_valid():
        user = form.save()
        log_activity(
            actor=request.user,
            action="Create User",
            target_user=user,
            details=f"Created new user {user.username}"
        )
        messages.success(request, f"User {user.username} created successfully. Password change required on first login.")
        return JsonResponse({'status': 'success', 'message': 'User created successfully.'})
    else:
        print(form.errors) # Log form errors to the console for debugging
        errors = form.errors.as_json()
        return JsonResponse({'status': 'error', 'message': 'Error creating user.', 'errors': json.loads(errors)}, status=400)

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
@require_POST
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
        user.department = department if new_role == 'HEAD' else None # Only assign department if role is HEAD
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
    # Pass a list of users to populate the searchable dropdown
    users = User.objects.all().order_by('last_name')
    
    context = {
        'departments': departments,
        'users': users,
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
    # This handles both general edits and the 'Assign Head' modal
    form = DepartmentForm(request.POST, instance=dept)
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
        return JsonResponse({'status': 'success', 'message': 'Department updated successfully.'})
    else:
        print("--- FORM ERRORS ---")
        print(form.errors.as_data()) # THIS WILL TELL YOU THE REAL REASON
        from django.http import HttpResponseBadRequest
        return HttpResponseBadRequest("Validation Failed")

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
@user_passes_test(is_admin)
def employee_list(request):
    """ View to list all employees with search and filter """
    employees = User.objects.all().select_related('profile', 'department').order_by('last_name')
    
    search_query = request.GET.get('search', '')
    if search_query:
        employees = employees.filter(
            Q(first_name__icontains=search_query) | 
            Q(last_name__icontains=search_query) |
            Q(profile__employee_id__icontains=search_query)
        )

    return render(request, 'hr/hr_employeelist.html', {
        'employees': employees,
    })


@login_required
@user_passes_test(is_admin)
def add_employee(request):
    """ View to create both a User and their EmployeeProfile safely """
    if request.method == 'POST':
        form = AddEmployeeForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                with transaction.atomic():
                    # 1. Create User Account
                    user = User.objects.create(
                        username=form.cleaned_data['username'],
                        email=form.cleaned_data['email'],
                        first_name=form.cleaned_data['first_name'],
                        last_name=form.cleaned_data['last_name'],
                        role='EMP', 
                        department=form.cleaned_data.get('department'),
                        must_change_password=True
                    )
                    user.set_password('UPH_Employee2026!') 
                    
                    if 'profile_pic' in request.FILES:
                        user.profile_pic = request.FILES['profile_pic']
                    user.save()

                    # 2. Manually Create/Update the Profile
                    # We use get_or_create to ensure no duplicate profiles are made
                    profile, created = EmployeeProfile.objects.get_or_create(user=user)
                    
                    # 3. Populate Profile Details from the Form safely
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

    return render(request, 'hr/hr_addemployee.html', {'form': form})

@login_required
@user_passes_test(is_admin)
def employee_profile_view(request, user_id):
    # Fetch the employee or show 404 if not found
    employee = get_object_or_404(User, id=user_id)
    return render(request, 'hr/hr_profile_view.html', {'employee': employee})

@login_required
@user_passes_test(is_admin)
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
            return redirect('employee_profile', user_id=employee.id)
            
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
@user_passes_test(is_admin)
def delete_employee(request, user_id):
    employee = get_object_or_404(User, id=user_id)
    if request.method == 'POST':
        employee.delete()
        messages.success(request, "Employee record deleted successfully.")
        return redirect('employee_list')
    return redirect('employee_profile', user_id=user_id)

@login_required
@user_passes_test(is_admin)
def security_settings_view(request):
    config, created = SystemConfig.objects.get_or_create(pk=1)

    if request.method == 'POST':
        new_timeout = request.POST.get('timeout')
        
        if new_timeout:
            config.session_timeout = int(new_timeout)
            config.save()
            messages.success(request, "Security policies updated successfully!")
            return redirect('security_settings')

    return render(request, 'admin/security_settings.html', {'config': config})