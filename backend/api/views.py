from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Inventory, Factory, StockMovement, Stocktaking, Manager
from .serializers import InventorySerializer, StockMovementSerializer, StocktakingSerializer, FactorySerializer, LoginSerializer, ManagerSerializer
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            
            # ユーザーの管理工場を取得
            managed_factories = user.managed_factories.all()
            factories_data = []
            for factory in managed_factories:
                manager = Manager.objects.get(user=user, factory=factory, is_active=True)
                factories_data.append({
                    'id': factory.id,
                    'name': factory.factory_name,
                    'role': manager.role,
                    'permissions': manager.permissions
                })
            
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'role': 'admin' if user.is_staff else 'user',
                    'managed_factories': factories_data
                }
            })
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminLoginView(APIView):
    """管理者専用ログイン"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # 管理者権限をチェック
            if not user.is_staff:
                return Response({
                    'error': 'このアカウントは管理者権限がありません'
                }, status=status.HTTP_403_FORBIDDEN)
            
            token, created = Token.objects.get_or_create(user=user)
            
            # 管理者の工場管理情報を取得
            managed_factories = user.managed_factories.all()
            factories_data = []
            for factory in managed_factories:
                manager = Manager.objects.get(user=user, factory=factory, is_active=True)
                factories_data.append({
                    'id': factory.id,
                    'name': factory.factory_name,
                    'role': manager.role,
                    'permissions': manager.permissions
                })
            
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'role': 'admin',
                    'managed_factories': factories_data
                },
                'admin_features': {
                    'can_manage_users': user.is_superuser,
                    'can_manage_factories': user.is_staff,
                    'can_manage_inventory': True,
                    'can_view_reports': True
                }
            })
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    """一般ユーザー専用ログイン"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # 一般ユーザーが管理者でないことを確認
            if user.is_staff:
                return Response({
                    'error': 'このアカウントは管理者用のログインを使用してください'
                }, status=status.HTTP_403_FORBIDDEN)
            
            token, created = Token.objects.get_or_create(user=user)
            
            # 一般ユーザーの工場管理情報を取得
            managed_factories = user.managed_factories.all()
            factories_data = []
            for factory in managed_factories:
                manager = Manager.objects.get(user=user, factory=factory, is_active=True)
                factories_data.append({
                    'id': factory.id,
                    'name': factory.factory_name,
                    'role': manager.role,
                    'permissions': manager.permissions
                })
            
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'role': 'user',
                    'managed_factories': factories_data
                },
                'user_features': {
                    'can_manage_inventory': any(f['permissions'].get('inventory', False) for f in factories_data),
                    'can_do_stocktaking': any(f['permissions'].get('stocktaking', False) for f in factories_data),
                    'can_view_reports': any(f['permissions'].get('reports', False) for f in factories_data)
                }
            })
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ManagerListView(APIView):
    """工場管理者一覧・作成API"""
    
    def get(self, request):
        """工場管理者一覧を取得"""
        user = request.user
        
        if user.is_superuser:
            # スーパーユーザーは全ての管理者情報を取得
            managers = Manager.objects.filter(is_active=True)
        else:
            # 一般管理者は自分の管理工場の管理者のみ取得
            managers = Manager.objects.filter(
                factory__in=user.managed_factories,
                is_active=True
            )
        
        serializer = ManagerSerializer(managers, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """新しい工場管理者を作成"""
        user = request.user
        
        if not user.is_staff:
            return Response({
                'error': '管理者権限が必要です'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ManagerSerializer(data=request.data)
        if serializer.is_valid():
            # 工場への権限をチェック
            factory = serializer.validated_data.get('factory')
            if not user.is_superuser and not user.is_factory_manager(factory):
                return Response({
                    'error': '指定された工場への権限がありません'
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ManagerDetailView(APIView):
    """工場管理者詳細・更新・削除API"""
    
    def get(self, request, pk):
        """特定の工場管理者を取得"""
        user = request.user
        
        try:
            manager = Manager.objects.get(pk=pk, is_active=True)
            
            # 権限チェック
            if not user.is_superuser and not user.is_factory_manager(manager.factory):
                return Response({
                    'error': 'アクセス権限がありません'
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = ManagerSerializer(manager)
            return Response(serializer.data)
        except Manager.DoesNotExist:
            return Response({'error': '管理者が見つかりません'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, pk):
        """工場管理者情報を更新"""
        user = request.user
        
        try:
            manager = Manager.objects.get(pk=pk, is_active=True)
            
            # 権限チェック
            if not user.is_superuser and not user.is_factory_manager(manager.factory):
                return Response({
                    'error': 'アクセス権限がありません'
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = ManagerSerializer(manager, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Manager.DoesNotExist:
            return Response({'error': '管理者が見つかりません'}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        """工場管理者を無効化（物理削除ではなく論理削除）"""
        user = request.user
        
        try:
            manager = Manager.objects.get(pk=pk, is_active=True)
            
            # 権限チェック
            if not user.is_superuser and not user.is_factory_manager(manager.factory):
                return Response({
                    'error': 'アクセス権限がありません'
                }, status=status.HTTP_403_FORBIDDEN)
            
            manager.is_active = False
            manager.save()
            return Response({'message': '管理者を無効化しました'}, status=status.HTTP_204_NO_CONTENT)
        except Manager.DoesNotExist:
            return Response({'error': '管理者が見つかりません'}, status=status.HTTP_404_NOT_FOUND)

class InventoryListView(APIView):
    def get(self, request):
        """在庫一覧を取得"""
        user = request.user

        inventories = Inventory.objects.filter(factory__in=user.managed_factories)
        # リクエストコンテキストを渡して画像URLが正しく生成されるようにする
        serializer = InventorySerializer(inventories, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request):
        """新しい在庫を作成（画像ファイルアップロード対応）"""
        user = request.user
        
        # リクエストコンテキストを渡してシリアライザーを作成
        serializer = InventorySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # 指定された工場がユーザーの管理下にあるかチェック
            factory = serializer.validated_data.get('factory')
            if not user.is_factory_manager(factory):
                return Response({"error": "指定された工場にアクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
            
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InventoryDetailView(APIView):
    def get(self, request, item_code):
        """特定の在庫を取得"""
        user = request.user
        
        try:
            inventory = Inventory.objects.get(item_code=item_code, factory__in=user.managed_factories)
            # リクエストコンテキストを渡して画像URLが正しく生成されるようにする
            serializer = InventorySerializer(inventory, context={'request': request})
            return Response(serializer.data)
        except Inventory.DoesNotExist:
            return Response({"error": "在庫が見つかりません"}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, item_code):
        """在庫を更新（画像ファイルアップロード対応）"""
        user = request.user
        
        # 開発用: 認証されていない場合はテストユーザーとして扱う
        if not user.is_authenticated:
            from .models import Account
            try:
                user = Account.objects.get(id="test_admin")
            except Account.DoesNotExist:
                return Response({"error": "テストユーザーが見つかりません"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        try:
            inventory = Inventory.objects.get(item_code=item_code, factory__in=user.managed_factories)
        except Inventory.DoesNotExist:
            return Response({"error": "在庫が見つかりません"}, status=status.HTTP_404_NOT_FOUND)
        
        # リクエストコンテキストを渡してシリアライザーを作成
        serializer = InventorySerializer(inventory, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            # 工場が変更される場合、新しい工場へのアクセス権限をチェック
            if 'factory' in serializer.validated_data:
                factory = serializer.validated_data['factory']
                if not user.is_factory_manager(factory):
                    return Response({"error": "指定された工場にアクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)
            
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, item_code):
        """在庫を削除"""
        user = request.user
        
        # 開発用: 認証されていない場合はテストユーザーとして扱う
        if not user.is_authenticated:
            from .models import Account
            try:
                user = Account.objects.get(id="test_admin")
            except Account.DoesNotExist:
                return Response({"error": "テストユーザーが見つかりません"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        try:
            inventory = Inventory.objects.get(item_code=item_code, factory__in=user.managed_factories)
            inventory.delete()
            return Response({"message": "在庫が正常に削除されました"}, status=status.HTTP_204_NO_CONTENT)
        except Inventory.DoesNotExist:
            return Response({"error": "在庫が見つかりません"}, status=status.HTTP_404_NOT_FOUND)

class StockMovementListView(APIView):
    def get(self, request):
        """在庫移動履歴を取得"""
        user = request.user
        
        movements = StockMovement.objects.filter(
            factory_id__in=user.managed_factories
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
        
        serializer = StockMovementSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                # 指定された工場がユーザーの管理下にあるかチェック
                factory = serializer.validated_data.get('factory_id')
                if not user.is_factory_manager(factory):
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
        
        stocktakings = Stocktaking.objects.filter(
            item_id__factory__in=user.managed_factories
        ).order_by('-created_at')
        
        serializer = StocktakingSerializer(stocktakings, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """棚卸を作成"""
        user = request.user
        
        serializer = StocktakingSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                # 在庫の存在確認とアクセス権限チェック
                inventory = serializer.validated_data.get('item_id')
                if not user.is_factory_manager(inventory.factory):
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
        
        factories = user.managed_factories
        serializer = FactorySerializer(factories, many=True)
        return Response(serializer.data)