from rest_framework import serializers
from .models import DoctorProfile, AvailabilitySlot, Appointment, AppointmentRating, Payment
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
        fields = [
            'id', 'user', 'specialization', 'bio',
            'experience_yrs', 'consultation_fee', 'slots'
        ]


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(
        source='patient.username', read_only=True
    )
    doctor_name = serializers.CharField(
        source='doctor.user.username', read_only=True
    )
    consultation_fee = serializers.DecimalField(
        source='doctor.consultation_fee',
        max_digits=10, decimal_places=2,
        read_only=True
    )

    class Meta:
        model  = Appointment
        fields = [
            'id', 'patient', 'patient_name', 
            'doctor', 'doctor_name', 'consultation_fee',
            'scheduled_datetime', 'duration_minutes', 
            'predicted_duration','status', 'notes', 
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'patient', 'predicted_duration', 'created_at', 'updated_at'
        ]

        def validate(self, data):
        # Skip conflict check if only updating status
            if list(data.keys()) == ['status']:
                return data

            # Skip if no doctor or scheduled time provided
            doctor    = data.get('doctor')
            scheduled = data.get('scheduled_datetime')

            if not doctor or not scheduled:
                return data

            duration = data.get('duration_minutes', 30)

            from datetime import timedelta

            new_start = scheduled
            new_end   = scheduled + timedelta(minutes=duration)

            # Get existing appointments for this doctor
            existing = Appointment.objects.filter(
                doctor=doctor,
                status__in=['pending', 'confirmed'],
            ).exclude(
                pk=self.instance.pk if self.instance else None
            )

            # Check for actual time overlap
            for appt in existing:
                existing_start = appt.scheduled_datetime
                existing_end   = existing_start + timedelta(
                    minutes=appt.duration_minutes or 30
                )

                # Overlap condition:
                # new starts before existing ends AND new ends after existing starts
                if new_start < existing_end and new_end > existing_start:
                    raise serializers.ValidationError(
                        f"This doctor already has an appointment from "
                        f"{existing_start.strftime('%H:%M')} to "
                        f"{existing_end.strftime('%H:%M')} on that day. "
                        f"Please choose a different time."
                    )

                    return data

class AppointmentRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AppointmentRating
        fields = ['id', 'appointment', 'score', 'comment', 'created_at']
        read_only_fields = ['patient', 'doctor', 'created_at']

    def validate_score(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Score must be between 1 and 5.")
        return value        

class PaymentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(
        source='patient.username', read_only=True
    )
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model  = Payment
        fields = [
            'id', 'appointment', 'patient', 'patient_name',
            'doctor_name', 'amount', 'method', 'status',
            'transaction_id', 'paid_at', 'created_at', 'notes'
        ]
        read_only_fields = [
            'patient', 'amount',        # ✅ amount set by view
            'status', 'paid_at',
            'created_at'
        ]

    def get_doctor_name(self, obj):
        try:
            return obj.appointment.doctor.user.username
        except Exception:
            return ''