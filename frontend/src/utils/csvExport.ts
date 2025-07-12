// CSV エクスポート用のユーティリティ関数
import type { InventoryItem, StockMovement } from '../api/client';

/**
 * データをCSV形式に変換する
 */
export const convertToCSV = (data: any[], headers: { key: string; label: string }[]): string => {
  // ヘッダー行を作成
  const headerRow = headers.map(h => `"${h.label}"`).join(',');
  
  // データ行を作成
  const dataRows = data.map(item => {
    return headers.map(header => {
      let value = item[header.key];
      
      // 特殊な値の処理
      if (value === null || value === undefined) {
        value = '';
      } else if (typeof value === 'object') {
        value = JSON.stringify(value);
      } else {
        value = String(value);
      }
      
      // CSV形式にエスケープ（ダブルクォートを含む場合の処理）
      return `"${value.replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\r\n');
};

/**
 * CSVファイルをダウンロードする
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  // BOM付きUTF-8でエンコード（Excelで文字化けを防ぐ）
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // ダウンロードリンクを作成
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // ダウンロードを実行
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // メモリを解放
  URL.revokeObjectURL(url);
};

/**
 * 在庫データをCSVエクスポートする
 */
export const exportInventoryToCSV = (inventories: InventoryItem[]): void => {
  const headers = [
    { key: 'item_code', label: '商品コード' },
    { key: 'product_name', label: '商品名' },
    { key: 'category', label: 'カテゴリ' },
    { key: 'standard', label: '規格' },
    { key: 'stock_quantity', label: '在庫数' },
    { key: 'unit', label: '単位' },
    { key: 'lowest_stock', label: '最低在庫数' },
    { key: 'unit_price', label: '単価（円）' },
    { key: 'total_value', label: '在庫価値（円）' },
    { key: 'storing_place', label: '保管場所' },
    { key: 'factory_name', label: '工場名' },
    { key: 'memo', label: 'メモ' },
    { key: 'created_at', label: '登録日' },
    { key: 'updated_at', label: '更新日' }
  ];
  
  // 在庫価値を計算してデータに追加
  const enrichedData = inventories.map(item => ({
    ...item,
    total_value: item.stock_quantity * parseFloat(item.unit_price),
    created_at: new Date(item.created_at).toLocaleDateString('ja-JP'),
    updated_at: new Date(item.updated_at).toLocaleDateString('ja-JP')
  }));
  
  const csvContent = convertToCSV(enrichedData, headers);
  const filename = `在庫一覧_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, filename);
};

/**
 * 在庫移動履歴をCSVエクスポートする
 */
export const exportMovementsToCSV = (movements: StockMovement[]): void => {
  const headers = [
    { key: 'created_at', label: '日時' },
    { key: 'item_code', label: '商品コード' },
    { key: 'item_name', label: '商品名' },
    { key: 'movement_type', label: '種別' },
    { key: 'quantity', label: '数量' },
    { key: 'factory_name', label: '工場名' },
    { key: 'reason', label: '理由' },
    { key: 'user_name', label: '実行者' }
  ];
  
  // データを日本語形式に変換
  const enrichedData = movements.map(movement => ({
    ...movement,
    created_at: new Date(movement.created_at).toLocaleString('ja-JP'),
    movement_type: movement.movement_type === 'in' ? '入荷' : '出荷',
    quantity: movement.movement_type === 'in' ? `+${movement.quantity}` : `-${movement.quantity}`,
    reason: movement.reason || '未入力',
    user_name: movement.user_name || '不明',
    factory_name: movement.factory_name || '未指定'
  }));
  
  const csvContent = convertToCSV(enrichedData, headers);
  const filename = `在庫移動履歴_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, filename);
};

/**
 * 在庫ステータス別サマリーをCSVエクスポートする
 */
export const exportInventorySummaryToCSV = (inventories: InventoryItem[]): void => {
  // 在庫ステータスを計算
  const getInventoryStatus = (item: InventoryItem): string => {
    if (item.stock_quantity === 0) {
      return "在庫切れ";
    } else if (item.stock_quantity <= item.lowest_stock) {
      return "在庫少";
    } else if (item.stock_quantity > item.lowest_stock * 3) {
      return "在庫過多";
    } else {
      return "適正";
    }
  };
  
  // カテゴリ別・ステータス別の集計
  const summary = inventories.reduce((acc, item) => {
    const status = getInventoryStatus(item);
    const key = `${item.category}_${status}`;
    
    if (!acc[key]) {
      acc[key] = {
        category: item.category,
        status: status,
        count: 0,
        total_quantity: 0,
        total_value: 0
      };
    }
    
    acc[key].count += 1;
    acc[key].total_quantity += item.stock_quantity;
    acc[key].total_value += item.stock_quantity * parseFloat(item.unit_price);
    
    return acc;
  }, {} as Record<string, any>);
  
  const headers = [
    { key: 'category', label: 'カテゴリ' },
    { key: 'status', label: 'ステータス' },
    { key: 'count', label: '商品数' },
    { key: 'total_quantity', label: '総在庫数' },
    { key: 'total_value', label: '総在庫価値（円）' }
  ];
  
  const summaryData = Object.values(summary);
  const csvContent = convertToCSV(summaryData, headers);
  const filename = `在庫サマリー_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, filename);
};

/**
 * 在庫不足商品リストをCSVエクスポートする
 */
export const exportLowStockToCSV = (inventories: InventoryItem[]): void => {
  // 在庫不足商品をフィルタリング
  const lowStockItems = inventories.filter(item => 
    item.stock_quantity <= item.lowest_stock
  ).map(item => ({
    ...item,
    shortage: item.lowest_stock - item.stock_quantity,
    shortage_value: (item.lowest_stock - item.stock_quantity) * parseFloat(item.unit_price),
    status: item.stock_quantity === 0 ? '在庫切れ' : '在庫少',
    created_at: new Date(item.created_at).toLocaleDateString('ja-JP'),
    updated_at: new Date(item.updated_at).toLocaleDateString('ja-JP')
  }));
  
  const headers = [
    { key: 'item_code', label: '商品コード' },
    { key: 'product_name', label: '商品名' },
    { key: 'category', label: 'カテゴリ' },
    { key: 'stock_quantity', label: '現在在庫' },
    { key: 'lowest_stock', label: '最低在庫' },
    { key: 'shortage', label: '不足数' },
    { key: 'unit', label: '単位' },
    { key: 'unit_price', label: '単価（円）' },
    { key: 'shortage_value', label: '不足金額（円）' },
    { key: 'status', label: 'ステータス' },
    { key: 'factory_name', label: '工場名' },
    { key: 'storing_place', label: '保管場所' }
  ];
  
  const csvContent = convertToCSV(lowStockItems, headers);
  const filename = `在庫不足商品_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, filename);
}; 