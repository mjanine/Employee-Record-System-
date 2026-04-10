from .models import EmploymentHistory

def log_history(employee, change_type, from_value, to_value, recorded_by):
    """
    Creates and saves an EmploymentHistory instance.
    Designed to be imported and used by other apps to maintain an audit trail.
    """
    return EmploymentHistory.objects.create(
        employee=employee,
        change_type=change_type,
        from_value=from_value,
        to_value=to_value,
        recorded_by=recorded_by
    )