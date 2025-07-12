#!/usr/bin/env python
import os
import sys
import django

# Django設定の読み込み
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Account, Factory, Inventory, StockMovement, Stocktaking

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
    
    # 2. テスト工場の作成
    factory1, created = Factory.objects.get_or_create(
        id=1,
        defaults={
            'factory_name': '東京第一工場',
            'address': '東京都千代田区丸の内1-1-1',
            'phone': '03-1234-5678',
            'status': 'active',
            'capacity': 1000,
            'memo': 'メイン工場'
        }
    )
    
    factory2, created = Factory.objects.get_or_create(
        id=2,
        defaults={
            'factory_name': '大阪第二工場',
            'address': '大阪府大阪市北区梅田1-1-1',
            'phone': '06-1234-5678',
            'status': 'active',
            'capacity': 800,
            'memo': 'サブ工場'
        }
    )
    
    print(f"工場を作成しました: {factory1.factory_name}, {factory2.factory_name}")
    
    # 3. ユーザーと工場の関連付け
    admin_user = Account.objects.get(id="test_admin")
    normal_user = Account.objects.get(id="test_user")
    
    admin_user.factories.add(factory1, factory2)
    normal_user.factories.add(factory1)
    
    print("ユーザーと工場の関連付けを完了しました")
    
    # 4. テスト在庫の作成
    test_inventories = [
        {
            'item_code': 'PROD-001',
            'product_name': '商品A',
            'standard': '500g',
            'category': '食品',
            'stock_quantity': 120,
            'lowest_stock': 20,
            'unit': '個',
            'unit_price': 150.00,
            'storing_place': '倉庫A-1',
            'memo': '人気商品',
            'factory': factory1
        },
        {
            'item_code': 'PROD-002',
            'product_name': '商品B',
            'standard': '1L',
            'category': '飲料',
            'stock_quantity': 80,
            'lowest_stock': 15,
            'unit': '本',
            'unit_price': 200.00,
            'storing_place': '倉庫A-2',
            'memo': '',
            'factory': factory1
        },
        {
            'item_code': 'PROD-003',
            'product_name': '商品C',
            'standard': '300g',
            'category': '食品',
            'stock_quantity': 15,
            'lowest_stock': 30,
            'unit': '個',
            'unit_price': 180.00,
            'storing_place': '倉庫B-1',
            'memo': '要補充',
            'factory': factory1
        },
        {
            'item_code': 'PROD-004',
            'product_name': '商品D',
            'standard': '大サイズ',
            'category': '日用品',
            'stock_quantity': 0,
            'lowest_stock': 10,
            'unit': '個',
            'unit_price': 300.00,
            'storing_place': '倉庫B-2',
            'memo': '在庫切れ',
            'factory': factory1
        },
        {
            'item_code': 'PROD-005',
            'product_name': '商品E',
            'standard': '2L',
            'category': '飲料',
            'stock_quantity': 45,
            'lowest_stock': 20,
            'unit': '箱',
            'unit_price': 250.00,
            'storing_place': '倉庫C-1',
            'memo': '',
            'factory': factory2
        }
    ]
    
    created_count = 0
    for inventory_data in test_inventories:
        inventory, created = Inventory.objects.get_or_create(
            item_code=inventory_data['item_code'],
            defaults=inventory_data
        )
        if created:
            created_count += 1
    
    print(f"在庫データを作成しました: {created_count}件")
    
    # 5. テスト在庫移動の作成
    if StockMovement.objects.count() == 0:
        movements = [
            {
                'item_id': Inventory.objects.get(item_code='PROD-001'),
                'movement_type': 'in',
                'quantity': 50,
                'reason': '初期入庫',
                'user_id': admin_user,
                'factory_id': factory1
            },
            {
                'item_id': Inventory.objects.get(item_code='PROD-002'),
                'movement_type': 'out',
                'quantity': 20,
                'reason': '出荷',
                'user_id': normal_user,
                'factory_id': factory1
            }
        ]
        
        for movement_data in movements:
            StockMovement.objects.create(**movement_data)
        
        print("在庫移動データを作成しました")
    
    print("テストデータの作成が完了しました！")
    print("\n=== ログイン情報 ===")
    print("管理者: test_admin / test123")
    print("一般ユーザー: test_user / test123")
    print("==================")

if __name__ == "__main__":
    create_test_data() 