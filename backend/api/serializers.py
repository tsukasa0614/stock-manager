from .models import Inventory
from rest_framework import serializers

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']