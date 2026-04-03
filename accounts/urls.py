from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('password-change/', views.password_change, name='password_change'),

    # Dashboards
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('employee-dashboard/', views.employee_dashboard, name='employee_dashboard'),
    
    # Employee Dashboard Sub-pages
    path('employee-dashboard/profile/', views.employee_profile, name='employee_profile'),
    path('employee-dashboard/attendance/', views.employee_attendance, name='employee_attendance'),
    path('employee-dashboard/documents/', views.employee_documents, name='employee_documents'),

    # User Management (Task 02 - Verified Working)
    path('accounts/create-user/', views.create_user, name='create_user'),
    path('accounts/edit-user/<int:user_id>/', views.edit_user, name='edit_user'),
    path('accounts/get-user-data/<int:user_id>/', views.get_user_data, name='get_user_data'),
    path('accounts/assign-role/', views.assign_role, name='assign_role'),
    path('accounts/update-account-status/', views.update_account_status, name='update_account_status'),
    path('accounts/reset-password/', views.reset_password, name='reset_password'),
    path('accounts/delete-user/', views.delete_user, name='delete_user'),
    
    # Task 03: Department Management
    path('accounts/department-management/', views.department_management, name='department_management'),
    path('accounts/create-department/', views.create_department, name='create_department'),
    path('accounts/edit-department/<int:dept_id>/', views.edit_department, name='edit_department'),
    path('accounts/get-department-data/<int:dept_id>/', views.get_department_data, name='get_department_data'),
    path('accounts/deactivate-department/<int:dept_id>/', views.deactivate_department, name='deactivate_department'),
# Add these at the end of your urlpatterns list
path('hr/employees/', views.employee_list, name='employee_list'),
path('hr/employees/add/', views.add_employee, name='add_employee'),
# Add this line to your urlpatterns
path('hr/employees/profile/<int:user_id>/', views.employee_profile_view, name='employee_profile'),
]
