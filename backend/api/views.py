from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Inventory, Factory, StockMovement, Stocktaking
from .serializers import InventorySerializer, StockMovementSerializer, StocktakingSerializer, FactorySerializer

@api_view(['GET'])
def health_check(request):
    return Response({"status": "healthy"})

class InventoryListView(APIView):
    def get(self, request):
        """在庫一覧を取得"""
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "認証が必要です"}, status=status.HTTP_401_UNAUTHORIZED)
        
        inventories = Inventory.objects.filter(factory__in=user.factories.all())
        serializer = InventorySerializer(inventories, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """新しい在庫を作成"""
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "認証が必要です"}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = InventorySerializer(data=request.data)
        if serializer.is_valid():
            # 指定された工場がユーザーの管理下にあるかチェック
            factory = serializer.validated_data.get('factory')
            if factory not in user.factories.all():
                return Response({"error": "指定された工場にアクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
            
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InventoryDetailView(APIView):
    def get(self, request, item_code):
        """特定の在庫を取得"""
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "認証が必要です"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            inventory = Inventory.objects.get(item_code=item_code, factory__in=user.factories.all())
            serializer = InventorySerializer(inventory)
            return Response(serializer.data)
        except Inventory.DoesNotExist:
            return Response({"error": "在庫が見つかりません"}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, item_code):
        """在庫を更新"""
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "認証が必要です"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            inventory = Inventory.objects.get(item_code=item_code, factory__in=user.factories.all())
        except Inventory.DoesNotExist:
            return Response({"error": "在庫が見つかりません"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = InventorySerializer(inventory, data=request.data, partial=True)
        if serializer.is_valid():
            # 工場が変更される場合、新しい工場へのアクセス権限をチェック
            if 'factory' in serializer.validated_data:
                factory = serializer.validated_data['factory']
                if factory not in user.factories.all():
                    return Response({"error": "指定された工場にアクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
            
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, item_code):
        """在庫を削除"""
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "認証が必要です"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            inventory = Inventory.objects.get(item_code=item_code, factory__in=user.factories.all())
            inventory.delete()
            return Response({"message": "在庫が正常に削除されました"}, status=status.HTTP_204_NO_CONTENT)
        except Inventory.DoesNotExist:
            return Response({"error": "在庫が見つかりません"}, status=status.HTTP_404_NOT_FOUND)

class StockMovementListView(APIView):
    def get(self, request):
        """在庫移動履歴を取得"""
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "認証が必要です"}, status=status.HTTP_401_UNAUTHORIZED)
        
        movements = StockMovement.objects.filter(
            factory_id__in=user.factories.all()
        ).order_by('-created_at')
        
        # フィルタリング
        item_code = request.GET.get('item_code')
        movement_type = request.GET.get('movement_type')
        
        if item_code:
            movements = movements.filter(item_id__item_code=item_code)
        if movement_type:
            movements = movements.filter(movement_type=movement_type)
        
        serializer = StockMovementSerializer(movements, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """在庫移動を作成（入出庫処理）"""
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "認証が必要です"}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = StockMovementSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                # 指定された工場がユーザーの管理下にあるかチェック
                factory = serializer.validated_data.get('factory_id')
                if factory not in user.factories.all():
                    return Response({"error": "指定された工場にアクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
                
                # 在庫の存在確認
                inventory = serializer.validated_data.get('item_id')
                if inventory.factory != factory:
                    return Response({"error": "在庫と工場が一致しません"}, status=status.HTTP_400_BAD_REQUEST)
                
                movement_type = serializer.validated_data.get('movement_type')
                quantity = serializer.validated_data.get('quantity')
                
                # 出庫の場合は在庫数量をチェック
                if movement_type == 'out' and inventory.stock_quantity < quantity:
                    return Response({"error": "在庫数量が不足しています"}, status=status.HTTP_400_BAD_REQUEST)
                
                # 在庫移動を保存
                movement = serializer.save(user_id=user)
                
                # 在庫数量を更新
                if movement_type == 'in':
                    inventory.stock_quantity += quantity
                else:  # 'out'
                    inventory.stock_quantity -= quantity
                
                inventory.save()
                
                return Response(StockMovementSerializer(movement).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StocktakingListView(APIView):
    def get(self, request):
        """棚卸履歴を取得"""
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "認証が必要です"}, status=status.HTTP_401_UNAUTHORIZED)
        
        stocktakings = Stocktaking.objects.filter(
            item_id__factory__in=user.factories.all()
        ).order_by('-created_at')
        
        serializer = StocktakingSerializer(stocktakings, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """棚卸を作成"""
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "認証が必要です"}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = StocktakingSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                # 在庫の存在確認とアクセス権限チェック
                inventory = serializer.validated_data.get('item_id')
                if inventory.factory not in user.factories.all():
                    return Response({"error": "指定された在庫にアクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
                
                # 差異を計算
                theoretical_stock = serializer.validated_data.get('theoretical_stock')
                actual_stock = serializer.validated_data.get('actual_stock')
                difference = actual_stock - theoretical_stock
                
                # 棚卸を保存
                stocktaking = serializer.save(
                    user_id=user,
                    difference=difference
                )
                
                return Response(StocktakingSerializer(stocktaking).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FactoryListView(APIView):
    def get(self, request):
        """工場一覧を取得"""
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "認証が必要です"}, status=status.HTTP_401_UNAUTHORIZED)
        
        factories = user.factories.all()
        serializer = FactorySerializer(factories, many=True)
        return Response(serializer.data)