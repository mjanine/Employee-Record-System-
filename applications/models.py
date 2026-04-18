from django.db import models
from django.conf import settings

class Application(models.Model):
    class Type(models.TextChoices):
        NEW_EMPLOYEE = 'New Employee Application', 'New Employee Application'
        POSITION_CHANGE = 'Position Change Request', 'Position Change Request'

    class Status(models.TextChoices):
        PENDING_HEAD = 'PENDING_HEAD', 'Pending Head'
        PENDING_HR = 'PENDING_HR', 'Pending HR'
        PENDING_SD = 'PENDING_SD', 'Pending SD'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    APPLICATION_TYPES = (
        ('New Employee Application', 'New Employee Application'),
        ('Position Change Request', 'Position Change Request'),
    )
    
    APPLICATION_STATUS = (
        (Status.PENDING_HEAD, 'Pending Head'),
        (Status.PENDING_HR, 'Pending HR'),
        (Status.PENDING_SD, 'Pending SD'),
        (Status.APPROVED, 'Approved'),
        (Status.REJECTED, 'Rejected'),
    )
    
    type = models.CharField(max_length=50, choices=APPLICATION_TYPES)
    applicant_name = models.CharField(max_length=255)
    applicant_info = models.TextField(blank=True, null=True)
    target_position = models.CharField(max_length=255)
    target_department = models.ForeignKey('accounts.Department', on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=50, choices=APPLICATION_STATUS, default=Status.PENDING_HEAD)
    attached_documents = models.FileField(upload_to='application_documents/', blank=True, null=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        # Ensure all newly created records have an initial timeline row.
        if is_new:
            ApplicationStatusHistory.objects.create(
                application=self,
                previous_status=self.status,
                new_status=self.status,
                remarks='Application submitted.',
                actor=None,
            )

    def __str__(self):
        return f"{self.applicant_name} - {self.type}"

class ApplicationStatusHistory(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='history')
    previous_status = models.CharField(max_length=50)
    new_status = models.CharField(max_length=50)
    remarks = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.application} status changed to {self.new_status}"
