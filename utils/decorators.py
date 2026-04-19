from django.contrib.auth.decorators import user_passes_test


# SD-only access for executive approver endpoints.
SD_ELEVATED_APPROVER_ROLES = ('SD', 'ADMIN')

def role_required(*allowed_roles):
    """
    Decorator to check if the user has one of the allowed roles (e.g., 'SD', 'HR', 'HEAD').
    """
    def check_role(user):
        return user.is_authenticated and user.role in allowed_roles
    return user_passes_test(check_role)


def sd_elevated_required(view_func):
    """Shortcut guard for SD final-approver endpoints."""
    return role_required(*SD_ELEVATED_APPROVER_ROLES)(view_func)