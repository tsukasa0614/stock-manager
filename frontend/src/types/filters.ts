// フィルター機能の型定義

export interface InventoryFilters {
  // テキスト検索
  searchQuery: string;
  
  // カテゴリフィルター
  categories: string[];
  
  // 在庫ステータスフィルター
  stockStatuses: string[];
  
  // 価格範囲フィルター
  priceRange: {
    min: number | null;
    max: number | null;
  };
  
  // 在庫数範囲フィルター
  quantityRange: {
    min: number | null;
    max: number | null;
  };
  
  // 保管場所フィルター
  locations: string[];
  
  // 工場フィルター
  factories: number[];
  
  // 更新日範囲フィルター
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
}

export const initialFilters: InventoryFilters = {
  searchQuery: '',
  categories: [],
  stockStatuses: [],
  priceRange: { min: null, max: null },
  quantityRange: { min: null, max: null },
  locations: [],
  factories: [],
  dateRange: { startDate: null, endDate: null }
};

// 在庫ステータスの選択肢
export const STOCK_STATUS_OPTIONS = [
  { value: 'out', label: '在庫切れ', color: 'bg-red-100 text-red-700' },
  { value: 'low', label: '在庫少', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'normal', label: '適正', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'high', label: '在庫過多', color: 'bg-blue-100 text-blue-700' }
];

// カテゴリの選択肢（実際のデータから動的に生成することも可能）
export const CATEGORY_OPTIONS = [
  '食品', '飲料', '日用品', '電化製品', '家具', '衣類', '文房具', 'その他', '消耗品'
];

// 保管場所の選択肢
export const LOCATION_OPTIONS = [
  '倉庫A-1', '倉庫A-2', '倉庫B-1', '倉庫B-2', '倉庫C-1', '倉庫C-2', '店舗前', '冷蔵庫'
]; 