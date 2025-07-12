from .models import Inventory, StockMovement, Stocktaking, Factory
from rest_framework import serializers

class InventorySerializer(serializers.ModelSerializer):
    factory_name = serializers.CharField(source='factory.factory_name', read_only=True)
    
    class Meta:
        model = Inventory
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class StockMovementSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item_id.product_name', read_only=True)
    item_code = serializers.CharField(source='item_id.item_code', read_only=True)
    factory_name = serializers.CharField(source='factory_id.factory_name', read_only=True)
    user_name = serializers.CharField(source='user_id.username', read_only=True)
    
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
        read_only_fields = ['created_at', 'updated_at']

class FactorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Factory
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']