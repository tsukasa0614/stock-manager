from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction

from ..models import StockMovement, Stocktaking
from ..serializers import StockMovementSerializer, StocktakingSerializer


class StockMovementListView(APIView):
    def get(self, request):
        user = request.user
        movements = StockMovement.objects.filter(
            factory_id__in=user.managed_factories
        ).order_by('-created_at')

        item_code = request.GET.get('item_code')
        movement_type = request.GET.get('movement_type')
        if item_code:
            movements = movements.filter(item_id__item_code=item_code)
        if movement_type:
            movements = movements.filter(movement_type=movement_type)

        serializer = StockMovementSerializer(movements, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        serializer = StockMovementSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                factory = serializer.validated_data.get('factory_id')
                if not user.is_factory_manager(factory):
                    return Response({"error": "指定された工場にアクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)

                inventory = serializer.validated_data.get('item_id')
                if inventory.factory != factory:
                    return Response({"error": "在庫と工場が一致しません"}, status=status.HTTP_400_BAD_REQUEST)

                movement_type = serializer.validated_data.get('movement_type')
                quantity = serializer.validated_data.get('quantity')
                if movement_type == 'out' and inventory.stock_quantity < quantity:
                    return Response({"error": "在庫数量が不足しています"}, status=status.HTTP_400_BAD_REQUEST)

                movement = serializer.save(user_id=user)

                if movement_type == 'in':
                    inventory.stock_quantity += quantity
                else:
                    inventory.stock_quantity -= quantity
                inventory.save()

                return Response(StockMovementSerializer(movement).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StocktakingListView(APIView):
    def get(self, request):
        user = request.user
        stocktakings = Stocktaking.objects.filter(
            item_id__factory__in=user.managed_factories
        ).order_by('-created_at')
        serializer = StocktakingSerializer(stocktakings, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        serializer = StocktakingSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                inventory = serializer.validated_data.get('item_id')
                if not user.is_factory_manager(inventory.factory):
                    return Response({"error": "指定された在庫にアクセス権限がありません"}, status=status.HTTP_403_FORBIDDEN)

                theoretical_stock = serializer.validated_data.get('theoretical_stock')
                actual_stock = serializer.validated_data.get('actual_stock')
                difference = actual_stock - theoretical_stock

                stocktaking = serializer.save(user_id=user, difference=difference)
                return Response(StocktakingSerializer(stocktaking).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


