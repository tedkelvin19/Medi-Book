from rest_framework import generics, permissions, filters
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from django.utils import timezone

from .models import (
    DoctorProfile,
    AvailabilitySlot,
    Appointment,
    AppointmentRating,
    Notification,
    Payment,
)

from .serializers import (
    DoctorProfileSerializer,
    AvailabilitySlotSerializer,
    AppointmentSerializer,
    AppointmentRatingSerializer,
)


# ── Doctor Profiles ──────────────────────────────────────────────────────────

class DoctorListView(generics.ListAPIView):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [filters.SearchFilter]
    search_fields = [
        'specialization',
        'user__username',
    ]


class DoctorDetailView(generics.RetrieveUpdateAPIView):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


class CreateDoctorProfileView(generics.CreateAPIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ── Appointments ─────────────────────────────────────────────────────────────

class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'patient':
            return Appointment.objects.filter(
                patient=user
            ).order_by('-scheduled_datetime')

        elif user.role == 'doctor':
            return Appointment.objects.filter(
                doctor__user=user
            ).order_by('-scheduled_datetime')

        return Appointment.objects.all().order_by('-scheduled_datetime')

    def perform_create(self, serializer):

        # Create appointment
        appointment = serializer.save(
            patient=self.request.user
        )

        # Notify doctor
        try:
            Notification.objects.create(
                user=appointment.doctor.user,
                appointment=appointment,
                type=Notification.Type.NEW_BOOKING,
                title='New Appointment Booked',
                message=(
                    f"{appointment.patient.username} booked an appointment "
                    f"on "
                    f"{appointment.scheduled_datetime.strftime('%a %d %b at %H:%M')}."
                ),
            )

        except Exception as e:
            print(
                f"WARNING: Failed to create booking notification: {e}"
            )


class AppointmentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'patient':
            return Appointment.objects.filter(
                patient=user
            )

        elif user.role == 'doctor':
            return Appointment.objects.filter(
                doctor__user=user
            )

        return Appointment.objects.all()

    def perform_update(self, serializer):

        appointment = self.get_object()

        old_status = appointment.status
        new_status = self.request.data.get('status')

        user = self.request.user

        allowed = {
            'patient': [
                'cancelled',
                'rescheduled',
            ],

            'doctor': [
                'confirmed',
                'completed',
                'cancelled',
            ],

            'admin': [
                'confirmed',
                'completed',
                'cancelled',
                'pending',
                'rescheduled',
            ],
        }

        role_allowed = allowed.get(user.role, [])

        if new_status and new_status not in role_allowed:
            raise PermissionDenied(
                f"Your role ({user.role}) cannot set "
                f"status to '{new_status}'."
            )

        # Save appointment
        appointment = serializer.save()

        # Notify patient when doctor confirms/cancels
        if (
            new_status
            and new_status != old_status
            and new_status in ['confirmed', 'cancelled']
        ):

            try:

                if new_status == 'confirmed':

                    Notification.objects.create(
                        user=appointment.patient,
                        appointment=appointment,
                        type=Notification.Type.CONFIRMED,
                        title='Appointment Confirmed',
                        message=(
                            f"Your appointment with Dr. "
                            f"{appointment.doctor.user.username} "
                            f"on "
                            f"{appointment.scheduled_datetime.strftime('%a %d %b at %H:%M')} "
                            f"has been confirmed."
                        ),
                    )

                elif new_status == 'cancelled':

                    Notification.objects.create(
                        user=appointment.patient,
                        appointment=appointment,
                        type=Notification.Type.CANCELLED,
                        title='Appointment Cancelled',
                        message=(
                            f"Your appointment with Dr. "
                            f"{appointment.doctor.user.username} "
                            f"on "
                            f"{appointment.scheduled_datetime.strftime('%a %d %b at %H:%M')} "
                            f"has been cancelled."
                        ),
                    )

            except Exception as e:
                print(
                    f"WARNING: Failed to create status notification: {e}"
                )


# ── Availability Slots ───────────────────────────────────────────────────────

class AvailabilitySlotListCreateView(generics.ListCreateAPIView):
    serializer_class = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'doctor':
            return AvailabilitySlot.objects.filter(
                doctor__user=user
            ).order_by(
                'day',
                'start_time'
            )

        return AvailabilitySlot.objects.none()

    def perform_create(self, serializer):

        try:
            doctor = DoctorProfile.objects.get(
                user=self.request.user
            )

        except DoctorProfile.DoesNotExist:
            raise ValidationError(
                "You must create a doctor profile first."
            )

        day = serializer.validated_data.get('day')
        start_time = serializer.validated_data.get('start_time')
        end_time = serializer.validated_data.get('end_time')

        duplicate = AvailabilitySlot.objects.filter(
            doctor=doctor,
            day=day,
            start_time=start_time,
            end_time=end_time,
        ).exists()

        if duplicate:
            raise ValidationError(
                "This slot already exists for this day."
            )

        serializer.save(
            doctor=doctor
        )


class AvailabilitySlotDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AvailabilitySlot.objects.filter(
            doctor__user=self.request.user
        )


# ── Appointment Ratings ──────────────────────────────────────────────────────

class AppointmentRatingView(generics.CreateAPIView):
    serializer_class = AppointmentRatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):

        appointment_id = self.kwargs['pk']

        try:
            appointment = Appointment.objects.get(
                pk=appointment_id,
                patient=self.request.user,
                status='completed'
            )

        except Appointment.DoesNotExist:
            raise ValidationError(
                "You can only rate completed appointments."
            )

        if hasattr(appointment, 'rating'):
            raise ValidationError(
                "You have already rated this appointment."
            )

        serializer.save(
            patient=self.request.user,
            doctor=appointment.doctor,
            appointment=appointment,
        )


