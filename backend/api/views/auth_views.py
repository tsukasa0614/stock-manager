from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.authtoken.models import Token

from ..serializers import LoginSerializer
from ..models import Manager

class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

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
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

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
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

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