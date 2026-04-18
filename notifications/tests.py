from django.test import TestCase
from django.urls import reverse

from accounts.models import User
from notifications.models import Notification


class NotificationEndpointsTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			username='notif_user',
			password='pass12345',
			role='EMP',
			must_change_password=False,
		)

	def _login(self, username, password='pass12345'):
		response = self.client.post(
			reverse('login'),
			{'username': username, 'password': password},
			REMOTE_ADDR='127.0.0.1',
		)
		self.assertIn(response.status_code, [200, 302])

	def test_mark_all_as_read_marks_only_current_users_notifications(self):
		other_user = User.objects.create_user(
			username='other_user',
			password='pass12345',
			role='EMP',
			must_change_password=False,
		)

		Notification.objects.create(
			user=self.user,
			message='One',
			notification_type='System Announcement',
			is_read=False,
		)
		Notification.objects.create(
			user=self.user,
			message='Two',
			notification_type='Leave Update',
			is_read=False,
		)
		Notification.objects.create(
			user=other_user,
			message='Other',
			notification_type='Pending Approval',
			is_read=False,
		)

		self._login(self.user.username)
		response = self.client.post(reverse('notifications:mark_all_as_read'))

		self.assertEqual(response.status_code, 200)
		self.assertJSONEqual(response.content, {'status': 'success'})
		self.assertEqual(Notification.objects.filter(user=self.user, is_read=False).count(), 0)
		self.assertEqual(Notification.objects.filter(user=other_user, is_read=False).count(), 1)

	def test_mark_all_as_read_requires_authentication(self):
		response = self.client.post(reverse('notifications:mark_all_as_read'))
		self.assertEqual(response.status_code, 302)
