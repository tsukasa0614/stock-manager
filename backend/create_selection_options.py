#!/usr/bin/env python
"""
選択情報の初期データを作成するスクリプト
"""
import os
import sys
import django

# Djangoの設定を読み込み
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import SelectionOption

def create_initial_selection_options():
    """選択情報の初期データを作成"""
    
    # 既存のデータをクリア
    SelectionOption.objects.all().delete()
    
    # カテゴリー
    categories = [
        "食品", "飲料", "日用品", "電化製品", "家具", "衣類", "文房具", "その他", "消耗品"
    ]
    
    # 発注先
    suppliers = [
        "仕入先A", "仕入先B", "仕入先C", "仕入先D"
    ]
    
    # 単位
    units = [
        "個", "箱", "袋", "本", "kg", "g", "L", "mL", "m", "cm", "セット"
    ]
    
    # データを作成
    for i, category in enumerate(categories):
        SelectionOption.objects.create(
            option_type='category',
            value=category,
            sort_order=i,
            is_active=True
        )
    
    for i, supplier in enumerate(suppliers):
        SelectionOption.objects.create(
            option_type='supplier',
            value=supplier,
            sort_order=i,
            is_active=True
        )
    
    for i, unit in enumerate(units):
        SelectionOption.objects.create(
            option_type='unit',
            value=unit,
            sort_order=i,
            is_active=True
        )
    
    print("選択情報の初期データを作成しました:")
    print(f"- カテゴリー: {len(categories)}件")
    print(f"- 発注先: {len(suppliers)}件")
    print(f"- 単位: {len(units)}件")

if __name__ == '__main__':
    create_initial_selection_options() 