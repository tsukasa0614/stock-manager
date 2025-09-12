from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from ..models import StorageLocation
from ..serializers import StorageLocationSerializer


class StorageLocationListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        warehouse_id = request.query_params.get('warehouse_id')
        queryset = StorageLocation.objects.filter(warehouse__factory__in=user.managed_factories)
        if warehouse_id:
            queryset = queryset.filter(warehouse_id=warehouse_id)
        serializer = StorageLocationSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        user = request.user
        serializer = StorageLocationSerializer(data=request.data)
        if serializer.is_valid():
            warehouse = serializer.validated_data.get('warehouse')
            if not user.is_factory_manager(warehouse.factory):
                return Response({"error": "指定された倉庫にアクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StorageLocationDetailView(APIView):
    def get(self, request, pk):
        user = request.user
        storage_location = get_object_or_404(StorageLocation, pk=pk)
        if not user.is_factory_manager(storage_location.warehouse.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        serializer = StorageLocationSerializer(storage_location)
        return Response(serializer.data)
    
    def put(self, request, pk):
        user = request.user
        storage_location = get_object_or_404(StorageLocation, pk=pk)
        if not user.is_factory_manager(storage_location.warehouse.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        serializer = StorageLocationSerializer(storage_location, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        user = request.user
        storage_location = get_object_or_404(StorageLocation, pk=pk)
        if not user.is_factory_manager(storage_location.warehouse.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        storage_location.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


