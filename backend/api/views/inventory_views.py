from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from ..models import Inventory
from ..serializers import InventorySerializer


class InventoryListView(APIView):
    def get(self, request):
        user = request.user
        inventories = Inventory.objects.filter(factory__in=user.managed_factories)
        serializer = InventorySerializer(inventories, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        serializer = InventorySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            factory = serializer.validated_data.get('factory')
            if not user.is_factory_manager(factory):
                return Response({"error": "指定された工場にアクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InventoryDetailView(APIView):
    def get(self, request, item_code):
        user = request.user
        try:
            inventory = Inventory.objects.get(item_code=item_code, factory__in=user.managed_factories)
            serializer = InventorySerializer(inventory, context={'request': request})
            return Response(serializer.data)
        except Inventory.DoesNotExist:
            return Response({"error": "在庫が見つかりません"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, item_code):
        user = request.user
        try:
            inventory = Inventory.objects.get(item_code=item_code, factory__in=user.managed_factories)
        except Inventory.DoesNotExist:
            return Response({"error": "在庫が見つかりません"}, status=status.HTTP_404_NOT_FOUND)

        serializer = InventorySerializer(inventory, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            if 'factory' in serializer.validated_data:
                factory = serializer.validated_data['factory']
                if not user.is_factory_manager(factory):
                    return Response({"error": "指定された工場にアクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, item_code):
        user = request.user
        try:
            inventory = Inventory.objects.get(item_code=item_code, factory__in=user.managed_factories)
            inventory.delete()
            return Response({"message": "在庫が正常に削除されました"}, status=status.HTTP_204_NO_CONTENT)
        except Inventory.DoesNotExist:
            return Response({"error": "在庫が見つかりません"}, status=status.HTTP_404_NOT_FOUND)


