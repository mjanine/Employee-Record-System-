from django.db import models
from django.conf import settings

# Create your models here.

class EmploymentHistory(models.Model):
    """
    Tracks changes in an employee's job status, department, position, etc.
    """
    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,  # Preserve history if employee is deleted
        null=True,
        related_name='employment_history'
    )
    change_type = models.CharField(max_length=100)
    from_value = models.CharField(max_length=255, blank=True, null=True)
    to_value = models.CharField(max_length=255, blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,  # Preserve history if HR staff is deleted
        null=True,
        related_name='recorded_changes'
    )

    class Meta:
        verbose_name_plural = "Employment Histories"
        ordering = ['-date']

    def __str__(self):
        emp_name = self.employee.get_full_name() if self.employee else "Unknown Employee"
        return f"{self.change_type} for {emp_name} on {self.date.strftime('%Y-%m-%d')}"