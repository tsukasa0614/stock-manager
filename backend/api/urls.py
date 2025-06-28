from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('inventories/', views.InventoryListView.as_view(), name='inventory_list'),
] 
