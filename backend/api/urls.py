from django.urls import path
from .views import auth_views, manager_views, inventory_views, stock_views, coordinate_views, factories, warehouses, storage_locations, storage_areas

urlpatterns = [
    # 認証
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('admin/login/', auth_views.AdminLoginView.as_view(), name='admin_login'),
    path('user/login/', auth_views.UserLoginView.as_view(), name='user_login'),
    
    # 工場管理者
    path('managers/', manager_views.ManagerListView.as_view(), name='manager_list'),
    path('managers/<int:pk>/', manager_views.ManagerDetailView.as_view(), name='manager_detail'),
    
    # 在庫管理
    path('inventories/', inventory_views.InventoryListView.as_view(), name='inventory_list'),
    path('inventories/<str:item_code>/', inventory_views.InventoryDetailView.as_view(), name='inventory_detail'),
    
    # 在庫移動（入出庫）
    path('stock-movements/', stock_views.StockMovementListView.as_view(), name='stock_movement_list'),
    
    # 棚卸
    path('stocktakings/', stock_views.StocktakingListView.as_view(), name='stocktaking_list'),
    
    # 工場
    path('factories/', factories.FactoryListView.as_view(), name='factory_list'),
    
    # 倉庫（旧システム）
    path('warehouses/', warehouses.WarehouseListView.as_view(), name='warehouse_list'),
    path('warehouses/<int:pk>/', warehouses.WarehouseDetailView.as_view(), name='warehouse_detail'),
    
    # 置き場（旧システム）
    path('storage-locations/', storage_locations.StorageLocationListView.as_view(), name='storage_location_list'),
    path('storage-locations/<int:pk>/', storage_locations.StorageLocationDetailView.as_view(), name='storage_location_detail'),
    
    # 置き場（新システム）
    path('storage-areas/', storage_areas.StorageAreaListView.as_view(), name='storage_area_list'),
    path('storage-areas/<int:pk>/', storage_areas.StorageAreaDetailView.as_view(), name='storage_area_detail'),
    
    # 座標（新システム）
    path('coordinates/', coordinate_views.CoordinateListView.as_view(), name='coordinate_list'),
    path('coordinates/<int:pk>/', coordinate_views.CoordinateDetailView.as_view(), name='coordinate_detail'),
    

] 
