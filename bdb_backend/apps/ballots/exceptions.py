from rest_framework.exceptions import APIException
from rest_framework import status


class InsufficientBallots(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Not enough ballots remaining in this counter's allocation."
    default_code = "insufficient_ballots"


class ExceedsPoolTotal(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "This allocation would exceed the base pool total."
    default_code = "exceeds_pool_total"
