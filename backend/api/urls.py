from django.urls import path
from . import views

urlpatterns = [
    # 認証
    path('login/', views.LoginView.as_view(), name='login'),
    path('admin/login/', views.AdminLoginView.as_view(), name='admin_login'),
    path('user/login/', views.UserLoginView.as_view(), name='user_login'),
    
    # 工場管理者
    path('managers/', views.ManagerListView.as_view(), name='manager_list'),
    path('managers/<int:pk>/', views.ManagerDetailView.as_view(), name='manager_detail'),
    
    # 在庫管理
    path('inventories/', views.InventoryListView.as_view(), name='inventory_list'),
    path('inventories/<str:item_code>/', views.InventoryDetailView.as_view(), name='inventory_detail'),
    
    # 在庫移動（入出庫）
    path('stock-movements/', views.StockMovementListView.as_view(), name='stock_movement_list'),
    
    # 棚卸
    path('stocktakings/', views.StocktakingListView.as_view(), name='stocktaking_list'),
    
    # 工場
    path('factories/', views.FactoryListView.as_view(), name='factory_list'),
    
    # 倉庫（旧システム）
    path('warehouses/', views.WarehouseListView.as_view(), name='warehouse_list'),
    path('warehouses/<int:pk>/', views.WarehouseDetailView.as_view(), name='warehouse_detail'),
    
    # 置き場（旧システム）
    path('storage-locations/', views.StorageLocationListView.as_view(), name='storage_location_list'),
    path('storage-locations/<int:pk>/', views.StorageLocationDetailView.as_view(), name='storage_location_detail'),
    
    # 置き場（新システム）
    path('storage-areas/', views.StorageAreaListView.as_view(), name='storage_area_list'),
    path('storage-areas/<int:pk>/', views.StorageAreaDetailView.as_view(), name='storage_area_detail'),
    
    # 座標（新システム）
    path('coordinates/', views.CoordinateListView.as_view(), name='coordinate_list'),
    path('coordinates/<int:pk>/', views.CoordinateDetailView.as_view(), name='coordinate_detail'),
    
    # 選択情報管理
    path('selection-options/', views.SelectionOptionListView.as_view(), name='selection_option_list'),
    path('selection-options/<int:pk>/', views.SelectionOptionDetailView.as_view(), name='selection_option_detail'),
    path('selection-options/all/', views.SelectionOptionsView.as_view(), name='selection_options_all'),
] 
