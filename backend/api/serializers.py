from .models import Inventory, StockMovement, Stocktaking, Factory
from rest_framework import serializers
from django.contrib.auth import authenticate

class LoginSerializer(serializers.Serializer):
    id = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        id = attrs.get('id')
        password = attrs.get('password')
        
        if not id or not password:
            raise serializers.ValidationError("IDとパスワードは必須です")
        
        user = authenticate(username=id, password=password)
        
        if not user:
            raise serializers.ValidationError("IDまたはパスワードが間違っています")
        
        attrs['user'] = user
        return attrs




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
    factory_name = serializers.CharField(source='factory_id.factory_name', read_only=True)
    user_name = serializers.CharField(source='user_id.id', read_only=True)  # usernameではなくidを使用
    
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