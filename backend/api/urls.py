from django.urls import path
from . import views

urlpatterns = [
    # 認証
    path('login/', views.LoginView.as_view(), name='login'),
    
    # 在庫管理
    path('inventories/', views.InventoryListView.as_view(), name='inventory_list'),
    path('inventories/<str:item_code>/', views.InventoryDetailView.as_view(), name='inventory_detail'),
    
    # 在庫移動（入出庫）
    path('stock-movements/', views.StockMovementListView.as_view(), name='stock_movement_list'),
    
    # 棚卸
    path('stocktakings/', views.StocktakingListView.as_view(), name='stocktaking_list'),
    
    # 工場
    path('factories/', views.FactoryListView.as_view(), name='factory_list'),
] 
