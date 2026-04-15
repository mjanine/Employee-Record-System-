from django import forms

from .models import TrainingSession


class TrainingForm(forms.ModelForm):
    class Meta:
        model = TrainingSession
        fields = [
            'name',
            'description',
            'category',
            'date',
            'mode',
            'max_participants',
            'trainer',
            'status',
        ]
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
            'description': forms.Textarea(attrs={'rows': 3}),
        }
