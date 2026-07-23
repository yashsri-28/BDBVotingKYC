class AuditContextMiddleware:
    """Makes the client IP available on request.client_ip for audit calls elsewhere."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.client_ip = self._get_client_ip(request)
        return self.get_response(request)

    @staticmethod
    def _get_client_ip(request):
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        return forwarded.split(",")[0].strip() if forwarded else request.META.get("REMOTE_ADDR")
