from .models import AuditLog

TRACKED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']
SENSITIVE_PATHS = ['/api/auth/', '/api/appointments/', '/api/doctors/']

class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Only log tracked methods on sensitive paths
        is_tracked = any(request.path.startswith(p) for p in SENSITIVE_PATHS)
        if request.method in TRACKED_METHODS and is_tracked:
            self._log(request, response)

        return response

    def _log(self, request, response):
        try:
            user = request.user if request.user.is_authenticated else None
            AuditLog.objects.create(
                user       = user,
                action     = f"{request.method} {request.path}",
                ip_address = self._get_ip(request),
                extra_data = {
                    "status_code": response.status_code,
                    "method":      request.method,
                    "path":        request.path,
                }
            )
        except Exception:
            pass  # Never let logging break the app

    def _get_ip(self, request):
        forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if forwarded:
            return forwarded.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')