from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from ..models import Coordinate
from ..serializers import CoordinateSerializer


class CoordinateListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        storage_area_id = request.query_params.get('storage_area_id')

        queryset = Coordinate.objects.filter(storage_area__factory__in=user.managed_factories)
        if storage_area_id:
            queryset = queryset.filter(storage_area_id=storage_area_id)

        serializer = CoordinateSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)


class CoordinateDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user = request.user
        coordinate = get_object_or_404(Coordinate, pk=pk)
        if not user.is_factory_manager(coordinate.storage_area.factory):
            return Response({"error": "アクセス権限がありません"}, status=403)
        serializer = CoordinateSerializer(coordinate, context={'request': request})
        return Response(serializer.data)


