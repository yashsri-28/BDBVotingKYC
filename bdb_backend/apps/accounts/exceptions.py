from rest_framework.exceptions import APIException
from rest_framework import status


class AlreadyLoggedInElsewhere(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "This account is already logged in on another device/session."
    default_code = "already_logged_in"
