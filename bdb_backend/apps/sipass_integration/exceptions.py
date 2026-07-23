from rest_framework.exceptions import APIException
from rest_framework import status


class SiPassUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "SiPass API unavailable — use manual search instead."
    default_code = "sipass_unavailable"
