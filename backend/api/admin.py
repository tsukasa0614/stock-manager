from django.contrib import admin
from .models import Account,Inventory,Factory,StockMovement,Stocktaking,Manager

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