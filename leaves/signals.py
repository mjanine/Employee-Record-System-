from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from django.db.models import F
from .models import LeaveRequest, LeaveBalance

@receiver(post_save, sender=LeaveRequest)
def deduct_leave_balance_on_approval(sender, instance, **kwargs):
    """
    Deducts leave balance when a leave request's status is changed to 'APPROVED'.
    Uses a transaction and a flag to prevent race conditions and double deductions.
    """
    # We only care about updates where status is APPROVED and balance hasn't been deducted.
    if instance.status == LeaveRequest.Status.APPROVED and not instance.is_balance_deducted:
        try:
            with transaction.atomic():
                # Lock the balance row for this user and leave type to prevent race conditions
                balance = LeaveBalance.objects.select_for_update().get(
                    user=instance.user,
                    leave_type=instance.leave_type
                )

                # Double-check balance as a safeguard, though form validation should prevent this.
                if balance.remaining_days >= instance.days_requested:
                    balance.remaining_days = F('remaining_days') - instance.days_requested
                    balance.save()

                    # Mark the request as processed to prevent this signal from running again on subsequent saves.
                    # Using update() is crucial to avoid re-triggering the signal.
                    LeaveRequest.objects.filter(pk=instance.pk).update(is_balance_deducted=True)

                    # TODO: Trigger notification for employee about leave approval
                    print(f"SUCCESS: Leave balance deducted for {instance.user.username}.")
                else:
                    print(f"ERROR: Insufficient balance for {instance.user.username} during signal processing.")
                    
        except LeaveBalance.DoesNotExist:
            print(f"CRITICAL: LeaveBalance model not found for {instance.user.username} and {instance.leave_type.name} during signal processing.")

