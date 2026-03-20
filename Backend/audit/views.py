from rest_framework import generics, permissions
from .models import AuditLog
from .serializers import AuditLogSerializer


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'admin'
        )


class AuditLogListView(generics.ListAPIView):
    queryset           = AuditLog.objects.all().order_by('-timestamp')[:100]
    serializer_class   = AuditLogSerializer
    permission_classes = [IsAdminRole]