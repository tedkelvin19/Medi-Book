from django.db import models
from django.conf import settings

class DoctorProfile(models.Model):
    user           = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.CharField(max_length=100)
    bio            = models.TextField(blank=True)
    experience_yrs = models.PositiveIntegerField(default=0)
    consultation_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    def __str__(self):
        return f"Dr. {self.user.username} - {self.specialization}"


class AvailabilitySlot(models.Model):
    class Day(models.IntegerChoices):
        MONDAY    = 0, 'Monday'
        TUESDAY   = 1, 'Tuesday'
        WEDNESDAY = 2, 'Wednesday'
        THURSDAY  = 3, 'Thursday'
        FRIDAY    = 4, 'Friday'
        SATURDAY  = 5, 'Saturday'
        SUNDAY    = 6, 'Sunday'

    doctor     = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='slots')
    day        = models.IntegerField(choices=Day.choices)
    start_time = models.TimeField()
    end_time   = models.TimeField()
    is_active  = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.doctor} | {self.get_day_display()} {self.start_time}-{self.end_time}"


class Appointment(models.Model):
    class Status(models.TextChoices):
        PENDING    = 'pending',    'Pending'
        CONFIRMED  = 'confirmed',  'Confirmed'
        CANCELLED  = 'cancelled',  'Cancelled'
        COMPLETED  = 'completed',  'Completed'
        RESCHEDULED = 'rescheduled', 'Rescheduled'

    patient            = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='patient_appointments')
    doctor             = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='doctor_appointments')
    scheduled_datetime = models.DateTimeField()
    duration_minutes   = models.PositiveIntegerField(default=30)
    predicted_duration = models.PositiveIntegerField(null=True, blank=True)
    status             = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    notes              = models.TextField(blank=True)
    created_at         = models.DateTimeField(auto_now_add=True)
    updated_at         = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['scheduled_datetime']),
            models.Index(fields=['doctor']),
            models.Index(fields=['patient']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.patient.username} → {self.doctor} @ {self.scheduled_datetime}"
        
class AppointmentRating(models.Model):
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name='rating'
    )
    patient     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings_given'
    )
    doctor      = models.ForeignKey(
        DoctorProfile,
        on_delete=models.CASCADE,
        related_name='ratings_received'
    )
    score       = models.PositiveIntegerField()  # 1–5
    comment     = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.patient.username} rated {self.doctor} → {self.score}/5"

class Notification(models.Model):
    class Type(models.TextChoices):
        NEW_BOOKING = 'new_booking', 'New Booking'
        CONFIRMED = 'confirmed', 'Appointment Confirmed'
        CANCELLED = 'cancelled', 'Appointment Cancelled'
        RESCHEDULED = 'rescheduled', 'Rescheduled'
        REMINDER = 'reminder', 'Reminder'
        PAYMENT = 'payment', 'Payment'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True
    )

    type = models.CharField(
        max_length=20,
        choices=Type.choices
    )

    title = models.CharField(max_length=200)

    message = models.TextField()

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} — {self.title}"

class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING   = 'pending',   'Pending'
        COMPLETED = 'completed', 'Completed'
        FAILED    = 'failed',    'Failed'
        REFUNDED  = 'refunded',  'Refunded'

    class Method(models.TextChoices):
        MPESA      = 'mpesa',      'M-Pesa'
        CARD       = 'card',       'Card'
        CASH       = 'cash',       'Cash'
        INSURANCE  = 'insurance',  'Insurance'

    appointment     = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name='payment'
    )
    patient         = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount          = models.DecimalField(max_digits=10, decimal_places=2)
    method          = models.CharField(
        max_length=20,
        choices=Method.choices,
        default=Method.MPESA
    )
    status          = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    transaction_id  = models.CharField(max_length=100, blank=True)
    paid_at         = models.DateTimeField(null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    notes           = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment #{self.id} — {self.patient.username} — KSh {self.amount}"        