from django import forms
from .models import AttendanceLog

class AttendanceEditForm(forms.ModelForm):
    """
    A form for HR to edit an employee's attendance log.
    """
    class Meta:
        model = AttendanceLog
        fields = ['time_in', 'time_out', 'status']