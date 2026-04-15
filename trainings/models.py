from django.db import models
from django.conf import settings


class TrainingSession(models.Model):
	MODE_ONLINE = 'ONLINE'
	MODE_ONSITE = 'ONSITE'
	MODE_CHOICES = [
		(MODE_ONLINE, 'Online'),
		(MODE_ONSITE, 'Onsite'),
	]

	STATUS_ACTIVE = 'ACTIVE'
	STATUS_CLOSED = 'CLOSED'
	STATUS_CANCELLED = 'CANCELLED'
	STATUS_CHOICES = [
		(STATUS_ACTIVE, 'Active'),
		(STATUS_CLOSED, 'Closed'),
		(STATUS_CANCELLED, 'Cancelled'),
	]

	name = models.CharField(max_length=200)
	description = models.TextField(blank=True)
	category = models.CharField(max_length=100)
	date = models.DateField()
	mode = models.CharField(max_length=10, choices=MODE_CHOICES)
	max_participants = models.PositiveIntegerField()
	trainer = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='training_sessions_led',
	)
	status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-date', '-id']

	def __str__(self):
		return f"{self.name} ({self.date})"


class TrainingParticipant(models.Model):
	STATUS_REGISTERED = 'REGISTERED'
	STATUS_COMPLETED = 'COMPLETED'
	STATUS_NO_SHOW = 'NO_SHOW'
	STATUS_CHOICES = [
		(STATUS_REGISTERED, 'Registered'),
		(STATUS_COMPLETED, 'Completed'),
		(STATUS_NO_SHOW, 'No Show'),
	]

	employee = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='training_participations',
	)
	training_session = models.ForeignKey(
		TrainingSession,
		on_delete=models.CASCADE,
		related_name='participants',
	)
	status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=STATUS_REGISTERED)
	registered_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		constraints = [
			models.UniqueConstraint(
				fields=['employee', 'training_session'],
				name='unique_employee_training_participation',
			)
		]
		ordering = ['-registered_at']

	def __str__(self):
		return f"{self.employee.get_full_name()} - {self.training_session.name}"
