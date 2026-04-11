from django.urls import path
from . import views

app_name = 'history'

urlpatterns = [
    path('timeline/', views.employee_timeline, name='my_timeline'),
    path('timeline/<int:employee_id>/', views.employee_timeline, name='employee_timeline'),
    path('profile/employee/', views.employee_profile, name='employee_profile'),
    path('profile/hr/', views.hr_profile, name='hr_profile'),
    path('profile/head/', views.head_profile, name='head_profile'),
    path('profile/sd/', views.sd_profile, name='sd_profile'),
]