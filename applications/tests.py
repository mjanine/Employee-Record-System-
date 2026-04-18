from django.contrib.auth.signals import user_logged_in
from django.contrib.messages import get_messages
from django.test import TestCase
from django.urls import reverse

from accounts.models import Department, User
from audit.signals import log_user_login

from .models import Application, ApplicationStatusHistory


class HeadApplicationScopeTests(TestCase):
	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		# Prevent unrelated audit login signal side-effects in application tests.
		user_logged_in.disconnect(log_user_login)

	@classmethod
	def tearDownClass(cls):
		user_logged_in.connect(log_user_login)
		super().tearDownClass()

	def setUp(self):
		self.client.defaults['REMOTE_ADDR'] = '127.0.0.1'

		self.dept_it = Department.objects.create(name='IT')
		self.dept_cba = Department.objects.create(name='CBA')

		self.head_with_department = User.objects.create_user(
			username='head_with_department',
			password='testpass123',
			role='HEAD',
			department=self.dept_it,
			must_change_password=False,
		)

		self.head_mapped_only = User.objects.create_user(
			username='head_mapped_only',
			password='testpass123',
			role='HEAD',
			department=None,
			must_change_password=False,
		)
		self.dept_cba.head = self.head_mapped_only
		self.dept_cba.save(update_fields=['head'])

		self.head_no_scope = User.objects.create_user(
			username='head_no_scope',
			password='testpass123',
			role='HEAD',
			department=None,
			must_change_password=False,
		)

		self.hr_user = User.objects.create_user(
			username='hr_user',
			password='testpass123',
			role='HR',
			must_change_password=False,
		)
		self.sd_user = User.objects.create_user(
			username='sd_user',
			password='testpass123',
			role='SD',
			must_change_password=False,
		)
		self.emp_user = User.objects.create_user(
			username='emp_user',
			password='testpass123',
			role='EMP',
			must_change_password=False,
		)
		self.admin_user = User.objects.create_user(
			username='admin_user',
			password='testpass123',
			role='ADMIN',
			must_change_password=False,
		)

		self.app_it = Application.objects.create(
			type=Application.Type.NEW_EMPLOYEE,
			applicant_name='IT Applicant',
			target_position='Instructor',
			target_department=self.dept_it,
			status=Application.Status.PENDING_HEAD,
		)
		self.app_cba = Application.objects.create(
			type=Application.Type.NEW_EMPLOYEE,
			applicant_name='CBA Applicant',
			target_position='Instructor',
			target_department=self.dept_cba,
			status=Application.Status.PENDING_HEAD,
		)

	def test_head_with_user_department_sees_only_department_records(self):
		self.client.force_login(self.head_with_department)

		response = self.client.get(reverse('application_list'))

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, 'IT Applicant')
		self.assertNotContains(response, 'CBA Applicant')
		self.assertTrue(response.context['has_department_scope'])

	def test_head_with_department_head_mapping_but_no_user_department_still_sees_scope(self):
		self.client.force_login(self.head_mapped_only)

		response = self.client.get(reverse('application_list'))

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, 'CBA Applicant')
		self.assertNotContains(response, 'IT Applicant')
		self.assertTrue(response.context['has_department_scope'])

	def test_head_with_no_scope_gets_empty_queue_and_notice(self):
		self.client.force_login(self.head_no_scope)

		response = self.client.get(reverse('application_list'))

		self.assertEqual(response.status_code, 200)
		self.assertFalse(response.context['has_department_scope'])
		self.assertContains(response, 'No department is assigned to your Head account yet')

	def test_head_cannot_view_out_of_scope_detail(self):
		self.client.force_login(self.head_with_department)

		response = self.client.get(reverse('application_detail', args=[self.app_cba.id]))

		self.assertEqual(response.status_code, 302)
		self.assertRedirects(response, reverse('application_list'))

	def test_head_cannot_action_out_of_scope_application(self):
		self.client.force_login(self.head_with_department)

		response = self.client.post(
			reverse('process_application_action', args=[self.app_cba.id]),
			data={'decision': 'Approve', 'remarks': 'Out of scope attempt'},
		)

		self.assertEqual(response.status_code, 302)
		self.assertRedirects(response, reverse('application_list'))
		self.app_cba.refresh_from_db()
		self.assertEqual(self.app_cba.status, Application.Status.PENDING_HEAD)

	def test_head_can_forward_in_scope_pending_application(self):
		self.client.force_login(self.head_with_department)

		response = self.client.post(
			reverse('process_application_action', args=[self.app_it.id]),
			data={'decision': 'Forward', 'remarks': 'Forwarded to HR'},
		)

		self.assertEqual(response.status_code, 302)
		self.assertRedirects(response, reverse('application_detail', args=[self.app_it.id]))
		self.app_it.refresh_from_db()
		self.assertEqual(self.app_it.status, Application.Status.PENDING_HR)

	def test_hr_can_forward_pending_hr_to_pending_sd(self):
		self.app_it.status = Application.Status.PENDING_HR
		self.app_it.save(update_fields=['status'])

		self.client.force_login(self.hr_user)
		response = self.client.post(
			reverse('process_application_action', args=[self.app_it.id]),
			data={'decision': 'Forward', 'remarks': 'Forwarded to SD'},
		)

		self.assertEqual(response.status_code, 302)
		self.assertRedirects(response, reverse('application_detail', args=[self.app_it.id]))
		self.app_it.refresh_from_db()
		self.assertEqual(self.app_it.status, Application.Status.PENDING_SD)

	def test_sd_can_approve_pending_sd_application(self):
		self.app_it.status = Application.Status.PENDING_SD
		self.app_it.save(update_fields=['status'])

		self.client.force_login(self.sd_user)
		response = self.client.post(
			reverse('process_application_action', args=[self.app_it.id]),
			data={'decision': 'Approve', 'remarks': 'Final approval'},
		)

		self.assertEqual(response.status_code, 302)
		self.assertRedirects(response, reverse('sd_application_overview'))
		self.app_it.refresh_from_db()
		self.assertEqual(self.app_it.status, Application.Status.APPROVED)

	def test_sd_cannot_forward_at_final_stage(self):
		self.app_it.status = Application.Status.PENDING_SD
		self.app_it.save(update_fields=['status'])

		self.client.force_login(self.sd_user)
		response = self.client.post(
			reverse('process_application_action', args=[self.app_it.id]),
			data={'decision': 'Forward', 'remarks': 'Should be blocked'},
		)

		self.assertEqual(response.status_code, 302)
		self.assertRedirects(response, reverse('application_detail', args=[self.app_it.id]))
		self.app_it.refresh_from_db()
		self.assertEqual(self.app_it.status, Application.Status.PENDING_SD)

	def test_employee_redirected_to_own_dashboard_for_module_access(self):
		self.client.force_login(self.emp_user)
		response = self.client.get(reverse('application_list'), follow=True)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.request['PATH_INFO'], reverse('employee_dashboard'))
		self.assertIn(
			'You do not have permission to view that module.',
			[str(message) for message in get_messages(response.wsgi_request)],
		)

	def test_admin_redirected_to_admin_dashboard_for_sd_screen_access(self):
		self.client.force_login(self.admin_user)
		response = self.client.get(reverse('sd_application_overview'), follow=True)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.request['PATH_INFO'], reverse('admin_dashboard'))
		self.assertIn(
			'You do not have permission to view that module.',
			[str(message) for message in get_messages(response.wsgi_request)],
		)

	def test_initial_history_row_created_on_new_application(self):
		app = Application.objects.create(
			type=Application.Type.POSITION_CHANGE,
			applicant_name='History Applicant',
			target_position='Senior Instructor',
			target_department=self.dept_it,
			status=Application.Status.PENDING_HEAD,
		)

		first_history = ApplicationStatusHistory.objects.filter(application=app).order_by('id').first()
		self.assertIsNotNone(first_history)
		self.assertEqual(first_history.previous_status, 'Submitted')
		self.assertEqual(first_history.new_status, Application.Status.PENDING_HEAD)
		self.assertEqual(first_history.remarks, 'Application submitted.')
		self.assertIsNone(first_history.actor)


