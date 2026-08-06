from rest_framework.views import APIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .services import get_latest_taps, register_tap
from .serializers import TapSerializer, SimulateTapRequestSerializer
from .services import get_latest_taps, register_tap, register_real_tap
from .serializers import TapSerializer, SimulateTapRequestSerializer, ScanSerializer
from rest_framework.permissions import AllowAny


# class LatestTapsView(APIView):
#     """GET /api/sipass/latest-taps/?minutes=5 — Step 2: cards swiped in last X minutes."""

#     @swagger_auto_schema(
#         manual_parameters=[openapi.Parameter("minutes", openapi.IN_QUERY, type=openapi.TYPE_INTEGER, default=5)],
#         responses={200: TapSerializer(many=True)},
#     )
#     def get(self, request):
#         minutes = int(request.query_params.get("minutes", 5))
#         taps = get_latest_taps(minutes=minutes)
#         return Response(TapSerializer(taps, many=True).data)


class LatestTapsView(APIView):
    """GET /api/sipass/latest-taps/?minutes=5&device_id=COUNTER-1 — Step 2: cards swiped in last X minutes, optionally filtered to one reader/counter."""

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter("minutes", openapi.IN_QUERY, type=openapi.TYPE_INTEGER, default=5),
            openapi.Parameter("device_id", openapi.IN_QUERY, type=openapi.TYPE_STRING, required=False),
        ],
        responses={200: TapSerializer(many=True)},
    )
    def get(self, request):
        
        minutes = int(request.query_params.get("minutes", 5))
        print(minutes)
        device_id = request.query_params.get("device_id")
        taps = get_latest_taps(minutes=minutes, device_id=device_id)
        return Response(TapSerializer(taps, many=True).data)

class SimulateTapView(APIView):
    """
    POST /api/sipass/simulate-tap/ — dev/demo only helper to simulate a card
    tap without real hardware (mirrors what the SiPass webhook/poll would
    deliver). Remove or gate behind DEBUG once real integration lands.
    """

    @swagger_auto_schema(request_body=SimulateTapRequestSerializer, responses={200: TapSerializer, 204: "Debounced"})
    def post(self, request):
        serializer = SimulateTapRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tap = register_tap(
            card_number=serializer.validated_data.get("access_card_number"),
            reader_name=serializer.validated_data.get("reader_name", "READER-C1"),
        )
        if tap is None:
            return Response({"detail": "Duplicate tap ignored (debounced)."}, status=204)
        return Response(TapSerializer(tap).data)



class RegisterScanView(APIView):
    """
    POST /sipass/scan/ — called by the .exe running on each counter PC's
    local machine (reads the physical card reader over COM port). Persists
    the tap so it shows up via GET /sipass/latest-taps/ same as a mock tap.
    
    """
    authentication_classes = []      
    permission_classes = [AllowAny] 

    @swagger_auto_schema(request_body=ScanSerializer, responses={201: TapSerializer, 204: "Debounced"})
    def post(self, request):
        serializer = ScanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tap = register_real_tap(
            credential_no=serializer.validated_data["credential_no"],
            device_id=serializer.validated_data["device_id"],
        )
        if tap is None:
            return Response({"detail": "Duplicate tap ignored (debounced)."}, status=204)
        return Response(
            {
                "access_card_number": tap.access_card_number,
                "reader_name": tap.reader_name,
                "timestamp": tap.tapped_at.timestamp(),
            },
            status=201,
        )
