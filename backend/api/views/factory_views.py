from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import Factory, Warehouse, StorageLocation, StorageArea, Coordinate, Manager
from ..serializers import (
    FactorySerializer,
    WarehouseSerializer,
    StorageLocationSerializer,
    StorageAreaSerializer
)


class FactoryListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """工場一覧を取得"""
        user = request.user
        
        factories = user.managed_factories
        
        serializer = FactorySerializer(factories, many=True)
        return Response(serializer.data)
    def post(self,request):
        user = request.user
        serializer = FactorySerializer(data=request.data)
        if not user.is_authenticated:
            return Response({"error": "ユーザーが認証されていません"}, status=status.HTTP_401_UNAUTHORIZED)
        
        if serializer.is_valid():
            serializer.save()
            manager = Manager.objects.create(
                user=user,
                factory=serializer.instance,
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WarehouseListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """倉庫一覧を取得"""
        user = request.user
        
        warehouses = Warehouse.objects.filter(factory__in=user.managed_factories)
        
        serializer = WarehouseSerializer(warehouses, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """新しい倉庫を作成"""
        user = request.user
        
        serializer = WarehouseSerializer(data=request.data)
        if serializer.is_valid():
            # 指定された工場がユーザーの管理下にあるかチェック
            factory = serializer.validated_data.get('factory')
            if not user.is_factory_manager(factory):
                return Response({"error": "指定された工場にアクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
            
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WarehouseDetailView(APIView):
    def get(self, request, pk):
        """倉庫詳細を取得"""
        user = request.user
        
        warehouse = get_object_or_404(Warehouse, pk=pk)
        if not user.is_factory_manager(warehouse.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = WarehouseSerializer(warehouse)
        return Response(serializer.data)
    
    def put(self, request, pk):
        """倉庫を更新"""
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
        """倉庫を削除"""
        user = request.user
        
        warehouse = get_object_or_404(Warehouse, pk=pk)
        if not user.is_factory_manager(warehouse.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        
        warehouse.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class StorageLocationListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """置き場一覧を取得"""
        user = request.user
        warehouse_id = request.query_params.get('warehouse_id')
        
        queryset = StorageLocation.objects.filter(warehouse__factory__in=user.managed_factories)
        
        if warehouse_id:
            queryset = queryset.filter(warehouse_id=warehouse_id)
        
        serializer = StorageLocationSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """新しい置き場を作成"""
        user = request.user
        
        serializer = StorageLocationSerializer(data=request.data)
        if serializer.is_valid():
            # 指定された倉庫がユーザーの管理下にあるかチェック
            warehouse = serializer.validated_data.get('warehouse')
            if not user.is_factory_manager(warehouse.factory):
                return Response({"error": "指定された倉庫にアクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
            
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StorageLocationDetailView(APIView):
    def get(self, request, pk):
        """置き場詳細を取得"""
        user = request.user
        
        storage_location = get_object_or_404(StorageLocation, pk=pk)
        if not user.is_factory_manager(storage_location.warehouse.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = StorageLocationSerializer(storage_location)
        return Response(serializer.data)
    
    def put(self, request, pk):
        """置き場を更新"""
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
        """置き場を削除"""
        user = request.user
        
        storage_location = get_object_or_404(StorageLocation, pk=pk)
        if not user.is_factory_manager(storage_location.warehouse.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        
        storage_location.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
# 新しい置き場システム用API
class StorageAreaListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """置き場一覧を取得"""
        user = request.user
        factory_id = request.query_params.get('factory_id')
        
        queryset = StorageArea.objects.filter(factory__in=user.managed_factories)
        
        if factory_id:
            queryset = queryset.filter(factory_id=factory_id)
        
        serializer = StorageAreaSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """新しい置き場を作成"""
        user = request.user
        
        serializer = StorageAreaSerializer(data=request.data)
        if serializer.is_valid():
            # 指定された工場がユーザーの管理下にあるかチェック
            factory = serializer.validated_data.get('factory')
            if not user.is_factory_manager(factory):
                return Response({"error": "指定された工場にアクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
            
            # 置き場を保存
            storage_area = serializer.save()
            
            # 座標を自動生成
            coordinates = []
            for x in range(1, storage_area.width + 1):
                for y in range(1, storage_area.height + 1):
                    coordinate = Coordinate.objects.create(
                        storage_area=storage_area,
                        x_position=x,
                        y_position=y
                    )
                    coordinates.append(coordinate)
            
            # レスポンス用に座標も含めて返す
            result_serializer = StorageAreaSerializer(storage_area)
            return Response(result_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StorageAreaDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        """置き場詳細を取得"""
        user = request.user
        storage_area = get_object_or_404(StorageArea, pk=pk)
        
        if not user.is_factory_manager(storage_area.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = StorageAreaSerializer(storage_area)
        return Response(serializer.data)
    
    def put(self, request, pk):
        """置き場を更新"""
        user = request.user
        storage_area = get_object_or_404(StorageArea, pk=pk)
        
        if not user.is_factory_manager(storage_area.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = StorageAreaSerializer(storage_area, data=request.data, partial=True)
        if serializer.is_valid():
            # サイズが変更された場合は座標を再生成
            old_width = storage_area.width
            old_height = storage_area.height
            
            storage_area = serializer.save()
            
            if old_width != storage_area.width or old_height != storage_area.height:
                # 既存の座標を削除して再生成
                storage_area.coordinate_set.all().delete()
                for x in range(1, storage_area.width + 1):
                    for y in range(1, storage_area.height + 1):
                        Coordinate.objects.create(
                            storage_area=storage_area,
                            x_position=x,
                            y_position=y
                        )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """置き場を削除"""
        user = request.user
        
        storage_area = get_object_or_404(StorageArea, pk=pk)
        if not user.is_factory_manager(storage_area.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        
        storage_area.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)