# ── Notifications ────────────────────────────────────────────────────────────

class NotificationListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        notifications = Notification.objects.filter(
            user=request.user
        ).select_related(
            'appointment'
        ).order_by(
            '-created_at'
        )[:20]

        unread_count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()

        data = []

        for n in notifications:

            data.append({
                'id': n.id,
                'type': n.type,
                'title': n.title,
                'message': n.message,
                'is_read': n.is_read,
                'created_at': n.created_at.isoformat(),

                # Used by React to navigate to appointment
                'appointment_id': (
                    n.appointment_id
                    if n.appointment_id
                    else None
                ),
            })

        return Response({
            'unread_count': unread_count,
            'notifications': data,
        })


class NotificationMarkReadView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):

        # Mark one notification as read
        if pk:

            Notification.objects.filter(
                pk=pk,
                user=request.user
            ).update(
                is_read=True
            )

        # Mark all notifications as read
        else:

            Notification.objects.filter(
                user=request.user,
                is_read=False
            ).update(
                is_read=True
            )

        return Response({
            'status': 'ok'
        })


# ── Payments ─────────────────────────────────────────────────────────────────

class PaymentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        from .serializers import PaymentSerializer
        return PaymentSerializer

    def get_queryset(self):

        user = self.request.user

        if user.role == 'patient':
            return Payment.objects.filter(
                patient=user
            )

        elif user.role == 'doctor':
            return Payment.objects.filter(
                appointment__doctor__user=user
            )

        return Payment.objects.all()

    def perform_create(self, serializer):

        appointment_id = self.request.data.get(
            'appointment'
        )

        if not appointment_id:
            raise ValidationError(
                "appointment field is required."
            )

        try:
            appointment = Appointment.objects.get(
                pk=appointment_id,
                patient=self.request.user
            )

        except Appointment.DoesNotExist:
            raise ValidationError(
                "Appointment not found."
            )

        # Check if already paid
        if Payment.objects.filter(
            appointment=appointment
        ).exists():

            raise ValidationError(
                "This appointment has already been paid."
            )

        # Create payment
        payment = serializer.save(
            patient=self.request.user,
            amount=appointment.doctor.consultation_fee,
            status='completed',
            paid_at=timezone.now(),
        )

        # Notify doctor about payment
        try:

            Notification.objects.create(
                user=appointment.doctor.user,
                appointment=appointment,
                type=Notification.Type.PAYMENT,
                title='Payment Received',
                message=(
                    f"{self.request.user.username} paid "
                    f"KSh {appointment.doctor.consultation_fee} "
                    f"for their appointment on "
                    f"{appointment.scheduled_datetime.strftime('%a %d %b')}."
                ),
            )

        except Exception as e:
            print(
                f"WARNING: Failed to create payment notification: {e}"
            )


class PaymentDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        from .serializers import PaymentSerializer
        return PaymentSerializer

    def get_queryset(self):
        return Payment.objects.filter(
            patient=self.request.user
        )