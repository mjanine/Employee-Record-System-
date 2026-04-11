from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('HR', 'HR Staff'),
        ('HEAD', 'Department Head'),
        ('EMP', 'Employee'), 
        ('SD', 'Software Developer'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='EMP')
    profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True, blank=True)
    
    is_locked = models.BooleanField(default=False)
    failed_login_attempts = models.IntegerField(default=0)
    must_change_password = models.BooleanField(default=True)
    last_password_change = models.DateTimeField(null=True, blank=True)
    
    groups = models.ManyToManyField(Group, related_name="accounts_user_groups", blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name="accounts_user_permissions", blank=True)

    def save(self, *args, **kwargs):
        is_new = not self.pk
        if is_new:
            self.last_password_change = timezone.now()
        
        super().save(*args, **kwargs)
        
        # AUTOMATIC PROFILE CREATION:
        # Every time a User is created, they get a blank EmployeeProfile automatically
       # if is_new:
        #    EmployeeProfile.objects.get_or_create(user=self)

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    college = models.CharField(max_length=100, null=True, blank=True)
    head = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_department')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

# MOVED OUTSIDE: This is now a standalone class
class EmployeeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Employment Details
    employee_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    employment_type = models.CharField(max_length=20, choices=[
        ('REG', 'Regular'), 
        ('PROB', 'Probationary'), 
        ('CONT', 'Contractual')
    ], default='REG')
    date_hired = models.DateField(default=timezone.now)
    
    # Personal Info
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    contact_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    birth_date = models.DateField(null=True, blank=True)
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=255, blank=True)
    emergency_contact_num = models.CharField(max_length=15, blank=True)
    
    is_active = models.BooleanField(default=True)

    can_self_upload = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id if self.employee_id else 'No ID'})"

class SystemConfig(models.Model):
    # Security Policies
    min_password_length = models.IntegerField(default=8)
    require_complexity = models.BooleanField(default=True)
    session_timeout = models.IntegerField(default=30) # in minutes
    force_password_change = models.BooleanField(default=False)
    
    # Backup Info
    last_backup_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "System Configuration"

    def save(self, *args, **kwargs):
        self.pk = 1  # Ensures only one instance exists
        super().save(*args, **kwargs)

class BackupSnapshot(models.Model):
    file_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    size_in_bytes = models.BigIntegerField(default=0)
    status = models.CharField(max_length=50, default='Success')

    def __str__(self):
        return f"Backup: {self.file_name} on {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    