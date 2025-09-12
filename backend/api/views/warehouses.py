from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from ..models import Warehouse
from ..serializers import WarehouseSerializer


class WarehouseListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        warehouses = Warehouse.objects.filter(factory__in=user.managed_factories)
        serializer = WarehouseSerializer(warehouses, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        user = request.user
        serializer = WarehouseSerializer(data=request.data)
        if serializer.is_valid():
            factory = serializer.validated_data.get('factory')
            if not user.is_factory_manager(factory):
                return Response({"error": "指定された工場にアクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WarehouseDetailView(APIView):
    def get(self, request, pk):
        user = request.user
        warehouse = get_object_or_404(Warehouse, pk=pk)
        if not user.is_factory_manager(warehouse.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        serializer = WarehouseSerializer(warehouse)
        return Response(serializer.data)
    
    def put(self, request, pk):
        user = request.user
        warehouse = get_object_or_404(Warehouse, pk=pk)
        if not user.is_factory_manager(warehouse.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        serializer = WarehouseSerializer(warehouse, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        user = request.user
        warehouse = get_object_or_404(Warehouse, pk=pk)
        if not user.is_factory_manager(warehouse.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        warehouse.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


