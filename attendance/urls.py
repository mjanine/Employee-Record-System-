from django.urls import path
from django.views.generic import RedirectView
from . import views

app_name = 'attendance'

urlpatterns = [
    path('', RedirectView.as_view(pattern_name='attendance:employee_attendance_records'), name='index'),
    
    # Employee URLs
    path('employee/records/', views.emp_attendance, name='employee_attendance_records'),
    # Head URLs
    path('head/records/', views.head_attendance, name='head_department_attendance'),
    path('head/monitoring/', views.head_attendance_monitoring, name='head_attendance_monitoring'),
    # HR URLs
    path('hr/records/', views.hr_attendance, name='hr_attendance'),
    path('hr/monitoring/', views.hr_attendance_monitoring, name='hr_attendance_monitoring'),
    path('hr/edit/<int:log_id>/', views.edit_log, name='edit_attendance_log'),
    # SD URLs
    path('sd/summary/', views.sd_attendance, name='sd_attendance_summary'),
    path('sd/monitoring/', views.sd_attendance_monitoring, name='sd_attendance_monitoring'),
]