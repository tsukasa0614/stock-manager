from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Inventory, StockMovement, Stocktaking, Factory, Manager, Warehouse, StorageLocation, StorageArea, Coordinate, SelectionOption

class LoginSerializer(serializers.Serializer):
    id = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        id = data.get('id')
        password = data.get('password')

        if id and password:
            user = authenticate(username=id, password=password)
            if not user:
                raise serializers.ValidationError("無効なログイン情報です")
            if not user.is_active:
                raise serializers.ValidationError("アカウントが無効です")
            data['user'] = user
        else:
            raise serializers.ValidationError("IDとパスワードが必要です")
        
        return data

class ManagerSerializer(serializers.ModelSerializer):
    user_id = serializers.CharField(source='user.id', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    factory_name = serializers.CharField(source='factory.factory_name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = Manager
        fields = '__all__'
        read_only_fields = ['assigned_at', 'created_at', 'updated_at']

class StorageLocationSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.warehouse_name', read_only=True)
    utilization_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = StorageLocation
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class WarehouseSerializer(serializers.ModelSerializer):
    factory_name = serializers.CharField(source='factory.factory_name', read_only=True)
    storage_locations = StorageLocationSerializer(many=True, read_only=True, source='storagelocation_set')
    total_locations = serializers.SerializerMethodField()
    occupied_locations = serializers.SerializerMethodField()
    available_locations = serializers.SerializerMethodField()
    
    class Meta:
        model = Warehouse
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_total_locations(self, obj):
        """総置き場数を取得"""
        return obj.storagelocation_set.count()
    
    def get_occupied_locations(self, obj):
        """使用中の置き場数を取得"""
        return obj.storagelocation_set.filter(status='occupied').count()
    
    def get_available_locations(self, obj):
        """利用可能な置き場数を取得"""
        return obj.storagelocation_set.filter(status='available').count()

class InventorySerializer(serializers.ModelSerializer):
    factory_name = serializers.CharField(source='factory.factory_name', read_only=True)
    
    class Meta:
        model = Inventory
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def to_representation(self, instance):
        """レスポンス時に画像フィールドを絶対URLに変換"""
        data = super().to_representation(instance)
        
        # 画像フィールドを絶対URLに変換
        if data['image']:
            request = self.context.get('request')
            if request:
                data['image'] = request.build_absolute_uri(instance.image.url)
        
        return data
    
    def create(self, validated_data):
        """商品作成時の画像ファイル処理"""
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """商品更新時の画像ファイル処理"""
        # 古い画像ファイルがある場合は削除（オプション）
        # 注意: 本番環境では画像の削除は慎重に行う
        return super().update(instance, validated_data)

class StockMovementSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item_id.product_name', read_only=True)
    item_code = serializers.CharField(source='item_id.item_code', read_only=True)
    user_name = serializers.CharField(source='user_id.username', read_only=True)
    factory_name = serializers.CharField(source='factory_id.factory_name', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class StocktakingSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item_id.product_name', read_only=True)
    item_code = serializers.CharField(source='item_id.item_code', read_only=True)
    user_name = serializers.CharField(source='user_id.username', read_only=True)
    
    class Meta:
        model = Stocktaking
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'difference']

class FactorySerializer(serializers.ModelSerializer):
    managers = ManagerSerializer(many=True, read_only=True, source='manager_set')
    warehouses = WarehouseSerializer(many=True, read_only=True, source='warehouse_set')
    manager_count = serializers.SerializerMethodField()
    warehouse_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Factory
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_manager_count(self, obj):
        """工場の管理者数を取得"""
        return obj.manager_set.filter(is_active=True).count()
    
    def get_warehouse_count(self, obj):
        """工場の倉庫数を取得"""
        return obj.warehouse_set.filter(status='active').count()

# 新しい置き場システム用シリアライザー
class CoordinateSerializer(serializers.ModelSerializer):
    storage_area_name = serializers.CharField(source='storage_area.area_name', read_only=True)
    coordinate_name = serializers.ReadOnlyField()
    position_name = serializers.ReadOnlyField()
    inventory_items = serializers.SerializerMethodField()
    
    class Meta:
        model = Coordinate
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_inventory_items(self, obj):
        """この座標にある在庫アイテムを取得"""
        inventories = obj.inventory_set.all()
        return InventorySerializer(inventories, many=True, context=self.context).data

class StorageAreaSerializer(serializers.ModelSerializer):
    factory_name = serializers.CharField(source='factory.factory_name', read_only=True)
    coordinates = CoordinateSerializer(many=True, read_only=True, source='coordinate_set')
    total_coordinates = serializers.ReadOnlyField()
    occupied_coordinates = serializers.ReadOnlyField()
    available_coordinates = serializers.SerializerMethodField()
    utilization_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = StorageArea
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_available_coordinates(self, obj):
        """利用可能な座標数を取得"""
        return obj.total_coordinates - obj.occupied_coordinates
    
    def get_utilization_rate(self, obj):
        """使用率を計算"""
        if obj.total_coordinates == 0:
            return 0.0
        return (obj.occupied_coordinates / obj.total_coordinates) * 100

# 選択情報管理用シリアライザー
class SelectionOptionSerializer(serializers.ModelSerializer):
    option_type_display = serializers.CharField(source='get_option_type_display', read_only=True)
    
    class Meta:
        model = SelectionOption
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        """バリデーション: 同じ種類内で値の重複をチェック"""
        option_type = data.get('option_type')
        value = data.get('value')
        
        # 更新時は自分自身を除外
        instance = self.instance
        if instance:
            existing = SelectionOption.objects.filter(
                option_type=option_type, 
                value=value
            ).exclude(id=instance.id)
        else:
            existing = SelectionOption.objects.filter(
                option_type=option_type, 
                value=value
            )
        
        if existing.exists():
            raise serializers.ValidationError(
                f"この{instance.get_option_type_display() if instance else '選択肢'}は既に存在します"
            )
        
        return data