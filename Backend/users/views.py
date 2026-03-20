from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'admin'
        )


class AdminUserListView(generics.ListAPIView):
    queryset           = User.objects.all().order_by('-date_joined')
    serializer_class   = UserSerializer
    permission_classes = [IsAdminRole]


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = User.objects.all()
    serializer_class   = UserSerializer
    permission_classes = [IsAdminRole]


class AdminStatsView(generics.GenericAPIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        from appointments.models import Appointment, DoctorProfile
        return Response({
            'total_users':        User.objects.count(),
            'total_patients':     User.objects.filter(role='patient').count(),
            'total_doctors':      User.objects.filter(role='doctor').count(),
            'total_appointments': Appointment.objects.count(),
            'pending':            Appointment.objects.filter(status='pending').count(),
            'confirmed':          Appointment.objects.filter(status='confirmed').count(),
            'completed':          Appointment.objects.filter(status='completed').count(),
            'cancelled':          Appointment.objects.filter(status='cancelled').count(),
            'total_profiles':     DoctorProfile.objects.count(),
        })


class AdminUserAppointmentsView(generics.ListAPIView):
    permission_classes = [IsAdminRole]

    def get(self, request, pk):
        from appointments.models import Appointment
        from appointments.serializers import AppointmentSerializer

        # Get appointments where user is patient or doctor
        patient_appts = Appointment.objects.filter(
            patient__id=pk
        ).order_by('-scheduled_datetime')

        doctor_appts = Appointment.objects.filter(
            doctor__user__id=pk
        ).order_by('-scheduled_datetime')

        # Combine both
        from itertools import chain
        all_appts = list(chain(patient_appts, doctor_appts))

        serializer = AppointmentSerializer(all_appts, many=True)
        return Response({
            'count':        len(all_appts),
            'appointments': serializer.data
        })        