#!/usr/bin/env python
"""
商品の保管場所を置き場の名前と一致するように修正するスクリプト
"""
import os
import sys
import django

# Djangoの設定を読み込み
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Inventory, StorageLocation, Warehouse, Factory

def fix_inventory_locations():
    """商品の保管場所を置き場の名前と一致するように修正"""
    
    # 商品の保管場所マッピング
    location_mapping = {
        '倉庫A-1': '置き場1-A',
        '倉庫A-2': '置き場1-B', 
        '倉庫B-1': '置き場1-C',
        '倉庫B-2': '置き場1-D',
        '倉庫C-1': '置き場2-A',
        '倉庫C-2': '置き場2-B',
        '店舗前': '置き場2-C',
        '冷蔵庫': '置き場2-D'
    }
    
    # 商品を取得して保管場所を更新
    inventories = Inventory.objects.all()
    updated_count = 0
    
    for inventory in inventories:
        old_location = inventory.storing_place
        if old_location and old_location in location_mapping:
            new_location = location_mapping[old_location]
            inventory.storing_place = new_location
            inventory.save()
            updated_count += 1
            print(f"更新: {inventory.product_name} - {old_location} → {new_location}")
        elif old_location:
            print(f"未マッピング: {inventory.product_name} - {old_location}")
        else:
            print(f"保管場所なし: {inventory.product_name}")
    
    print(f"\n更新完了: {updated_count}件の商品の保管場所を更新しました")
    
    # 更新後の状況を確認
    print("\n=== 更新後の状況 ===")
    for inventory in Inventory.objects.all():
        print(f"商品: {inventory.product_name}, 保管場所: {inventory.storing_place}, 工場: {inventory.factory.factory_name}")

if __name__ == '__main__':
    fix_inventory_locations() 