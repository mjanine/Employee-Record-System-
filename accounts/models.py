from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.utils import timezone


# =========================
# CUSTOM USER MODEL
# =========================
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
        is_new = self.pk is None

        if is_new:
            self.last_password_change = timezone.now()

        super().save(*args, **kwargs)

        # Optional auto profile creation
        # if is_new:
        #     EmployeeProfile.objects.get_or_create(user=self)


# =========================
# DEPARTMENT MODEL (FIXED)
# =========================
class Department(models.Model):
    DEPT_CHOICES = [
        ('CIVIL', 'Civil Engineering'),
        ('COMP_ENG', 'Computer Engineering'),
        ('ELEC', 'Electrical Engineering'),
        ('IND_ENG', 'Industrial Engineering'),
        ('MECH', 'Mechanical Engineering'),
        ('IT', 'Information Technology'),
        ('CS', 'Computer Science'),
        ('EMC', 'Entertainment & Multimedia Computing'),
        ('NURSING', 'Nursing'),
        ('MED_TECH', 'Medical Technology'),
        ('PHARMA', 'Pharmacy'),
        ('CBA', 'Business Administration'),
        ('CRIM', 'Criminology'),
        ('EDUC', 'Education'),
        ('IHM', 'International Hospitality Management'),
    ]

    name = models.CharField(max_length=50, choices=DEPT_CHOICES, unique=True)
    college = models.CharField(max_length=100, null=True, blank=True)
    head = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='headed_department'
    )
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        mapping = {
            'CIVIL': 'College of Engineering',
            'COMP_ENG': 'College of Engineering',
            'ELEC': 'College of Engineering',
            'IND_ENG': 'College of Engineering',
            'MECH': 'College of Engineering',
            'IT': 'College of Computer Studies',
            'CS': 'College of Computer Studies',
            'EMC': 'College of Computer Studies',
            'NURSING': 'Health & Sciences',
            'MED_TECH': 'Health & Sciences',
            'PHARMA': 'Health & Sciences',
            'CBA': 'Business & Arts',
            'CRIM': 'Business & Arts',
            'EDUC': 'Business & Arts',
            'IHM': 'Business & Arts',
        }

        self.college = mapping.get(self.name, '')
        super().save(*args, **kwargs)

    def __str__(self):
        return self.get_name_display()


# =========================
# EMPLOYEE PROFILE
# =========================
class EmployeeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    employee_id = models.CharField(max_length=20, unique=True, null=True, blank=True)

    employment_type = models.CharField(
        max_length=20,
        choices=[
            ('REG', 'Regular'),
            ('PROB', 'Probationary'),
            ('CONT', 'Contractual')
        ],
        default='REG'
    )

    date_hired = models.DateField(default=timezone.now)

    middle_name = models.CharField(max_length=100, blank=True, null=True)
    contact_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    birth_date = models.DateField(null=True, blank=True)

    emergency_contact_name = models.CharField(max_length=255, blank=True)
    emergency_contact_num = models.CharField(max_length=15, blank=True)

    is_active = models.BooleanField(default=True)
    can_self_upload = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id or 'No ID'})"


# =========================
# SYSTEM CONFIG (SINGLETON)
# =========================
class SystemConfig(models.Model):
    min_password_length = models.IntegerField(default=8)
    require_complexity = models.BooleanField(default=True)
    session_timeout = models.IntegerField(default=30)  # minutes
    force_password_change = models.BooleanField(default=False)
    max_failed_login_attempts = models.IntegerField(default=5)

    last_backup_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "System Configuration"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


# =========================
# BACKUP SNAPSHOT
# =========================
class BackupSnapshot(models.Model):
    file_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    size_in_bytes = models.BigIntegerField(default=0)
    status = models.CharField(max_length=50, default='Success')

    def __str__(self):
        return f"Backup: {self.file_name} on {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class ReportExportHistory(models.Model):
    class ExportFormat(models.TextChoices):
        PDF = 'PDF', 'PDF'
        EXCEL = 'EXCEL', 'Excel'

    exported_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='report_exports',
    )
    role = models.CharField(max_length=10, blank=True)
    report_type = models.CharField(max_length=100)
    export_format = models.CharField(max_length=10, choices=ExportFormat.choices)
    scope = models.CharField(max_length=100, default='Institution-wide')
    filters = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.report_type} ({self.export_format}) by {self.role or 'Unknown'}"