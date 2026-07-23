from rest_framework.exceptions import APIException
from rest_framework import status


class RecordLocked(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Already being verified at another counter."
    default_code = "record_locked"


class NotAuthorizedRepresentative(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Not an Authorized Representative"
    default_code = "not_authorized_representative"
