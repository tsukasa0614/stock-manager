from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from ..models import Manager
from ..serializers import FactorySerializer


class FactoryListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        factories = user.managed_factories
        serializer = FactorySerializer(factories, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        serializer = FactorySerializer(data=request.data)
        if not user.is_authenticated:
            return Response({"error": "ユーザーが認証されていません"}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_staff:
            return Response({"error": "管理者権限が必要です"}, status=status.HTTP_403_FORBIDDEN)
        if serializer.is_valid():
            serializer.save()
            Manager.objects.create(
                user=user,
                factory=serializer.instance,
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


