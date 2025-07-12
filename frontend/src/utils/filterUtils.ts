// フィルターロジックのユーティリティ関数
import type { InventoryItem } from '../api/client';
import type { InventoryFilters } from '../types/filters';

/**
 * 在庫ステータスを計算する
 */
export const getInventoryStatus = (item: InventoryItem): string => {
  if (item.stock_quantity === 0) {
    return "out";
  } else if (item.stock_quantity <= item.lowest_stock) {
    return "low";
  } else if (item.stock_quantity > item.lowest_stock * 3) {
    return "high";
  } else {
    return "normal";
  }
};

/**
 * 在庫データをフィルタリングする
 */
export const filterInventory = (
  inventories: InventoryItem[],
  filters: InventoryFilters
): InventoryItem[] => {
  return inventories.filter(item => {
    // テキスト検索フィルター
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesName = item.product_name.toLowerCase().includes(query);
      const matchesCode = item.item_code.toLowerCase().includes(query);
      if (!matchesName && !matchesCode) {
        return false;
      }
    }

    // カテゴリフィルター
    if (filters.categories.length > 0) {
      if (!filters.categories.includes(item.category)) {
        return false;
      }
    }

    // 在庫ステータスフィルター
    if (filters.stockStatuses.length > 0) {
      const itemStatus = getInventoryStatus(item);
      if (!filters.stockStatuses.includes(itemStatus)) {
        return false;
      }
    }

    // 価格範囲フィルター
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) {
      const price = parseFloat(item.unit_price);
      if (filters.priceRange.min !== null && price < filters.priceRange.min) {
        return false;
      }
      if (filters.priceRange.max !== null && price > filters.priceRange.max) {
        return false;
      }
    }

    // 在庫数範囲フィルター
    if (filters.quantityRange.min !== null || filters.quantityRange.max !== null) {
      if (filters.quantityRange.min !== null && item.stock_quantity < filters.quantityRange.min) {
        return false;
      }
      if (filters.quantityRange.max !== null && item.stock_quantity > filters.quantityRange.max) {
        return false;
      }
    }

    // 保管場所フィルター
    if (filters.locations.length > 0) {
      if (!item.storing_place || !filters.locations.includes(item.storing_place)) {
        return false;
      }
    }

    // 工場フィルター
    if (filters.factories.length > 0) {
      if (!filters.factories.includes(item.factory)) {
        return false;
      }
    }

    // 更新日範囲フィルター
    if (filters.dateRange.startDate || filters.dateRange.endDate) {
      const itemDate = new Date(item.updated_at).toISOString().split('T')[0];
      
      if (filters.dateRange.startDate && itemDate < filters.dateRange.startDate) {
        return false;
      }
      if (filters.dateRange.endDate && itemDate > filters.dateRange.endDate) {
        return false;
      }
    }

    return true;
  });
};

/**
 * フィルターが適用されているかどうかを判定する
 */
export const hasActiveFilters = (filters: InventoryFilters): boolean => {
  return !!(
    filters.searchQuery ||
    filters.categories.length > 0 ||
    filters.stockStatuses.length > 0 ||
    filters.priceRange.min !== null ||
    filters.priceRange.max !== null ||
    filters.quantityRange.min !== null ||
    filters.quantityRange.max !== null ||
    filters.locations.length > 0 ||
    filters.factories.length > 0 ||
    filters.dateRange.startDate ||
    filters.dateRange.endDate
  );
};

/**
 * フィルターされた結果の統計を計算する
 */
export const getFilteredStats = (filteredInventories: InventoryItem[]) => {
  const totalItems = filteredInventories.length;
  const totalQuantity = filteredInventories.reduce((sum, item) => sum + item.stock_quantity, 0);
  const totalValue = filteredInventories.reduce((sum, item) => sum + (item.stock_quantity * parseFloat(item.unit_price)), 0);
  const lowStockItems = filteredInventories.filter(item => item.stock_quantity <= item.lowest_stock).length;
  
  // ステータス別の集計
  const statusCounts = filteredInventories.reduce((acc, item) => {
    const status = getInventoryStatus(item);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // カテゴリ別の集計
  const categoryCounts = filteredInventories.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalItems,
    totalQuantity,
    totalValue,
    lowStockItems,
    statusCounts,
    categoryCounts
  };
}; 