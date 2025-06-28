from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Inventory
from .serializers import InventorySerializer

@api_view(['GET'])
def health_check(request):
    return Response({"status": "healthy"})

class InventoryListView(APIView):
    def get(self, request):
        #TODO Userが参加している工場の在庫のみ表示する
        inventories=Inventory.objects.all()
        serializer=InventorySerializer(inventories,many=True)
        return Response(serializer.data)