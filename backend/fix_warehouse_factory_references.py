#!/usr/bin/env python
"""
保管エリアのfactoryフィールドを工場名から工場IDに修正するスクリプト
"""
import os
import sys
import django

# Djangoの設定を読み込み
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Factory, Warehouse

def fix_warehouse_factory_references():
    """保管エリアのfactoryフィールドを工場名から工場IDに修正"""
    
    # 工場名からIDへのマッピングを作成
    factories = Factory.objects.all()
    factory_name_to_id = {factory.factory_name: factory.id for factory in factories}
    
    print("工場名からIDへのマッピング:")
    for name, id in factory_name_to_id.items():
        print(f"  {name} -> {id}")
    
    # 保管エリアを取得して修正
    warehouses = Warehouse.objects.all()
    updated_count = 0
    
    for warehouse in warehouses:
        old_factory = warehouse.factory
        print(f"保管エリア: {warehouse.warehouse_name}, factory値: {old_factory} (型: {type(old_factory)})")
        
        if isinstance(old_factory, str):
            # 工場名が文字列の場合、IDに変換
            if old_factory in factory_name_to_id:
                new_factory = Factory.objects.get(id=factory_name_to_id[old_factory])
                warehouse.factory = new_factory
                warehouse.save()
                updated_count += 1
                print(f"更新: {warehouse.warehouse_name} - {old_factory} → {new_factory.factory_name}")
            else:
                print(f"エラー: 工場名 '{old_factory}' が見つかりません")
        elif hasattr(old_factory, 'factory_name'):
            # Factoryオブジェクトの場合、既に正しい形式
            print(f"既に正しい形式: {warehouse.warehouse_name} - 工場: {old_factory.factory_name}")
        else:
            print(f"不明な形式: {warehouse.warehouse_name} - 値: {old_factory}")
    
    print(f"\n更新完了: {updated_count}件の保管エリアを更新しました")
    
    # 更新後の状況を確認
    print("\n=== 更新後の状況 ===")
    for warehouse in Warehouse.objects.all():
        try:
            factory = warehouse.factory
            print(f"保管エリア: {warehouse.warehouse_name}, 工場: {factory.factory_name} (ID: {factory.id})")
        except Exception as e:
            print(f"エラー: 保管エリア {warehouse.warehouse_name} - {e}")

if __name__ == '__main__':
    fix_warehouse_factory_references() 