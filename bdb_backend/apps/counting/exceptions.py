from rest_framework import status
from rest_framework.exceptions import APIException


class CountingNotOpen(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Counting is not currently open for this category."
    default_code = "counting_not_open"


class AnotherCategoryInProgress(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Another category is still being counted. Complete it before starting this one."
    default_code = "another_category_in_progress"


class DuplicateBallotNumber(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "This ballot number has already been entered for this category."
    default_code = "duplicate_ballot_number"


class InvalidVoteCount(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "The number of votes entered does not match what this ballot allows."
    default_code = "invalid_vote_count"


class DuplicateCandidateOnBallot(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "The same candidate cannot be voted for twice on one ballot."
    default_code = "duplicate_candidate_on_ballot"


class UnknownCandidateSerial(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "One or more candidate serial numbers do not exist in this category."
    default_code = "unknown_candidate_serial"
