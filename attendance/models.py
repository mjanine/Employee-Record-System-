from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from datetime import time

# Create your models here.
class AttendanceLog(models.Model):
    """
    Represents a single day's attendance record for an employee.
    """
    class Status(models.TextChoices):
        PRESENT = 'PRESENT', _('Present')
        ABSENT = 'ABSENT', _('Absent')
        LATE = 'LATE', _('Late')
        UNDERTIME = 'UNDERTIME', _('Undertime')

    employee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendance_logs')
    date = models.DateField()
    time_in = models.TimeField(null=True, blank=True)
    time_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ABSENT)
    edited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, blank=True, 
        related_name='edited_attendance_logs'
    )

    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.date} ({self.status})"

    def save(self, *args, **kwargs):
        # Auto-calculate status only if not edited by HR to preserve manual overrides
        if not self.edited_by:
            if not self.time_in and not self.time_out:
                self.status = self.Status.ABSENT
            elif self.time_in:
                if self.time_in > time(8, 0):  # After 8:00 AM is Late
                    self.status = self.Status.LATE
                elif self.time_out and self.time_out < time(17, 0): # Before 5:00 PM is Undertime
                    self.status = self.Status.UNDERTIME
                else:
                    self.status = self.Status.PRESENT
        super().save(*args, **kwargs)
