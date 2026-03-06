from rest_framework import serializers
from .models import DoctorProfile, AvailabilitySlot, Appointment
from users.serializers import UserSerializer

class AvailabilitySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AvailabilitySlot
        fields = ['id', 'day', 'start_time', 'end_time', 'is_active']


class DoctorProfileSerializer(serializers.ModelSerializer):
    user  = UserSerializer(read_only=True)
    slots = AvailabilitySlotSerializer(many=True, read_only=True)

    class Meta:
        model  = DoctorProfile
        fields = ['id', 'user', 'specialization', 'bio', 'experience_yrs', 'consultation_fee', 'slots']


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.username', read_only=True)
    doctor_name  = serializers.CharField(source='doctor.user.username', read_only=True)

    class Meta:
        model  = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'doctor', 'doctor_name',
            'scheduled_datetime', 'duration_minutes', 'predicted_duration',
            'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['patient', 'predicted_duration', 'created_at', 'updated_at']

    def validate(self, data):
        # Conflict detection — block double booking
        doctor = data.get('doctor')
        scheduled = data.get('scheduled_datetime')
        duration = data.get('duration_minutes', 30)

        from django.utils import timezone
        from datetime import timedelta

        end_time = scheduled + timedelta(minutes=duration)

        conflict = Appointment.objects.filter(
            doctor=doctor,
            status__in=['pending', 'confirmed'],
            scheduled_datetime__lt=end_time,
        ).exclude(pk=self.instance.pk if self.instance else None)

        if conflict.exists():
            raise serializers.ValidationError("This doctor already has an appointment in that time slot.")

        return data