from django.contrib import admin
from .models import Account,Inventory,Factory,StockMovement,Stocktaking
# Register your models here.
# admin.site.register(Account)
admin.site.register(Inventory)
admin.site.register(Factory)
admin.site.register(StockMovement)
admin.site.register(Stocktaking)