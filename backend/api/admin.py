from django.contrib import admin
from .models import Account,Inventory,Factory,StockMovement,Stocktaking,Manager,Warehouse,StorageLocation,StorageArea,Coordinate,SelectionOption

# Register your models here.
# admin.site.register(Account)
admin.site.register(Inventory)
admin.site.register(Factory)
admin.site.register(StockMovement)
admin.site.register(Stocktaking)

# Manager管理画面の設定
@admin.register(Manager)
class ManagerAdmin(admin.ModelAdmin):
    list_display = ['user', 'factory', 'role', 'is_active', 'assigned_at']
    list_filter = ['role', 'is_active', 'factory']
    search_fields = ['user__id', 'factory__factory_name']
    ordering = ['-assigned_at']
    
    fieldsets = (
        ('基本情報', {
            'fields': ('user', 'factory', 'role', 'is_active')
        }),
        ('権限・設定', {
            'fields': ('permissions', 'assigned_at', 'memo')
        }),
    )
    readonly_fields = ['assigned_at']

# Warehouse管理画面の設定（旧システム）
@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ['warehouse_name', 'factory', 'status', 'width', 'height', 'created_at']
    list_filter = ['status', 'factory']
    search_fields = ['warehouse_name', 'factory__factory_name']
    ordering = ['factory', 'warehouse_name']
    
    fieldsets = (
        ('基本情報', {
            'fields': ('warehouse_name', 'factory', 'description', 'status')
        }),
        ('マップ設定', {
            'fields': ('width', 'height')
        }),
    )

# StorageLocation管理画面の設定（旧システム）
@admin.register(StorageLocation)
class StorageLocationAdmin(admin.ModelAdmin):
    list_display = ['location_name', 'warehouse', 'x_position', 'y_position', 'location_type', 'status', 'utilization_rate']
    list_filter = ['location_type', 'status', 'warehouse']
    search_fields = ['location_name', 'warehouse__warehouse_name']
    ordering = ['warehouse', 'y_position', 'x_position']
    
    fieldsets = (
        ('基本情報', {
            'fields': ('location_name', 'warehouse', 'location_type', 'status')
        }),
        ('位置情報', {
            'fields': ('x_position', 'y_position', 'width', 'height')
        }),
        ('容量情報', {
            'fields': ('capacity', 'current_stock')
        }),
        ('その他', {
            'fields': ('memo',)
        }),
    )
    
    def utilization_rate(self, obj):
        """使用率を表示"""
        return f"{obj.utilization_rate:.1f}%"
    utilization_rate.short_description = '使用率'

# StorageArea管理画面の設定（新システム）
@admin.register(StorageArea)
class StorageAreaAdmin(admin.ModelAdmin):
    list_display = ['area_name', 'factory', 'width', 'height', 'total_coordinates', 'occupied_coordinates', 'utilization_rate', 'created_at']
    list_filter = ['factory']
    search_fields = ['area_name', 'factory__factory_name']
    ordering = ['factory', 'area_name']
    
    fieldsets = (
        ('基本情報', {
            'fields': ('area_name', 'factory', 'description')
        }),
        ('サイズ設定', {
            'fields': ('width', 'height')
        }),
    )
    
    def utilization_rate(self, obj):
        """使用率を表示"""
        if obj.total_coordinates == 0:
            return "0.0%"
        rate = (obj.occupied_coordinates / obj.total_coordinates) * 100
        return f"{rate:.1f}%"
    utilization_rate.short_description = '使用率'

# Coordinate管理画面の設定（新システム）
@admin.register(Coordinate)
class CoordinateAdmin(admin.ModelAdmin):
    list_display = ['coordinate_name', 'storage_area', 'position_name', 'has_inventory', 'created_at']
    list_filter = ['storage_area__factory', 'storage_area']
    search_fields = ['storage_area__area_name', 'storage_area__factory__factory_name']
    ordering = ['storage_area', 'x_position', 'y_position']
    
    fieldsets = (
        ('基本情報', {
            'fields': ('storage_area', 'x_position', 'y_position')
        }),
    )
    
    def has_inventory(self, obj):
        """在庫があるかどうか表示"""
        return obj.inventory_set.exists()
    has_inventory.boolean = True
    has_inventory.short_description = '在庫有無'

# SelectionOption管理画面の設定
@admin.register(SelectionOption)
class SelectionOptionAdmin(admin.ModelAdmin):
    list_display = ['option_type_display', 'value', 'is_active', 'sort_order', 'created_at']
    list_filter = ['option_type', 'is_active']
    search_fields = ['value']
    ordering = ['option_type', 'sort_order', 'value']
    
    fieldsets = (
        ('基本情報', {
            'fields': ('option_type', 'value', 'is_active')
        }),
        ('表示設定', {
            'fields': ('sort_order',)
        }),
    )
    
    def option_type_display(self, obj):
        """選択肢の種類を日本語で表示"""
        return obj.get_option_type_display()
    option_type_display.short_description = '種類'