from django.test import TestCase
from django.urls import reverse

from audit.models import LoginLog
from accounts.models import Department, User
from notifications.models import Notification


class DashboardIntegrationTests(TestCase):
	def setUp(self):
		self.department = Department.objects.create(name='IT')

	def _create_user(self, username, role, department=None):
		return User.objects.create_user(
			username=username,
			password='pass12345',
			role=role,
			department=department,
			must_change_password=False,
		)

	def _login(self, username, password='pass12345'):
		response = self.client.post(
			reverse('login'),
			{'username': username, 'password': password},
			REMOTE_ADDR='127.0.0.1',
		)
		self.assertIn(response.status_code, [200, 302])

	def test_admin_dashboard_contains_bootstrap_payload_and_dynamic_sections(self):
		admin_user = self._create_user('admin1', 'ADMIN')
		Notification.objects.create(
			user=admin_user,
			message='System check complete',
			notification_type='System Announcement',
		)
		LoginLog.objects.create(
			user=admin_user,
			username=admin_user.username,
			ip_address='127.0.0.1',
			status='Success',
			is_success=True,
		)

		self._login(admin_user.username)
		response = self.client.get(reverse('admin_dashboard'))

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, 'adminDashboardData')
		self.assertContains(response, 'FAQ / Help Center')
		self.assertContains(response, reverse('employee_list'))
		self.assertIn('dashboard_payload', response.context)
		self.assertIn('user_account_summary', response.context)

	def test_sd_dashboard_denies_admin_after_policy_hardening(self):
		admin_user = self._create_user('admin2', 'ADMIN')
		self._login(admin_user.username)

		response = self.client.get(reverse('sd_dashboard'))

		self.assertEqual(response.status_code, 302)

	def test_sd_dashboard_includes_shared_chart_dependency(self):
		sd_user = self._create_user('sd1', 'SD')
		self._login(sd_user.username)

		response = self.client.get(reverse('sd_dashboard'))

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, "js/charts.js")

	def test_hr_dashboard_clear_notifications_button_has_backend_endpoint(self):
		hr_user = self._create_user('hr1', 'HR')
		self._login(hr_user.username)

		response = self.client.get(reverse('hr_dashboard'))

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, reverse('notifications:mark_all_as_read'))

	def test_employee_dashboard_clear_notifications_button_has_backend_endpoint(self):
		emp_user = self._create_user('emp1', 'EMP')
		self._login(emp_user.username)

		response = self.client.get(reverse('employee_dashboard'))

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, reverse('notifications:mark_all_as_read'))

	def test_head_dashboard_clear_notifications_button_has_backend_endpoint(self):
		head_user = self._create_user('head1', 'HEAD', department=self.department)
		self._login(head_user.username)

		response = self.client.get(reverse('head_dashboard'))

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, reverse('notifications:mark_all_as_read'))

	def test_sd_dashboard_clear_notifications_button_has_backend_endpoint(self):
		sd_user = self._create_user('sd2', 'SD')
		self._login(sd_user.username)

		response = self.client.get(reverse('sd_dashboard'))

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, reverse('notifications:mark_all_as_read'))
