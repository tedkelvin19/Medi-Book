from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display  = ['timestamp', 'user', 'action', 'ip_address']
    list_filter   = ['action']
    search_fields = ['user__username', 'action', 'ip_address']
    readonly_fields = ['user', 'action', 'ip_address', 'timestamp', 'extra_data']

    # Prevent anyone from adding or deleting audit logs manually
    def has_add_permission(self, request): return False
    def has_delete_permission(self, request, obj=None): return False