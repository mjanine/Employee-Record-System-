import datetime
from django import forms
from django.core.exceptions import ValidationError
from .models import LeaveRequest, LeaveBalance, LeaveType

def calculate_working_days(start_date, end_date):
    """
    Calculates the number of working days (Mon-Fri) between two dates, inclusive.
    """
    if not start_date or not end_date or start_date > end_date:
        return 0
    day_generator = (start_date + datetime.timedelta(x) for x in range((end_date - start_date).days + 1))
    return sum(1 for day in day_generator if day.weekday() < 5)


class LeaveRequestForm(forms.ModelForm):
    class Meta:
        model = LeaveRequest
        fields = ['leave_type', 'start_date', 'end_date', 'reason', 'attachment']
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date': forms.DateInput(attrs={'type': 'date'}),
            'reason': forms.Textarea(attrs={'rows': 3}),
        }

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        self.fields['leave_type'].queryset = LeaveType.objects.all()

    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('start_date')
        end_date = cleaned_data.get('end_date')
        leave_type = cleaned_data.get('leave_type')

        if not self.user:
            raise ValidationError("User context is missing for validation.")

        if start_date and end_date and leave_type:
            if start_date > end_date:
                raise ValidationError({"end_date": "The end date cannot be earlier than the start date."})

            working_days = calculate_working_days(start_date, end_date)
            if working_days <= 0:
                raise ValidationError("The leave duration must be at least one working day.")
            
            cleaned_data['days_requested'] = working_days

            try:
                balance = LeaveBalance.objects.get(user=self.user, leave_type=leave_type)
                if balance.remaining_days < working_days:
                    raise ValidationError(f"Insufficient leave balance. Remaining {leave_type.name}: {balance.remaining_days} days. Requested: {working_days} days.")
            except LeaveBalance.DoesNotExist:
                raise ValidationError(f"You have no leave balance for {leave_type.name}.")
        
        return cleaned_data

class LeaveActionForm(forms.Form):
    ACTION_CHOICES = [('APPROVE', 'Approve'), ('REJECT', 'Reject')]
    action = forms.ChoiceField(choices=ACTION_CHOICES, widget=forms.RadioSelect)
    remarks = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}), required=False)

