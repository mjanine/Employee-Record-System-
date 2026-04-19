from django.urls import path
from . import views

# app_name helps with namespacing in templates
app_name = 'leaves'

urlpatterns = [
    # Employee URLs
    path('employee/select/', views.leave_select_view, name='leave_select'),
    path('employee/apply/', views.apply_leave, name='apply_leave'),
    path('employee/history/', views.leave_history, name='leave_history'),
    path('employee/balances/', views.leave_balance, name='leave_balance'),


    # Head Personal Leave URLs
    path('head/select/', views.head_leave_select, name='head_leave_select'),
    path('head/apply/', views.head_apply_leave, name='head_apply_leave'),
    path('head/history/', views.head_leave_history, name='head_leave_history'),

    # HR Management URLs
    path('hr/select/', views.hr_leave_select, name='hr_leave_select'),
    path('hr/apply/', views.hr_apply_leave, name='hr_apply_leave'),
    path('hr/history/', views.hr_leave_history, name='hr_leave_history'),

    # SD Management URLs
    path('sd/select/', views.sd_leave_select, name='sd_leave_select'),
    path('sd/overview/', views.sd_leave_overview, name='sd_leave_overview'),
    path('sd/apply/', views.sd_apply_leave, name='sd_apply_leave'),
    path('sd/history/', views.sd_leave_history, name='sd_leave_history'),

    # Approval URLs
    path('head/approve/<int:request_id>/', views.head_approve, name='head_approve'),
    path('hr/approve/<int:request_id>/', views.hr_final_approve, name='hr_final_approve'),
    path('sd/approve/<int:request_id>/', views.sd_approve, name='sd_approve'),
    path('sd/forward/<int:request_id>/', views.sd_forward_leave, name='sd_forward_leave'),

    # Summary URL
    path('summary/', views.leave_summary, name='leave_summary'),
]
