from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from ..models import Manager
from ..serializers import ManagerSerializer


class ManagerListView(APIView):
    """工場管理者一覧・作成API"""

    def get(self, request):
        """工場管理者一覧を取得"""
        user = request.user

        if user.is_superuser:
            managers = Manager.objects.filter(is_active=True)
        else:
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
            return Response({'error': '管理者権限が必要です'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ManagerSerializer(data=request.data)
        if serializer.is_valid():
            factory = serializer.validated_data.get('factory')
            if not user.is_superuser and not user.is_factory_manager(factory):
                return Response({'error': '指定された工場への権限がありません'}, status=status.HTTP_403_FORBIDDEN)

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ManagerDetailView(APIView):
    """工場管理者詳細・更新・削除API"""

    def get(self, request, pk):
        user = request.user

        try:
            manager = Manager.objects.get(pk=pk, is_active=True)
            if not user.is_superuser and not user.is_factory_manager(manager.factory):
                return Response({'error': 'アクセス権限がありません'}, status=status.HTTP_403_FORBIDDEN)
            serializer = ManagerSerializer(manager)
            return Response(serializer.data)
        except Manager.DoesNotExist:
            return Response({'error': '管理者が見つかりません'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        user = request.user
        try:
            manager = Manager.objects.get(pk=pk, is_active=True)
            if not user.is_superuser and not user.is_factory_manager(manager.factory):
                return Response({'error': 'アクセス権限がありません'}, status=status.HTTP_403_FORBIDDEN)
            serializer = ManagerSerializer(manager, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Manager.DoesNotExist:
            return Response({'error': '管理者が見つかりません'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        user = request.user
        try:
            manager = Manager.objects.get(pk=pk, is_active=True)
            if not user.is_superuser and not user.is_factory_manager(manager.factory):
                return Response({'error': 'アクセス権限がありません'}, status=status.HTTP_403_FORBIDDEN)
            manager.is_active = False
            manager.save()
            return Response({'message': '管理者を無効化しました'}, status=status.HTTP_204_NO_CONTENT)
        except Manager.DoesNotExist:
            return Response({'error': '管理者が見つかりません'}, status=status.HTTP_404_NOT_FOUND)


