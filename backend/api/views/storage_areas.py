from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from ..models import StorageArea, Coordinate
from ..serializers import StorageAreaSerializer


class StorageAreaListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        factory_id = request.query_params.get('factory_id')
        queryset = StorageArea.objects.filter(factory__in=user.managed_factories)
        if factory_id:
            queryset = queryset.filter(factory_id=factory_id)
        serializer = StorageAreaSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        user = request.user
        serializer = StorageAreaSerializer(data=request.data)
        if serializer.is_valid():
            factory = serializer.validated_data.get('factory')
            if not user.is_factory_manager(factory):
                return Response({"error": "指定された工場にアクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
            storage_area = serializer.save()
            for x in range(1, storage_area.width + 1):
                for y in range(1, storage_area.height + 1):
                    Coordinate.objects.create(
                        storage_area=storage_area,
                        x_position=x,
                        y_position=y,
                    )
            result_serializer = StorageAreaSerializer(storage_area)
            return Response(result_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StorageAreaDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        user = request.user
        storage_area = get_object_or_404(StorageArea, pk=pk)
        if not user.is_factory_manager(storage_area.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        serializer = StorageAreaSerializer(storage_area)
        return Response(serializer.data)
    
    def put(self, request, pk):
        user = request.user
        storage_area = get_object_or_404(StorageArea, pk=pk)
        if not user.is_factory_manager(storage_area.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        serializer = StorageAreaSerializer(storage_area, data=request.data, partial=True)
        if serializer.is_valid():
            old_width = storage_area.width
            old_height = storage_area.height
            storage_area = serializer.save()
            if old_width != storage_area.width or old_height != storage_area.height:
                storage_area.coordinate_set.all().delete()
                for x in range(1, storage_area.width + 1):
                    for y in range(1, storage_area.height + 1):
                        Coordinate.objects.create(
                            storage_area=storage_area,
                            x_position=x,
                            y_position=y,
                        )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        user = request.user
        storage_area = get_object_or_404(StorageArea, pk=pk)
        if not user.is_factory_manager(storage_area.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        storage_area.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


