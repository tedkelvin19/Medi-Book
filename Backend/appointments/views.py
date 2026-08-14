from rest_framework import generics, permissions, filters
from rest_framework.exceptions import PermissionDenied
from .models import DoctorProfile, AvailabilitySlot, Appointment, AppointmentRating
from .serializers import (
    DoctorProfileSerializer,
    AvailabilitySlotSerializer,
    AppointmentSerializer,
    AppointmentRatingSerializer,
)


# ── Doctor Profiles ──────────────────────────────────────────────────────────
class DoctorListView(generics.ListAPIView):
    queryset           = DoctorProfile.objects.all()
    serializer_class   = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['specialization', 'user__username']


class DoctorDetailView(generics.RetrieveUpdateAPIView):
    queryset           = DoctorProfile.objects.all()
    serializer_class   = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


# ── Appointments ─────────────────────────────────────────────────────────────
class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class   = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return Appointment.objects.filter(patient=user)
        elif user.role == 'doctor':
            return Appointment.objects.filter(doctor__user=user)
        return Appointment.objects.all()  # admin sees all

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)


class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return Appointment.objects.filter(patient=user)
        elif user.role == 'doctor':
            # ✅ Doctor can see appointments for their profile
            return Appointment.objects.filter(doctor__user=user)
        return Appointment.objects.all()  # admin sees all

    def perform_update(self, serializer):
        user   = self.request.user
        status = self.request.data.get('status')

        # Define what each role is allowed to do
        allowed = {
            'patient': ['cancelled', 'rescheduled'],
            'doctor':  ['confirmed', 'completed', 'cancelled'],
            'admin':   ['confirmed', 'completed', 'cancelled', 'pending', 'rescheduled'],
        }

        role_allowed = allowed.get(user.role, [])

        if status and status not in role_allowed:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                f"Your role ({user.role}) cannot set status to '{status}'."
            )

        serializer.save()
class CreateDoctorProfileView(generics.CreateAPIView):
    serializer_class   = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)    
class AvailabilitySlotListCreateView(generics.ListCreateAPIView):
    serializer_class   = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'doctor':
            return AvailabilitySlot.objects.filter(
                doctor__user=user
            ).order_by('day', 'start_time')
        return AvailabilitySlot.objects.none()

    def perform_create(self, serializer):
        try:
            doctor = DoctorProfile.objects.get(user=self.request.user)
        except DoctorProfile.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You must create a doctor profile first.")

        # Check for duplicate slot on same day with same times
        day        = serializer.validated_data.get('day')
        start_time = serializer.validated_data.get('start_time')
        end_time   = serializer.validated_data.get('end_time')

        duplicate = AvailabilitySlot.objects.filter(
            doctor=doctor,
            day=day,
            start_time=start_time,
            end_time=end_time,
        ).exists()

        if duplicate:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(
                "This slot already exists for this day."
            )

        serializer.save(doctor=doctor)

class AvailabilitySlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AvailabilitySlot.objects.filter(
            doctor__user=self.request.user
        )



class AppointmentRatingView(generics.CreateAPIView):
    serializer_class   = AppointmentRatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        appointment_id = self.kwargs['pk']
        try:
            appt = Appointment.objects.get(
                pk=appointment_id,
                patient=self.request.user,
                status='completed'
            )
        except Appointment.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(
                "You can only rate completed appointments."
            )

        # Check not already rated
        if hasattr(appt, 'rating'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError(
                "You have already rated this appointment."
            )

        serializer.save(
            patient=self.request.user,
            doctor=appt.doctor,
            appointment=appt,
        )
          