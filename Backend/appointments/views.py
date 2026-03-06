from rest_framework import generics, permissions, filters
from rest_framework.exceptions import PermissionDenied
from .models import DoctorProfile, Appointment
from .serializers import DoctorProfileSerializer, AppointmentSerializer


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
            return Appointment.objects.filter(doctor__user=user)
        return Appointment.objects.all()

    def perform_update(self, serializer):
        # Only allow cancel/reschedule — not arbitrary edits
        allowed = ['cancelled', 'rescheduled', 'confirmed', 'completed']
        status  = self.request.data.get('status')
        if status and status not in allowed:
            raise PermissionDenied("Invalid status update.")
        serializer.save()
class CreateDoctorProfileView(generics.CreateAPIView):
    serializer_class   = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)      