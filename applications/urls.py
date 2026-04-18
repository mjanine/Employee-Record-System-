from django.urls import path
from . import views

urlpatterns = [
    path('sd/overview/', views.sd_application_overview, name='sd_application_overview'),
    path('list/', views.application_list, name='application_list'),
    path('detail/<int:pk>/', views.application_detail, name='application_detail'),
    path('action/<int:pk>/', views.process_application_action, name='process_application_action'),
    path('position-change/create/', views.create_position_change, name='create_position_change'),
    path('position-change/records/', views.employee_position_change_records_api, name='employee_position_change_records_api'),
]
