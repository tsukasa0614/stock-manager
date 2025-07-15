from .models import Inventory, StockMovement, Stocktaking, Factory, Manager
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

class ManagerSerializer(serializers.ModelSerializer):
    user_id = serializers.CharField(source='user.id', read_only=True)
    user_name = serializers.CharField(source='user.id', read_only=True)  # usernameではなくidを使用
    factory_name = serializers.CharField(source='factory.factory_name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = Manager
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'assigned_at']
        
    def validate(self, attrs):
        # 同じユーザーが同じ工場を重複して管理しないようにチェック
        user = attrs.get('user')
        factory = attrs.get('factory')
        
        if user and factory:
            # 更新の場合は現在のインスタンスを除外
            queryset = Manager.objects.filter(user=user, factory=factory)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError("このユーザーは既にこの工場の管理者として登録されています")
        
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
    managers = ManagerSerializer(many=True, read_only=True, source='manager_set')
    manager_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Factory
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_manager_count(self, obj):
        """工場の管理者数を取得"""
        return obj.manager_set.filter(is_active=True).count()