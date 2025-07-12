import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaChevronDown, 
  FaChevronUp,
  FaCalendar,
  FaDollarSign,
  FaWarehouse,
  FaLayerGroup
} from 'react-icons/fa';
import type { InventoryItem, Factory } from '../../api/client';
import type { InventoryFilters } from '../../types/filters';
import { 
  STOCK_STATUS_OPTIONS, 
  CATEGORY_OPTIONS, 
  LOCATION_OPTIONS,
  initialFilters 
} from '../../types/filters';

interface AdvancedFilterPanelProps {
  filters: InventoryFilters;
  onFiltersChange: (filters: InventoryFilters) => void;
  inventories: InventoryItem[];
  factories: Factory[];
  className?: string;
}

export const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  filters,
  onFiltersChange,
  inventories,
  factories,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // フィルター更新ヘルパー関数
  const updateFilter = <K extends keyof InventoryFilters>(
    key: K,
    value: InventoryFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // 配列型フィルターのトグル関数
  const toggleArrayFilter = <T,>(
    filterKey: keyof InventoryFilters,
    value: T
  ) => {
    const currentArray = filters[filterKey] as T[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(filterKey, newArray as any);
  };

  // アクティブなフィルター数の計算
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.categories.length > 0) count++;
    if (filters.stockStatuses.length > 0) count++;
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) count++;
    if (filters.quantityRange.min !== null || filters.quantityRange.max !== null) count++;
    if (filters.locations.length > 0) count++;
    if (filters.factories.length > 0) count++;
    if (filters.dateRange.startDate || filters.dateRange.endDate) count++;
    return count;
  };

  // フィルターリセット
  const resetFilters = () => {
    onFiltersChange(initialFilters);
  };

  // 実際のデータから動的にカテゴリと保管場所を取得
  const availableCategories = Array.from(new Set(inventories.map(item => item.category)));
  const availableLocations = Array.from(new Set(inventories.map(item => item.storing_place).filter((location): location is string => Boolean(location))));

  return (
    <Card className={`shadow-lg ${className}`}>
      <CardHeader 
        className="cursor-pointer bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <FaFilter className="text-white" />
            </div>
            <div>
              <CardTitle className="text-indigo-900 text-lg flex items-center gap-2">
                高度な検索・フィルター
                {getActiveFilterCount() > 0 && (
                  <Badge className="bg-indigo-600 text-white">
                    {getActiveFilterCount()}個適用中
                  </Badge>
                )}
              </CardTitle>
              <p className="text-indigo-700 text-sm">詳細な条件で在庫を絞り込み</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  resetFilters();
                }}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <FaTimes className="mr-1" />
                リセット
              </Button>
            )}
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* 検索バー */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSearch className="inline mr-2" />
                商品名・商品コード検索
              </label>
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                placeholder="商品名または商品コードを入力..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* カテゴリフィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaLayerGroup className="inline mr-2" />
                  カテゴリ
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableCategories.map((category) => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => toggleArrayFilter('categories', category)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 在庫ステータスフィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  在庫ステータス
                </label>
                <div className="space-y-2">
                  {STOCK_STATUS_OPTIONS.map((status) => (
                    <label key={status.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.stockStatuses.includes(status.value)}
                        onChange={() => toggleArrayFilter('stockStatuses', status.value)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <Badge className={status.color}>{status.label}</Badge>
                    </label>
                  ))}
                </div>
              </div>

              {/* 保管場所フィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaWarehouse className="inline mr-2" />
                  保管場所
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableLocations.map((location) => (
                    <label key={location} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.locations.includes(location)}
                        onChange={() => toggleArrayFilter('locations', location)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{location}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 価格範囲フィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaDollarSign className="inline mr-2" />
                  単価範囲（円）
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="最小価格"
                    value={filters.priceRange.min || ''}
                    onChange={(e) => updateFilter('priceRange', {
                      ...filters.priceRange,
                      min: e.target.value ? Number(e.target.value) : null
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="最大価格"
                    value={filters.priceRange.max || ''}
                    onChange={(e) => updateFilter('priceRange', {
                      ...filters.priceRange,
                      max: e.target.value ? Number(e.target.value) : null
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 在庫数範囲フィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  在庫数範囲
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="最小在庫数"
                    value={filters.quantityRange.min || ''}
                    onChange={(e) => updateFilter('quantityRange', {
                      ...filters.quantityRange,
                      min: e.target.value ? Number(e.target.value) : null
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="最大在庫数"
                    value={filters.quantityRange.max || ''}
                    onChange={(e) => updateFilter('quantityRange', {
                      ...filters.quantityRange,
                      max: e.target.value ? Number(e.target.value) : null
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 工場フィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  工場
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {factories.map((factory) => (
                    <label key={factory.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.factories.includes(factory.id)}
                        onChange={() => toggleArrayFilter('factories', factory.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{factory.factory_name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 更新日範囲フィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendar className="inline mr-2" />
                  更新日範囲
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.dateRange.startDate || ''}
                    onChange={(e) => updateFilter('dateRange', {
                      ...filters.dateRange,
                      startDate: e.target.value || null
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.endDate || ''}
                    onChange={(e) => updateFilter('dateRange', {
                      ...filters.dateRange,
                      endDate: e.target.value || null
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* アクティブフィルターの表示 */}
            {getActiveFilterCount() > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    適用中のフィルター ({getActiveFilterCount()}個)
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetFilters}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <FaTimes className="mr-1" />
                    すべてリセット
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.searchQuery && (
                    <Badge variant="outline" className="bg-blue-50">
                      検索: "{filters.searchQuery}"
                    </Badge>
                  )}
                  {filters.categories.map(cat => (
                    <Badge key={cat} variant="outline" className="bg-green-50">
                      カテゴリ: {cat}
                    </Badge>
                  ))}
                  {filters.stockStatuses.map(status => (
                    <Badge key={status} variant="outline" className="bg-yellow-50">
                      ステータス: {STOCK_STATUS_OPTIONS.find(s => s.value === status)?.label}
                    </Badge>
                  ))}
                  {filters.locations.map(loc => (
                    <Badge key={loc} variant="outline" className="bg-purple-50">
                      場所: {loc}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AdvancedFilterPanel; 