class EmployeePositionChangeRecordsBackendTests(TestCase):
	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		# Prevent unrelated audit login signal side-effects in application tests.
		user_logged_in.disconnect(log_user_login)

	@classmethod
	def tearDownClass(cls):
		user_logged_in.connect(log_user_login)
		super().tearDownClass()

	def setUp(self):
		self.client.defaults['REMOTE_ADDR'] = '127.0.0.1'

		self.department = Department.objects.create(name='IT')

		self.emp_user = User.objects.create_user(
			username='emp_records',
			password='testpass123',
			role='EMP',
			must_change_password=False,
		)
		self.hr_user = User.objects.create_user(
			username='hr_records',
			password='testpass123',
			role='HR',
			must_change_password=False,
		)

		self.own_position_change = Application.objects.create(
			type=Application.Type.POSITION_CHANGE,
			applicant_name=self.emp_user.username,
			target_position='Senior Instructor',
			target_department=self.department,
			status=Application.Status.PENDING_HEAD,
			applicant_info='Promotion track request',
		)

		self.other_position_change = Application.objects.create(
			type=Application.Type.POSITION_CHANGE,
			applicant_name='someone_else',
			target_position='Professor',
			target_department=self.department,
			status=Application.Status.PENDING_SD,
		)

		Application.objects.create(
			type=Application.Type.NEW_EMPLOYEE,
			applicant_name=self.emp_user.username,
			target_position='Instructor',
			target_department=self.department,
			status=Application.Status.PENDING_HEAD,
		)

	def test_create_position_change_context_contains_only_own_position_change_records(self):
		self.client.force_login(self.emp_user)

		response = self.client.get(reverse('create_position_change'))

		self.assertEqual(response.status_code, 200)
		records = response.context['position_change_records']
		self.assertEqual(response.context['position_change_records_count'], 1)
		self.assertEqual(len(records), 1)
		self.assertEqual(records[0]['id'], self.own_position_change.id)
		self.assertEqual(records[0]['status'], Application.Status.PENDING_HEAD)
		self.assertEqual(records[0]['status_label'], 'Pending Head')

	def test_employee_records_api_returns_database_backed_records(self):
		self.client.force_login(self.emp_user)

		response = self.client.get(reverse('employee_position_change_records_api'))

		self.assertEqual(response.status_code, 200)
		payload = response.json()
		self.assertEqual(payload['total_count'], 1)
		self.assertEqual(payload['pending_count'], 1)
		self.assertEqual(len(payload['records']), 1)
		self.assertEqual(payload['records'][0]['id'], self.own_position_change.id)
		self.assertEqual(payload['records'][0]['target_department'], self.department.name)
		self.assertTrue(payload['records'][0]['submitted_at'])

	def test_employee_records_api_rejects_non_employee_roles(self):
		self.client.force_login(self.hr_user)

		response = self.client.get(reverse('employee_position_change_records_api'))

		self.assertEqual(response.status_code, 403)
		self.assertEqual(response.json()['detail'], 'Only employees can access this endpoint.')
