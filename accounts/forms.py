from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User, Department, EmployeeProfile # Added EmployeeProfile here

# === TASK 02: USER MANAGEMENT FORMS ===
class CustomUserCreationForm(UserCreationForm):
    role = forms.ChoiceField(choices=User.ROLE_CHOICES, initial='EMP')
    department = forms.ModelChoiceField(queryset=Department.objects.all(), required=False)
    profile_pic = forms.ImageField(required=False)

    class Meta(UserCreationForm.Meta):
        model = User
        fields = UserCreationForm.Meta.fields + ('first_name', 'last_name', 'email', 'role', 'department', 'profile_pic')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = self.cleaned_data['role']
        user.department = self.cleaned_data['department']
        user.profile_pic = self.cleaned_data['profile_pic']
        user.must_change_password = True
        if commit:
            user.save()
        return user

class CustomUserChangeForm(UserChangeForm):
    role = forms.ChoiceField(choices=User.ROLE_CHOICES)
    department = forms.ModelChoiceField(queryset=Department.objects.all(), required=False)
    profile_pic = forms.ImageField(required=False)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'role', 'department', 'profile_pic', 'is_active', 'is_locked', 'must_change_password')

class AssignRoleForm(forms.Form):
    user_id = forms.IntegerField(widget=forms.HiddenInput())
    role = forms.ChoiceField(choices=User.ROLE_CHOICES)
    department = forms.ModelChoiceField(queryset=Department.objects.all(), required=False)

class AccountStatusForm(forms.Form):
    user_id = forms.IntegerField(widget=forms.HiddenInput())
    action = forms.CharField(widget=forms.HiddenInput())

class AdminPasswordResetForm(forms.Form):
    user_id = forms.IntegerField(widget=forms.HiddenInput())
    new_password1 = forms.CharField(label="New password", widget=forms.PasswordInput)
    new_password2 = forms.CharField(label="Confirm new password", widget=forms.PasswordInput)

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get("new_password1") != cleaned_data.get("new_password2"):
            raise forms.ValidationError("The two password fields didn't match.")
        return cleaned_data


# === TASK 03: DEPARTMENT MANAGEMENT FORMS ===
class DepartmentForm(forms.ModelForm):
    class Meta:
        model = Department
        fields = ['name', 'college', 'head', 'is_active']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'required': 'true'}),
            'college': forms.TextInput(attrs={'class': 'form-control'}),
            'head': forms.Select(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['head'].queryset = User.objects.filter(role='HEAD', is_active=True)
        self.fields['head'].empty_label = "Select Department Head"


# === TASK 04: EMPLOYEE RECORDS FORMS ===
class AddEmployeeForm(forms.ModelForm):
    # These fields live in the User model, so we add them here manually
    first_name = forms.CharField(max_length=30, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'First Name'}))
    last_name = forms.CharField(max_length=30, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Last Name'}))
    email = forms.EmailField(widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'email@uph.edu.ph'}))
    username = forms.CharField(max_length=30, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Username'}))
    
    class Meta:
        model = EmployeeProfile
        fields = [
            'employee_id', 'employment_type', 'middle_name', 
            'contact_number', 'address', 'birth_date',
            'emergency_contact_name', 'emergency_contact_num'
        ]
        widgets = {
            'employee_id': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'UPH-2026-001'}),
            'employment_type': forms.Select(attrs={'class': 'form-control'}),
            'middle_name': forms.TextInput(attrs={'class': 'form-control'}),
            'contact_number': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.Textarea(attrs={'rows': 2, 'class': 'form-control'}),
            'birth_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'emergency_contact_name': forms.TextInput(attrs={'class': 'form-control'}),
            'emergency_contact_num': forms.TextInput(attrs={'class': 'form-control'}),
        }