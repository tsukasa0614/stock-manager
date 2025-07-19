import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  FaIndustry, 
  FaWarehouse,
  FaArrowLeft, 
  FaBox,
  FaBoxOpen
} from "react-icons/fa";
import { apiClient, type Factory, type Warehouse, type StorageLocation, type InventoryItem } from "../api/client";

// 基本的な工場データ表示用の型（APIの Factory 型を拡張）
interface ExtendedFactory extends Factory {
  warehouseCount: number;
  totalShelfCount: number;
  manager: string;
}

// 保管エリアデータ表示用の型（APIの Warehouse 型を拡張）
interface ExtendedWarehouse extends Warehouse {
  shelfCount: number;
  totalItems: number;
  manager: string;
}



const Factories: React.FC = () => {
  const [currentView, setCurrentView] = useState<"overview" | "factory-detail" | "warehouse-detail" | "location-detail">("overview");
  const [selectedFactoryId, setSelectedFactoryId] = useState<number | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);





  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 工場データの状態管理
  const [factories, setFactories] = useState<ExtendedFactory[]>([]);
  const [warehouses, setWarehouses] = useState<ExtendedWarehouse[]>([]);
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>([]);

  // 在庫データの追加
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);







  // ナビゲーション関数
  const handleFactoryClick = (factoryId: number) => {
    setSelectedFactoryId(factoryId);
    setCurrentView("factory-detail");
  };

  const handleWarehouseClick = (warehouseId: number) => {
    setSelectedWarehouseId(warehouseId);
    setCurrentView("warehouse-detail");
    // 倉庫の置き場データを取得
    fetchStorageLocations(warehouseId);
  };

  const handleLocationClick = (locationId: number) => {
    setSelectedLocationId(locationId);
    setCurrentView("location-detail");
  };

  const handleBackToOverview = () => {
    setCurrentView("overview");
    setSelectedFactoryId(null);
    setSelectedWarehouseId(null);
    setSelectedLocationId(null);
  };

  const handleBackToFactory = () => {
    setCurrentView("factory-detail");
    setSelectedWarehouseId(null);
    setSelectedLocationId(null);
  };

  const handleBackToWarehouse = () => {
    setCurrentView("warehouse-detail");
    setSelectedLocationId(null);
  };

  // 工場データを取得
  const fetchFactories = async () => {
    try {
      const response = await apiClient.getFactories();
      
      if (response.error) {
        console.error('工場データの取得に失敗:', response.error);
        setError('工場データの取得に失敗しました');
      } else if (response.data) {
        // 工場データを拡張フォーマットに変換
        const extendedFactories: ExtendedFactory[] = response.data.map(factory => ({
          ...factory,
          warehouseCount: 2, // 暫定値
          totalShelfCount: 25, // 暫定値  
          manager: '管理者未設定' // 暫定値
        }));
        setFactories(extendedFactories);
      }
      setLoading(false);
    } catch (err) {
      console.error('工場データの取得に失敗:', err);
      setError('工場データの取得に失敗しました');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactories();
  }, []);

  // 保管エリアデータを取得
  const fetchWarehouses = async () => {
    try {
      const response = await apiClient.getWarehouses();
      
      if (response.error) {
        console.error('保管エリアデータの取得に失敗:', response.error);
      } else if (response.data) {
        const extendedWarehouses: ExtendedWarehouse[] = response.data.map(warehouse => ({
          ...warehouse,
          shelfCount: warehouse.total_locations || 0,
          totalItems: warehouse.occupied_locations || 0,
          manager: '管理者未設定' // 暫定値
        }));
        setWarehouses(extendedWarehouses);
      }
    } catch (err) {
      console.error('保管エリアデータの取得に失敗:', err);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // 置き場データを取得
  const fetchStorageLocations = async (warehouseId?: number) => {
    try {
      const response = await apiClient.getStorageLocations(warehouseId);
      
      if (response.error) {
        console.error('置き場データの取得に失敗:', response.error);
      } else if (response.data) {
        setStorageLocations(response.data);
      }
    } catch (err) {
      console.error('置き場データの取得に失敗:', err);
    }
  };

  // 在庫データを取得
  const fetchInventoryItems = async () => {
    try {
      const response = await apiClient.getInventories();
      
      if (response.error) {
        console.error('在庫データの取得に失敗:', response.error);
      } else if (response.data) {
        setInventoryItems(response.data);
      }
    } catch (err) {
      console.error('在庫データの取得に失敗:', err);
    }
  };

  // コンポーネントマウント時にデータを取得
  useEffect(() => {
    fetchInventoryItems();
  }, []);





  // ステータス色を取得
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-white';
      case 'inactive':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // ステータスラベルを取得
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '稼働中';
      case 'inactive':
        return '停止中';
      default:
        return '不明';
    }
  };





  // 工場概要ビューのレンダリング
  const renderOverview = () => {
    if (loading) {
      return (
        <Card className="shadow-xl bg-white border-0">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">工場データを読み込み中...</p>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className="shadow-xl bg-white border-0">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
              再読み込み
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">工場数</p>
                  <p className="text-3xl font-bold">{factories.length}</p>
      </div>
                <FaIndustry className="text-4xl text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl border-0">
            <CardContent className="p-6">
          <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">保管エリア数</p>
                  <p className="text-3xl font-bold">{warehouses.length}</p>
              </div>
                <FaWarehouse className="text-4xl text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
              <div>
                  <p className="text-purple-100 text-sm">置き場数</p>
                  <p className="text-3xl font-bold">{storageLocations.length}</p>
              </div>
                <FaBox className="text-4xl text-purple-200" />
            </div>
            </CardContent>
          </Card>
          </div>

        {/* 工場一覧カード */}
        <Card className="shadow-xl bg-white border-0">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-900 text-xl flex items-center gap-3">
                <FaIndustry className="text-green-600" />
                工場一覧 ({factories.length}件)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {factories.map((factory) => (
                                  <Card 
                    key={factory.id} 
                    className="border border-green-200 hover:shadow-lg transition-shadow cursor-pointer hover:border-green-300"
                    onClick={() => handleFactoryClick(factory.id)}
                  >
                  <CardHeader className="bg-green-50 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-green-900 text-lg flex items-center gap-2">
                        <FaIndustry className="text-green-600" />
                        {factory.factory_name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">所在地</span>
                        <span className="text-sm font-medium text-green-800">{factory.address}</span>
              </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">電話番号</span>
                        <span className="text-sm font-medium text-green-800">{factory.phone}</span>
              </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">ステータス</span>
                        <Badge className={getStatusColor(factory.status)}>
                          {getStatusLabel(factory.status)}
                        </Badge>
            </div>
                      <div className="mt-3 text-center">
                        <span className="text-xs text-green-600">クリックして倉庫一覧を表示</span>
            </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  };

  // 工場詳細（倉庫一覧）表示
  const renderFactoryDetail = () => {
    const selectedFactory = factories.find(f => f.id === selectedFactoryId);
    
    if (!selectedFactory) {
      return <div>工場が見つかりません</div>;
    }

    const factoryWarehouses = warehouses.filter(w => w.factory === selectedFactoryId);

    return (
      <div className="space-y-6">
        {/* 工場情報ヘッダー */}
        <Card className="shadow-xl bg-white border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <CardTitle className="text-blue-900 text-2xl flex items-center gap-3">
              <FaIndustry className="text-blue-600" />
              {selectedFactory.factory_name} の倉庫一覧
            </CardTitle>
            <p className="text-blue-700 text-sm">📍 {selectedFactory.address}</p>
          </CardHeader>
        </Card>

        {/* 倉庫一覧 */}
        <Card className="shadow-xl bg-white border-0">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-900 text-xl flex items-center gap-3">
                <FaWarehouse className="text-green-600" />
                保管エリア一覧 ({factoryWarehouses.length}件)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {factoryWarehouses.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {factoryWarehouses.map((warehouse) => (
                  <Card 
                    key={warehouse.id} 
                    className="border border-green-200 hover:shadow-lg transition-shadow cursor-pointer hover:border-green-300"
                    onClick={() => handleWarehouseClick(warehouse.id)}
                  >
                    <CardHeader className="bg-green-50 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-green-900 text-lg flex items-center gap-2">
                          <FaWarehouse className="text-green-600" />
                          {warehouse.warehouse_name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">サイズ</span>
                          <span className="text-sm font-medium text-green-800">{warehouse.width} × {warehouse.height}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">置き場数</span>
                          <span className="text-sm font-medium text-green-800">{warehouse.total_locations || 0}箇所</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">ステータス</span>
                          <Badge className={getStatusColor(warehouse.status)}>
                            {getStatusLabel(warehouse.status)}
                          </Badge>
                        </div>
                        <div className="mt-3 text-center">
                          <span className="text-xs text-green-600">クリックして置き場一覧を表示</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaWarehouse className="text-gray-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-600">この工場には保管エリアが登録されていません</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // 倉庫詳細（置き場一覧）表示
  const renderWarehouseDetail = () => {
    const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);
    const selectedFactory = factories.find(f => f.id === selectedFactoryId);
    
    if (!selectedWarehouse || !selectedFactory) {
      return <div>データが見つかりません</div>;
    }

    const warehouseLocations = storageLocations.filter(l => l.warehouse === selectedWarehouseId);

    return (
      <div className="space-y-6">
        {/* 倉庫情報ヘッダー */}
        <Card className="shadow-xl bg-white border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
            <CardTitle className="text-purple-900 text-2xl flex items-center gap-3">
              <FaBox className="text-purple-600" />
              {selectedWarehouse.warehouse_name} の置き場一覧
            </CardTitle>
            <p className="text-purple-700 text-sm">
              🏭 {selectedFactory.factory_name} | 📐 {selectedWarehouse.width} × {selectedWarehouse.height}
            </p>
          </CardHeader>
        </Card>

        {/* 置き場一覧 */}
        <Card className="shadow-xl bg-white border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-900 text-xl flex items-center gap-3">
                <FaBoxOpen className="text-blue-600" />
                置き場一覧 ({warehouseLocations.length}件)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {warehouseLocations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {warehouseLocations.map((location, index) => {
                  const alphabetName = String.fromCharCode(65 + index);
                  
                  // この置き場の在庫を検索
                  const locationInventory = inventoryItems.filter(item => 
                    item.storing_place === location.location_name
                  );

                  return (
                    <Card 
                      key={location.id} 
                      className="border border-blue-200 hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-300"
                      onClick={() => handleLocationClick(location.id)}
                    >
                      <CardHeader className="bg-blue-50 pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-blue-900 text-lg flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-sm font-bold text-blue-800">
                              {alphabetName}
                            </div>
                            {location.location_name}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">サイズ</span>
                            <span className="text-sm font-medium text-blue-800">{location.width} × {location.height}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">在庫数</span>
                            <span className="text-sm font-bold text-blue-800">
                              {location.current_stock} / {location.capacity}
                            </span>
                          </div>
                          {locationInventory.length > 0 && (
                            <div className="text-xs text-green-600 text-center mt-2">
                              {locationInventory.length}種類の商品を保管中
                            </div>
                          )}
                          <div className="text-center mt-3">
                            <span className="text-xs text-blue-600">クリックして在庫詳細を表示</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaBox className="text-gray-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-600">この保管エリアには置き場が登録されていません</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // 置き場詳細（在庫一覧）表示
  const renderLocationDetail = () => {
    const selectedLocation = storageLocations.find(l => l.id === selectedLocationId);
    const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);
    const selectedFactory = factories.find(f => f.id === selectedFactoryId);
    
    if (!selectedLocation || !selectedWarehouse || !selectedFactory) {
      return <div>データが見つかりません</div>;
    }

    // この置き場の在庫を取得
    const locationInventory = inventoryItems.filter(item => 
      item.storing_place === selectedLocation.location_name
    );

    return (
      <div className="space-y-6">
        {/* 置き場情報ヘッダー */}
        <Card className="shadow-xl bg-white border-0">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
            <CardTitle className="text-orange-900 text-2xl flex items-center gap-3">
              <FaBox className="text-orange-600" />
              置き場 {selectedLocation.location_name} の在庫詳細
            </CardTitle>
            <p className="text-orange-700 text-sm">
              🏭 {selectedFactory.factory_name} → 🏪 {selectedWarehouse.warehouse_name} → 📦 {selectedLocation.location_name}
            </p>
            <div className="flex gap-4 text-sm text-orange-700 mt-2">
              <span>📐 サイズ: {selectedLocation.width} × {selectedLocation.height}</span>
              <span>📍 位置: ({selectedLocation.x_position}, {selectedLocation.y_position})</span>
              <span>📊 容量: {selectedLocation.current_stock} / {selectedLocation.capacity}</span>
            </div>
          </CardHeader>
        </Card>

                 {/* 座標ベース在庫一覧 */}
        <Card className="shadow-xl bg-white border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <CardTitle className="text-blue-900 text-xl flex items-center gap-3">
              <FaBoxOpen className="text-blue-600" />
              在庫一覧 ({locationInventory.length}件)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="text-left p-3 font-medium text-blue-800">No.</th>
                    <th className="text-left p-3 font-medium text-blue-800">商品画像</th>
                    <th className="text-left p-3 font-medium text-blue-800">商品名</th>
                    <th className="text-left p-3 font-medium text-blue-800">商品コード</th>
                    <th className="text-left p-3 font-medium text-blue-800">在庫数/最低在庫/単位</th>
                    <th className="text-left p-3 font-medium text-blue-800">単価</th>
                    <th className="text-left p-3 font-medium text-blue-800">ステータス</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {locationInventory.length > 0 ? (
                    locationInventory.map((item, index) => (
                      <tr key={item.id} className="hover:bg-blue-50">
                        <td className="p-3 font-medium text-blue-900">
                          {index + 1}
                        </td>
                        <td className="p-3">
                          {item.image ? (
                            <div className="w-12 h-12 bg-white rounded border overflow-hidden">
                              <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                              <FaBox className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-blue-900">{item.product_name}</div>
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-blue-700">{item.item_code}</span>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            <span className={`font-bold ${item.stock_quantity <= item.lowest_stock ? 'text-red-600' : 'text-blue-900'}`}>
                              {item.stock_quantity}
                            </span>
                            <span className="text-gray-500"> / {item.lowest_stock} / {item.unit}</span>
                          </div>
                          {item.stock_quantity <= item.lowest_stock && (
                            <div className="text-red-500 text-xs mt-1">⚠️ 在庫不足</div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-green-700">¥{item.unit_price}</span>
                        </td>
                        <td className="p-3">
                          <Badge className={item.stock_quantity <= item.lowest_stock ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}>
                            {item.stock_quantity <= item.lowest_stock ? '要補充' : '正常'}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="hover:bg-blue-50">
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        <FaBox className="text-gray-400 text-4xl mx-auto mb-4" />
                        <p>この置き場には商品がありません</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
          </div>
        </CardContent>
      </Card>

      {/* 戻るボタン */}
      <div className="flex justify-center mt-8">
        <Button
          onClick={handleBackToWarehouse}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
        >
          <FaArrowLeft />
          置き場一覧へ戻る
        </Button>
      </div>
    </div>
  );
  };

  // メインレンダリング
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      <div className="container mx-auto py-6 space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                <FaIndustry className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  工場管理
                </h1>
                <p className="text-gray-600">Factory Management System</p>
            </div>
          </div>

            <div className="flex items-center gap-3">
              {/* 戻るボタン */}
              {currentView !== "overview" && (
                <Button
                  onClick={
                    currentView === "location-detail" ? handleBackToWarehouse :
                    currentView === "warehouse-detail" ? handleBackToFactory : 
                    handleBackToOverview
                  }
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <FaArrowLeft />
                  {currentView === "location-detail" ? "置き場一覧へ戻る" :
                   currentView === "warehouse-detail" ? "保管エリア一覧へ戻る" : 
                   "工場一覧へ戻る"}
                </Button>
              )}
            </div>
          </div>

          {/* コンテンツ */}

          {currentView === "overview" && renderOverview()}
          {currentView === "factory-detail" && renderFactoryDetail()}
          {currentView === "warehouse-detail" && renderWarehouseDetail()}
          {currentView === "location-detail" && renderLocationDetail()}
        </div>
      </div>


    </div>
  );
};

export default Factories; 