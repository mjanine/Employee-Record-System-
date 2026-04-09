from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import UniqueConstraint

# Create your models here.
class LeaveType(models.Model):
    """Defines different types of leave, e.g., Sick, Vacation."""
    name = models.CharField(max_length=100, unique=True)
    default_days = models.PositiveIntegerField(
        default=0,
        help_text="Default number of days allocated annually for this leave type."
    )

    def __str__(self):
        return self.name

class LeaveBalance(models.Model):
    """Tracks the remaining leave days for a user and leave type."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='leave_balances'
    )
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    remaining_days = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0.0,
        help_text="Remaining leave days."
    )

    class Meta:
        constraints = [
            UniqueConstraint(fields=['user', 'leave_type'], name='unique_user_leave_type')
        ]

    def __str__(self):
        return f"{self.user.get_full_name()}: {self.remaining_days} days of {self.leave_type.name}"

class LeaveRequest(models.Model):
    """Stores an employee's request for leave."""

    class Status(models.TextChoices):
        PENDING_HEAD_APPROVAL = 'PENDING_HEAD', 'Pending Head Approval'
        PENDING_HR_APPROVAL = 'PENDING_HR', 'Pending HR Approval'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        CANCELLED = 'CANCELLED', 'Cancelled'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='leave_requests'
    )
    leave_type = models.ForeignKey(LeaveType, on_delete=models.PROTECT)
    start_date = models.DateField()
    end_date = models.DateField()
    days_requested = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0.0,
        help_text="Calculated working days in the request."
    )
    reason = models.TextField()
    attachment = models.FileField(upload_to='leave_attachments/', blank=True, null=True)
    
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.PENDING_HEAD_APPROVAL
    )

    # Approval Trail
    head_remarks = models.TextField(blank=True, null=True)
    reviewed_by_head = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='head_approved_leaves')
    hr_remarks = models.TextField(blank=True, null=True)
    reviewed_by_hr = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='hr_approved_leaves')

    # Signal Control
    is_balance_deducted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Leave for {self.user.get_full_name()} from {self.start_date} to {self.end_date}"

    def clean(self):
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError("The start date cannot be after the end date.")

