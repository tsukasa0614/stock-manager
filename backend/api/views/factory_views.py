from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import Factory, Warehouse, StorageLocation, StorageArea, Coordinate
from ..serializers import (
    FactorySerializer,
    WarehouseSerializer,
    StorageLocationSerializer,
    StorageAreaSerializer
)






class FactoryListView(APIView):
    permission_classes = [AllowAny]  # 開発用: 認証を無効化
    
    def get(self, request):
        """工場一覧を取得"""
        user = request.user
        
        print(f"FactoryListView - ユーザー認証状態: {user.is_authenticated}")
        print(f"FactoryListView - ユーザー: {user}")
        
        # 開発用: 認証されていない場合は全ての工場を返す
        if not user.is_authenticated:
            factories = Factory.objects.all()
            print(f"FactoryListView - 認証なし: {factories.count()}件の工場を返す")
        else:
            factories = user.managed_factories
            print(f"FactoryListView - 認証あり: {factories.count()}件の工場を返す")
        
        serializer = FactorySerializer(factories, many=True)
        print(f"FactoryListView - シリアライズ結果: {len(serializer.data)}件")
        return Response(serializer.data)

class WarehouseListView(APIView):
    permission_classes = [AllowAny]  # 開発用: 認証を無効化
    
    def get(self, request):
        """倉庫一覧を取得"""
        user = request.user
        
        print(f"WarehouseListView - ユーザー認証状態: {user.is_authenticated}")
        print(f"WarehouseListView - ユーザー: {user}")
        
        # 開発用: 認証されていない場合は全ての保管エリアを返す
        if not user.is_authenticated:
            warehouses = Warehouse.objects.all()
            print(f"WarehouseListView - 認証なし: {warehouses.count()}件の保管エリアを返す")
        else:
            warehouses = Warehouse.objects.filter(factory__in=user.managed_factories)
            print(f"WarehouseListView - 認証あり: {warehouses.count()}件の保管エリアを返す")
        
        serializer = WarehouseSerializer(warehouses, many=True)
        print(f"WarehouseListView - シリアライズ結果: {len(serializer.data)}件")
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
    permission_classes = [AllowAny]  # 開発用: 認証を無効化
    
    def get(self, request):
        """置き場一覧を取得"""
        user = request.user
        warehouse_id = request.query_params.get('warehouse_id')
        
        # 開発用: 認証されていない場合は全ての置き場を返す
        if not user.is_authenticated:
            queryset = StorageLocation.objects.all()
        else:
            queryset = StorageLocation.objects.filter(warehouse__factory__in=user.managed_factories)
        
        if warehouse_id:
            queryset = queryset.filter(warehouse_id=warehouse_id)
        
        serializer = StorageLocationSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """新しい置き場を作成"""
        user = request.user
        
        # 開発用: 認証されていない場合はテストユーザーとして扱う
        if not user.is_authenticated:
            from ..models import Account
            try:
                user = Account.objects.get(id="test_admin")
            except Account.DoesNotExist:
                return Response({"error": "テストユーザーが見つかりません"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
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
        
        # 開発用: 認証されていない場合はテストユーザーとして扱う
        if not user.is_authenticated:
            from ..models import Account
            try:
                user = Account.objects.get(id="test_admin")
            except Account.DoesNotExist:
                return Response({"error": "テストユーザーが見つかりません"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
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
        
        # 開発用: 認証されていない場合はテストユーザーとして扱う
        if not user.is_authenticated:
            from ..models import Account
            try:
                user = Account.objects.get(id="test_admin")
            except Account.DoesNotExist:
                return Response({"error": "テストユーザーが見つかりません"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        storage_location = get_object_or_404(StorageLocation, pk=pk)
        if not user.is_factory_manager(storage_location.warehouse.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        
        storage_location.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
# 新しい置き場システム用API
class StorageAreaListView(APIView):
    permission_classes = [AllowAny]  # テスト用
    
    def get(self, request):
        """置き場一覧を取得"""
        user = request.user
        factory_id = request.query_params.get('factory_id')
        
        # テスト用: 認証されていない場合は全ての置き場を返す
        if not user.is_authenticated:
            queryset = StorageArea.objects.all()
        else:
            queryset = StorageArea.objects.filter(factory__in=user.managed_factories)
        
        if factory_id:
            queryset = queryset.filter(factory_id=factory_id)
        
        serializer = StorageAreaSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """新しい置き場を作成"""
        user = request.user
        
        # 開発用: 認証されていない場合はテストユーザーとして扱う
        if not user.is_authenticated:
            from ..models import Account
            try:
                user = Account.objects.get(id="test_admin")
            except Account.DoesNotExist:
                return Response({"error": "テストユーザーが見つかりません"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
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
    permission_classes = [AllowAny]  # テスト用
    
    def get(self, request, pk):
        """置き場詳細を取得"""
        user = request.user
        storage_area = get_object_or_404(StorageArea, pk=pk)
        
        # テスト用: 認証されていない場合は権限チェックをスキップ
        if user.is_authenticated and not user.is_factory_manager(storage_area.factory):
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
        
        # 開発用: 認証されていない場合はテストユーザーとして扱う
        if not user.is_authenticated:
            from ..models import Account
            try:
                user = Account.objects.get(id="test_admin")
            except Account.DoesNotExist:
                return Response({"error": "テストユーザーが見つかりません"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        storage_area = get_object_or_404(StorageArea, pk=pk)
        if not user.is_factory_manager(storage_area.factory):
            return Response({"error": "アクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
        
        storage_area.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)