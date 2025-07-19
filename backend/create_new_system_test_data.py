#!/usr/bin/env python
import os
import sys
import django

# Django設定の読み込み
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Account, Factory, Inventory, StorageArea, Coordinate

def create_new_system_test_data():
    print("新しい置き場システム用のテストデータを作成中...")
    
    # 1. 既存の工場を取得
    try:
        factory = Factory.objects.get(id=1)
        print(f"既存の工場を使用: {factory.factory_name}")
    except Factory.DoesNotExist:
        print("工場が見つかりません。先に create_test_data.py を実行してください。")
        return
    
    # 2. 新しい置き場（StorageArea）を作成
    storage_areas_data = [
        {'area_name': 'A', 'width': 3, 'height': 3, 'description': 'エリアA：重要部品'},
        {'area_name': 'B', 'width': 2, 'height': 4, 'description': 'エリアB：一般部品'},
        {'area_name': 'C', 'width': 4, 'height': 2, 'description': 'エリアC：大型部品'},
    ]
    
    created_areas = []
    for area_data in storage_areas_data:
        area, created = StorageArea.objects.get_or_create(
            factory=factory,
            area_name=area_data['area_name'],
            defaults={
                'width': area_data['width'],
                'height': area_data['height'],
                'description': area_data['description']
            }
        )
        if created:
            print(f"置き場 {area.area_name} を作成しました（{area.width}x{area.height}）")
            
            # 座標を自動生成
            for x in range(1, area.width + 1):
                for y in range(1, area.height + 1):
                    coordinate = Coordinate.objects.create(
                        storage_area=area,
                        x_position=x,
                        y_position=y
                    )
            print(f"  → {area.total_coordinates}個の座標を生成しました")
        else:
            print(f"置き場 {area.area_name} は既に存在します")
        
        created_areas.append(area)
    
    # 3. 座標に在庫を配置
    print("\n在庫を座標に配置中...")
    
    # 既存の在庫を取得（工場1の在庫）
    inventories = Inventory.objects.filter(factory=factory)[:10]  # 最初の10個
    
    if not inventories.exists():
        print("在庫が見つかりません。先に在庫データを作成してください。")
        return
    
    # エリアAの座標に在庫を配置
    area_a = created_areas[0]
    coordinates_a = area_a.coordinate_set.all()[:5]  # 最初の5座標
    
    for i, inventory in enumerate(inventories[:5]):
        if i < len(coordinates_a):
            coordinate = coordinates_a[i]
            inventory.coordinate = coordinate
            inventory.save()
            print(f"  {inventory.item_code} を {coordinate.coordinate_name} に配置")
    
    # エリアBの座標に在庫を配置
    area_b = created_areas[1]
    coordinates_b = area_b.coordinate_set.all()[:3]  # 最初の3座標
    
    for i, inventory in enumerate(inventories[5:8]):
        if i < len(coordinates_b):
            coordinate = coordinates_b[i]
            inventory.coordinate = coordinate
            inventory.save()
            print(f"  {inventory.item_code} を {coordinate.coordinate_name} に配置")
    
    # 4. システム統計を表示
    print("\n=== 新しい置き場システム統計 ===")
    for area in created_areas:
        print(f"置き場 {area.area_name}:")
        print(f"  サイズ: {area.width}x{area.height} ({area.total_coordinates}座標)")
        print(f"  使用中: {area.occupied_coordinates}座標")
        print(f"  使用率: {area.occupied_coordinates / area.total_coordinates * 100:.1f}%")
        print()
    
    print("新しい置き場システムのテストデータ作成が完了しました！")
    print("\nAPI動作確認用コマンド:")
    print("curl http://localhost:8000/api/storage-areas/")
    print("curl http://localhost:8000/api/coordinates/")
    print("curl http://localhost:8000/api/storage-areas/1/")

if __name__ == "__main__":
    create_new_system_test_data() 