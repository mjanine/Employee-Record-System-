from django.urls import path

from . import views

app_name = 'trainings'

urlpatterns = [
	# HR routes
	path('hr/trainings/', views.hr_training_list, name='hr_training_list'),
	path('hr/trainings/create/', views.hr_training_create, name='hr_training_create'),
	path('hr/trainings/<int:training_id>/edit/', views.hr_training_edit, name='hr_training_edit'),
	path('hr/trainings/<int:training_id>/status/', views.hr_training_update_status, name='hr_training_update_status'),
	path('hr/trainings/<int:training_id>/participants/', views.hr_training_participants, name='hr_training_participants'),

	# Employee routes
	path('employee/trainings/', views.employee_trainings, name='employee_trainings'),
	path('employee/trainings/<int:training_id>/register/', views.employee_register_training, name='employee_register_training'),

	# Department head routes
	path('head/trainings/', views.head_training_overview, name='head_training_overview'),
]
