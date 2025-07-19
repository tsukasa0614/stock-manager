#!/usr/bin/env python
import os
import sys
import django

# Django設定の読み込み
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Account, Factory, Inventory, StockMovement, Stocktaking, Manager, Warehouse, StorageLocation

def create_test_data():
    print("テストデータを作成中...")
    
    # 1. テストユーザーの作成
    if not Account.objects.filter(id="test_admin").exists():
        admin_user = Account.objects.create_user(
            id="test_admin",
            email="admin@test.com",
            password="test123"
        )
        admin_user.username = "test_admin"
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        print("管理者ユーザーを作成しました: test_admin / test123")
    
    if not Account.objects.filter(id="test_user").exists():
        normal_user = Account.objects.create_user(
            id="test_user",
            email="user@test.com",
            password="test123"
        )
        normal_user.username = "test_user"
        normal_user.save()
        print("一般ユーザーを作成しました: test_user / test123")
    
    # 2. プラズマ工場の作成
    plasma_factory1, created = Factory.objects.get_or_create(
        id=1,
        defaults={
            'factory_name': 'プラズマ工場1',
            'address': '東京都品川区プラズマ町1-1-1',
            'phone': '03-1234-5678',
            'status': 'active',
            'capacity': 2000,
            'memo': 'プラズマ生産メイン工場'
        }
    )
    
    plasma_factory2, created = Factory.objects.get_or_create(
        id=2,
        defaults={
            'factory_name': 'プラズマ工場2',
            'address': '大阪府大阪市西区プラズマ町2-2-2',
            'phone': '06-1234-5678',
            'status': 'active',
            'capacity': 1500,
            'memo': 'プラズマ生産サブ工場'
        }
    )
    
    print(f"プラズマ工場を作成しました: {plasma_factory1.factory_name}, {plasma_factory2.factory_name}")
    
    # 3. プラズマ倉庫の作成
    plasma_warehouse1, created = Warehouse.objects.get_or_create(
        id=1,
        defaults={
            'warehouse_name': 'プラズマ倉庫1',
            'factory': plasma_factory1,
            'description': 'プラズマ工場1のメイン倉庫',
            'width': 30,
            'height': 15,
            'status': 'active'
        }
    )
    
    plasma_warehouse2, created = Warehouse.objects.get_or_create(
        id=2,
        defaults={
            'warehouse_name': 'プラズマ倉庫2',
            'factory': plasma_factory2,
            'description': 'プラズマ工場2のメイン倉庫',
            'width': 30,
            'height': 15,
            'status': 'active'
        }
    )
    
    print(f"プラズマ倉庫を作成しました: {plasma_warehouse1.warehouse_name}, {plasma_warehouse2.warehouse_name}")
    
    # 4. 置き場の作成
    # プラズマ倉庫1の置き場
    plasma_storage_locations = [
        # プラズマ倉庫1の置き場（30x15マップ用）
        {
            'location_name': '置き場1-A',
            'warehouse': plasma_warehouse1,
            'x_position': 3,
            'y_position': 2,
            'width': 4,
            'height': 3,
            'capacity': 300,
            'current_stock': 250,
            'location_type': 'shelf',
            'status': 'occupied',
            'memo': 'プラズマ電極A専用'
        },
        {
            'location_name': '置き場1-B',
            'warehouse': plasma_warehouse1,
            'x_position': 8,
            'y_position': 2,
            'width': 4,
            'height': 3,
            'capacity': 300,
            'current_stock': 180,
            'location_type': 'shelf',
            'status': 'occupied',
            'memo': 'プラズマ電極B専用'
        },
        {
            'location_name': '置き場1-C',
            'warehouse': plasma_warehouse1,
            'x_position': 13,
            'y_position': 2,
            'width': 5,
            'height': 3,
            'capacity': 400,
            'current_stock': 0,
            'location_type': 'rack',
            'status': 'available',
            'memo': '予備置き場'
        },
        {
            'location_name': '置き場1-D',
            'warehouse': plasma_warehouse1,
            'x_position': 20,
            'y_position': 2,
            'width': 8,
            'height': 5,
            'capacity': 800,
            'current_stock': 600,
            'location_type': 'floor',
            'status': 'occupied',
            'memo': '大型プラズマ装置専用'
        },
        {
            'location_name': '置き場1-E',
            'warehouse': plasma_warehouse1,
            'x_position': 3,
            'y_position': 7,
            'width': 6,
            'height': 4,
            'capacity': 500,
            'current_stock': 300,
            'location_type': 'container',
            'status': 'occupied',
            'memo': '冷凍保存エリア'
        },
        {
            'location_name': '置き場1-F',
            'warehouse': plasma_warehouse1,
            'x_position': 15,
            'y_position': 8,
            'width': 10,
            'height': 6,
            'capacity': 1000,
            'current_stock': 0,
            'location_type': 'floor',
            'status': 'maintenance',
            'memo': '組み立てエリア（メンテナンス中）'
        },
        # 入口
        {
            'location_name': '入口',
            'warehouse': plasma_warehouse1,
            'x_position': 1,
            'y_position': 8,
            'width': 2,
            'height': 2,
            'capacity': 0,
            'current_stock': 0,
            'location_type': 'floor',
            'status': 'reserved',
            'memo': '倉庫入口'
        },
        
        # プラズマ倉庫2の置き場（30x15マップ用）
        {
            'location_name': '置き場2-A',
            'warehouse': plasma_warehouse2,
            'x_position': 3,
            'y_position': 2,
            'width': 5,
            'height': 3,
            'capacity': 350,
            'current_stock': 200,
            'location_type': 'shelf',
            'status': 'occupied',
            'memo': 'プラズマ材料A専用'
        },
        {
            'location_name': '置き場2-B',
            'warehouse': plasma_warehouse2,
            'x_position': 10,
            'y_position': 2,
            'width': 5,
            'height': 3,
            'capacity': 350,
            'current_stock': 280,
            'location_type': 'shelf',
            'status': 'occupied',
            'memo': 'プラズマ材料B専用'
        },
        {
            'location_name': '置き場2-C',
            'warehouse': plasma_warehouse2,
            'x_position': 17,
            'y_position': 2,
            'width': 4,
            'height': 4,
            'capacity': 400,
            'current_stock': 0,
            'location_type': 'container',
            'status': 'available',
            'memo': '冷凍保存用'
        },
        {
            'location_name': '置き場2-D',
            'warehouse': plasma_warehouse2,
            'x_position': 23,
            'y_position': 2,
            'width': 6,
            'height': 8,
            'capacity': 800,
            'current_stock': 400,
            'location_type': 'floor',
            'status': 'occupied',
            'memo': 'プラズマ装置組み立て用'
        },
        {
            'location_name': '置き場2-E',
            'warehouse': plasma_warehouse2,
            'x_position': 5,
            'y_position': 8,
            'width': 8,
            'height': 5,
            'capacity': 600,
            'current_stock': 100,
            'location_type': 'rack',
            'status': 'occupied',
            'memo': '部品保管ラック'
        },
        # 入口
        {
            'location_name': '入口',
            'warehouse': plasma_warehouse2,
            'x_position': 1,
            'y_position': 7,
            'width': 2,
            'height': 3,
            'capacity': 0,
            'current_stock': 0,
            'location_type': 'floor',
            'status': 'reserved',
            'memo': '倉庫入口'
        }
    ]
    
    for location_data in plasma_storage_locations:
        location, created = StorageLocation.objects.get_or_create(
            location_name=location_data['location_name'],
            warehouse=location_data['warehouse'],
            defaults=location_data
        )
        if created:
            print(f"置き場を作成しました: {location.location_name}")
    
    # 5. ユーザーと工場の関連付け（新しいManagerテーブルを使用）
    admin_user = Account.objects.get(id="test_admin")
    normal_user = Account.objects.get(id="test_user")
    
    # 管理者ユーザーを両方の工場の主任管理者として設定
    Manager.objects.get_or_create(
        user=admin_user,
        factory=plasma_factory1,
        defaults={
            'role': 'primary',
            'permissions': {'inventory': True, 'stocktaking': True, 'reports': True, 'admin': True},
            'is_active': True,
            'memo': 'プラズマシステム管理者'
        }
    )
    
    Manager.objects.get_or_create(
        user=admin_user,
        factory=plasma_factory2,
        defaults={
            'role': 'primary',
            'permissions': {'inventory': True, 'stocktaking': True, 'reports': True, 'admin': True},
            'is_active': True,
            'memo': 'プラズマシステム管理者'
        }
    )
    
    # 一般ユーザーをプラズマ工場1の副管理者として設定
    Manager.objects.get_or_create(
        user=normal_user,
        factory=plasma_factory1,
        defaults={
            'role': 'assistant',
            'permissions': {'inventory': True, 'stocktaking': True, 'reports': False, 'admin': False},
            'is_active': True,
            'memo': 'プラズマ現場担当者'
        }
    )
    
    print("ユーザーと工場の関連付けを完了しました")
    
    # 6. プラズマ関連の在庫データを作成
    plasma_inventories = [
        {
            'item_code': 'PLS-001',
            'product_name': 'プラズマ電極A',
            'standard': '100mm',
            'category': 'プラズマ部品',
            'stock_quantity': 50,
            'lowest_stock': 10,
            'unit': '個',
            'unit_price': 1200.00,
            'storing_place': '置き場1-A',
            'memo': 'プラズマ発生用電極',
            'factory': plasma_factory1
        },
        {
            'item_code': 'PLS-002',
            'product_name': 'プラズマ電極B',
            'standard': '150mm',
            'category': 'プラズマ部品',
            'stock_quantity': 30,
            'lowest_stock': 5,
            'unit': '個',
            'unit_price': 1800.00,
            'storing_place': '置き場1-B',
            'memo': '高出力プラズマ用電極',
            'factory': plasma_factory1
        },
        {
            'item_code': 'PLS-003',
            'product_name': 'プラズマガス',
            'standard': '10L',
            'category': 'プラズマ材料',
            'stock_quantity': 100,
            'lowest_stock': 20,
            'unit': '本',
            'unit_price': 500.00,
            'storing_place': '置き場2-A',
            'memo': 'アルゴンガス',
            'factory': plasma_factory2
        },
        {
            'item_code': 'PLS-004',
            'product_name': 'プラズマ処理液',
            'standard': '5L',
            'category': 'プラズマ材料',
            'stock_quantity': 75,
            'lowest_stock': 15,
            'unit': '本',
            'unit_price': 800.00,
            'storing_place': '置き場2-B',
            'memo': '表面処理用',
            'factory': plasma_factory2
        },
        {
            'item_code': 'PLS-005',
            'product_name': 'プラズマ装置本体',
            'standard': '1000W',
            'category': 'プラズマ装置',
            'stock_quantity': 5,
            'lowest_stock': 1,
            'unit': '台',
            'unit_price': 250000.00,
            'storing_place': '置き場1-D',
            'memo': '産業用プラズマ装置',
            'factory': plasma_factory1
        }
    ]
    
    for inventory_data in plasma_inventories:
        inventory, created = Inventory.objects.get_or_create(
            item_code=inventory_data['item_code'],
            defaults=inventory_data
        )
        if created:
            print(f"プラズマ在庫を作成しました: {inventory.product_name}")
    
    print("\nプラズマ工場テストデータの作成が完了しました！")
    print("================================")
    print("作成されたデータ:")
    print("- プラズマ工場1 (プラズマ倉庫1)")
    print("- プラズマ工場2 (プラズマ倉庫2)")
    print("- 各倉庫に4つの置き場")
    print("- プラズマ関連の在庫データ")
    print("================================")

if __name__ == "__main__":
    create_test_data() 