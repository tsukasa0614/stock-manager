import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

import { AdvancedFilterPanel } from "../components/inventory/AdvancedFilterPanel";
import { QRScanner } from "../components/qr/QRScanner";
import { QRLabelDialog } from "../components/qr/QRLabelDialog";
import { FaBoxOpen, FaTruck, FaArrowUp, FaClipboardList, FaChartBar,  FaEye, FaHistory, FaArrowLeft, FaFilter, FaQrcode, FaPlus, FaMinus, FaCheck, FaPrint } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { apiClient, type InventoryItem, type StockMovement, type Factory } from "../api/client";
import { 
  exportMovementsToCSV
} from "../utils/csvExport";
import { filterInventory, getFilteredStats, hasActiveFilters, getInventoryStatus } from "../utils/filterUtils";
import type { InventoryFilters } from "../types/filters";
import { initialFilters } from "../types/filters";

// 在庫ステータス用の型定義
type StockStatus = "normal" | "low" | "out" | "high";

// ステータス設定
const STATUS_CONFIG: Record<StockStatus, { color: string; textColor: string; label: string }> = {
  normal: { color: 'bg-emerald-100', textColor: 'text-emerald-700', label: '適正' },
  low: { color: 'bg-yellow-100', textColor: 'text-yellow-700', label: '在庫少' },
  out: { color: 'bg-red-100', textColor: 'text-red-700', label: '在庫切れ' },
  high: { color: 'bg-blue-100', textColor: 'text-blue-700', label: '在庫過多' }
};

// 管理者用メニューアイテム（商品管理系）
const adminMenuItems = [
  {
    key: "register",
    label: "商品登録",
    description: "新しい商品の登録・編集・削除",
    icon: <FaBoxOpen />,
    color: "from-blue-400 via-indigo-500 to-blue-600",
    hoverColor: "group-hover:from-blue-500 group-hover:via-indigo-600 group-hover:to-blue-700"
  },
];

// 基本メニューアイテム（入出庫と在庫確認）
const basicMenuItems = [
  {
    key: "stock_operations",
    label: "入出庫登録",
    description: "商品の入荷・出荷記録",
    icon: <FaTruck />,
    color: "from-sky-400 via-blue-500 to-indigo-600", 
    hoverColor: "group-hover:from-sky-500 group-hover:via-blue-600 group-hover:to-indigo-700"
  },
  {
    key: "inventory_list",
    label: "在庫一覧",
    description: "在庫確認・移動履歴表示",
    icon: <FaClipboardList />,
    color: "from-cyan-400 via-blue-500 to-teal-600",
    hoverColor: "group-hover:from-cyan-500 group-hover:via-blue-600 group-hover:to-teal-700"
  }
];

const Inventory: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null); // デフォルトで機能選択画面を表示
  const [previousScreen, setPreviousScreen] = useState<string | null>(null);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null); // 詳細表示用
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // QRスキャン関連の状態
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedItems, setScannedItems] = useState<{item: InventoryItem, quantity: number, type: 'in' | 'out'}[]>([]);
  const [currentScanType, setCurrentScanType] = useState<'in' | 'out'>('in');
  
  // QRラベル印刷関連の状態
  const [showQRLabelDialog, setShowQRLabelDialog] = useState(false);
  const [selectedItemsForPrint, setSelectedItemsForPrint] = useState<Set<number>>(new Set());
  
  // フィルター状態の追加
  const [filters, setFilters] = useState<InventoryFilters>(initialFilters);
  
  const { user } = useAuth();
  const { generateAlertsFromInventory } = useAlert();
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  
  // 在庫移動フォーム用の状態
  const [movementForm, setMovementForm] = useState({
    item_id: "",
    quantity: "",
    reason: "",
    factory_id: ""
  });
  
  const isAdmin = user?.role === "admin";

  // 安全な状態更新のためのヘルパー関数
  const safeSetState = (setter: Function, value: any) => {
    if (isMountedRef.current) {
      setter(value);
    }
  };

  // フィルタリングされた在庫データ
  const filteredInventoryList = filterInventory(inventoryList, filters);
  
  // フィルタリングされた統計データ
  const filteredStats = getFilteredStats(filteredInventoryList);
  
  // 統計データ（フィルタリング結果を反映）
  const stats = {
    totalItems: filteredStats.totalItems,
    totalQuantity: filteredStats.totalQuantity,
    totalValue: filteredStats.totalValue,
    lowStockItems: filteredStats.lowStockItems,
  };

  const handleMenuClick = (key: string) => {
    if (key === "register") {
      navigate("/inventory/register");
    } else if (key === "stock_operations") {
      setSelected("stock_operations");
    } else if (key === "inventory_list") {
      setSelected("inventory_list");
    } else {
      setSelected(key);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        safeSetState(setLoading, true);
        
        const [inventoriesRes, factoriesRes] = await Promise.all([
          apiClient.getInventories(),
          apiClient.getFactories()
        ]);
        
        if (inventoriesRes.data) {
          safeSetState(setInventoryList, inventoriesRes.data);
          generateAlertsFromInventory(inventoriesRes.data); // 在庫データ取得時にアラートを生成
        } else {
          safeSetState(setError, inventoriesRes.error || "在庫データの取得に失敗しました");
        }
        
        if (factoriesRes.data) {
          safeSetState(setFactories, factoriesRes.data);
        }
      } catch (err) {
        safeSetState(setError, "ネットワークエラーが発生しました");
      } finally {
        safeSetState(setLoading, false);
      }
    };
    
    fetchData();
    
    // クリーンアップ関数
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 在庫移動履歴を取得
  const fetchMovements = async () => {
    try {
      const response = await apiClient.getStockMovements();
      if (response.data && isMountedRef.current) {
        safeSetState(setMovements, response.data);
      }
    } catch (err) {
      console.error("在庫移動履歴の取得に失敗しました:", err);
    }
  };

    // 在庫移動を実行
  const handleStockMovement = async (movementType: 'in' | 'out') => {
    if (!movementForm.item_id || !movementForm.quantity) {
      alert("商品名と個数を入力してください");
      return;
    }
    if (!user?.id) {
      alert("ユーザー情報を取得できません。再ログインしてください。");
      return;
    }

    try {
      safeSetState(setLoading, true);
      
      // 工場が選択されていない場合は、商品の所属工場を使用
      const selectedItem = inventoryList.find(item => item.id === parseInt(movementForm.item_id));
      const factoryId = movementForm.factory_id ? parseInt(movementForm.factory_id) : selectedItem?.factory;
      
      if (!factoryId) {
        alert("工場情報が見つかりません");
        safeSetState(setLoading, false);
        return;
      }
      
      const requestData = {
        item_id: parseInt(movementForm.item_id),
        movement_type: movementType,
        quantity: parseInt(movementForm.quantity),
        reason: movementForm.reason,
        user_id: user.id,
        factory_id: factoryId
      };
      
      const response = await apiClient.createStockMovement(requestData);

      if (response.data && isMountedRef.current) {
        // 成功時のメッセージを改善
        const itemName = selectedItem?.product_name || "商品";
        const actionType = movementType === 'in' ? '入荷' : '出荷';
        const quantity = movementForm.quantity;
        const unit = selectedItem?.unit || "";
        
        // より詳細な成功メッセージ
        const successMessage = `
🎉 ${actionType}処理が完了しました！

📦 商品: ${itemName}
🔢 数量: ${quantity}${unit}
🏭 工場: ${selectedItem?.factory_name || ""}
📝 理由: ${movementForm.reason || "未入力"}

在庫が正常に更新されました。
        `.trim();
        
        alert(successMessage);
        
        // フォームをリセット
        setMovementForm({
          item_id: "",
          quantity: "",
          reason: "",
          factory_id: ""
        });
        
        // データを再読み込み
        try {
          const inventoriesRes = await apiClient.getInventories();
          if (inventoriesRes.data && isMountedRef.current) {
            safeSetState(setInventoryList, inventoriesRes.data);
            generateAlertsFromInventory(inventoriesRes.data); // 在庫データ取得時にアラートを生成
          }
        } catch (reloadErr) {
          console.error("データ再読み込みエラー:", reloadErr);
        }
        
        // 自動的にメイン画面に戻る
        setTimeout(() => {
          if (isMountedRef.current) {
            setSelected(null);
          }
        }, 2000);
      } else {
        alert(`❌ ${movementType === 'in' ? '入荷' : '出荷'}処理に失敗しました: ${response.error}`);
      }
    } catch (err) {
      console.error("在庫移動処理エラー:", err);
      alert("❌ 処理中にエラーが発生しました");
    } finally {
      safeSetState(setLoading, false);
    }
  };

  // QRコードスキャン結果の処理
  const handleQRScan = (qrText: string) => {
    try {
      // QRコードから商品コードを抽出（商品コードがそのまま入っている想定）
      const itemCode = qrText.trim();
      
      // 商品を検索
      const foundItem = inventoryList.find(item => 
        item.item_code === itemCode || 
        item.product_name === itemCode ||
        item.id.toString() === itemCode
      );

      if (foundItem) {
        // 既にスキャン済みの商品かチェック
        const existingIndex = scannedItems.findIndex(scanned => scanned.item.id === foundItem.id);
        
        if (existingIndex >= 0) {
          // 既存の場合は数量を増加
          const updatedItems = [...scannedItems];
          updatedItems[existingIndex].quantity += 1;
          setScannedItems(updatedItems);
        } else {
          // 新規の場合は追加
          setScannedItems(prev => [...prev, {
            item: foundItem,
            quantity: 1,
            type: currentScanType
          }]);
        }
        
        // スキャン成功の音を鳴らす（オプション）
        if ('vibrate' in navigator) {
          navigator.vibrate(100);
        }
        
        alert(`✅ ${foundItem.product_name} をスキャンしました！\n数量: ${existingIndex >= 0 ? scannedItems[existingIndex].quantity + 1 : 1}`);
      } else {
        alert(`❌ 商品が見つかりません: ${itemCode}`);
      }
    } catch (err) {
      console.error('QRスキャン処理エラー:', err);
      alert('QRコードの読み取りに失敗しました');
    }
  };

  // スキャンした商品の数量変更
  const updateScannedQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setScannedItems(prev => prev.filter(scanned => scanned.item.id !== itemId));
    } else {
      setScannedItems(prev => 
        prev.map(scanned => 
          scanned.item.id === itemId 
            ? { ...scanned, quantity: newQuantity }
            : scanned
        )
      );
    }
  };

  // バッチ処理の実行
  const executeBatchMovements = async () => {
    if (scannedItems.length === 0) {
      alert('処理する商品がありません');
      return;
    }

    try {
      setLoading(true);
      
      const results = [];
      
      for (const scannedItem of scannedItems) {
        const requestData = {
          item_id: scannedItem.item.id,
          movement_type: scannedItem.type,
          quantity: scannedItem.quantity,
          reason: `QRスキャン${scannedItem.type === 'in' ? '入荷' : '出荷'}`,
          user_id: user?.id || 0,
          factory_id: scannedItem.item.factory
        };
        
        const response = await apiClient.createStockMovement(requestData);
        results.push({
          item: scannedItem.item,
          success: !!response.data,
          error: response.error
        });
      }
      
      // 結果の集計
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        alert(`✅ ${successCount}件の処理が完了しました！${failCount > 0 ? `\n❌ ${failCount}件の処理に失敗しました` : ''}`);
        
        // スキャンリストをクリア
        setScannedItems([]);
        
        // 在庫データを再読み込み
        const inventoriesRes = await apiClient.getInventories();
        if (inventoriesRes.data && isMountedRef.current) {
          safeSetState(setInventoryList, inventoriesRes.data);
          generateAlertsFromInventory(inventoriesRes.data);
        }
      } else {
        alert('❌ すべての処理に失敗しました');
      }
    } catch (err) {
      console.error('バッチ処理エラー:', err);
      alert('❌ バッチ処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };
  const renderStatsCards = () => (
    <div className="space-y-4">
      {/* フィルター情報表示 */}
      {hasActiveFilters(filters) && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <FaFilter className="text-white" />
                </div>
                <div>
                  <p className="text-indigo-900 font-semibold">フィルター適用中</p>
                  <p className="text-indigo-700 text-sm">
                    {inventoryList.length}件中 {filteredInventoryList.length}件を表示
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFilters(initialFilters)}
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                フィルター解除
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 border-blue-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">
                  {hasActiveFilters(filters) ? '表示中商品数' : '総商品数'}
                </p>
                <p className="text-3xl font-bold text-blue-800">{stats.totalItems}</p>
                {hasActiveFilters(filters) && (
                  <p className="text-blue-600 text-xs">全体: {inventoryList.length}件</p>
                )}
              </div>
              <FaBoxOpen className="text-4xl text-blue-400 drop-shadow-lg" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 border-sky-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-600 text-sm font-medium">
                  {hasActiveFilters(filters) ? '表示中在庫数' : '総在庫数'}
                </p>
                <p className="text-3xl font-bold text-sky-800">{stats.totalQuantity}</p>
                {hasActiveFilters(filters) && (
                  <p className="text-sky-600 text-xs">
                    全体: {inventoryList.reduce((sum, item) => sum + item.stock_quantity, 0)}
                  </p>
                )}
              </div>
              <FaClipboardList className="text-4xl text-sky-400 drop-shadow-lg" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-100 border-indigo-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">
                  {hasActiveFilters(filters) ? '表示中在庫価値' : '総在庫価値'}
                </p>
                <p className="text-2xl font-bold text-indigo-800">¥{stats.totalValue.toLocaleString()}</p>
                {hasActiveFilters(filters) && (
                  <p className="text-indigo-600 text-xs">
                    全体: ¥{inventoryList.reduce((sum, item) => sum + (item.stock_quantity * parseFloat(item.unit_price)), 0).toLocaleString()}
                  </p>
                )}
              </div>
              <FaChartBar className="text-4xl text-indigo-400 drop-shadow-lg" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-100 border-cyan-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-600 text-sm font-medium">要注意商品</p>
                <p className="text-3xl font-bold text-cyan-800">{stats.lowStockItems}</p>
                {hasActiveFilters(filters) && (
                  <p className="text-cyan-600 text-xs">
                    全体: {inventoryList.filter(item => item.stock_quantity <= item.lowest_stock).length}件
                  </p>
                )}
              </div>
              <FaTruck className="text-4xl text-cyan-400 drop-shadow-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMenuCards = () => (
    <div className="space-y-6 md:space-y-8">
      {/* 管理者用メニュー */}
      {isAdmin && (
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
            <div className="w-1 h-4 md:h-6 bg-blue-500 mr-3"></div>
            管理者機能
          </h2>
          <div className="flex justify-center">
            {adminMenuItems.map(item => (
              <Card
                key={item.key}
                className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-0 shadow-xl bg-white touch-manipulation max-w-md"
                onClick={() => handleMenuClick(item.key)}
              >
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-r ${item.color} ${item.hoverColor} transition-all duration-300 p-4 md:p-6 rounded-lg`}>
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="text-3xl md:text-4xl text-white drop-shadow-lg">{item.icon}</div>
                      <div className="text-white">
                        <h3 className="text-lg md:text-xl font-bold drop-shadow-sm">{item.label}</h3>
                        <p className="text-white/90 text-sm md:text-base drop-shadow-sm">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 基本機能メニュー */}
      <div>
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
          <div className="w-1 h-4 md:h-6 bg-indigo-500 mr-3"></div>
          基本機能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          {basicMenuItems.map(item => (
            <Card
              key={item.key}
              className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-0 shadow-xl bg-white touch-manipulation"
              onClick={() => handleMenuClick(item.key)}
            >
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${item.color} ${item.hoverColor} transition-all duration-300 p-6 md:p-8 rounded-lg`}>
                  <div className="flex flex-col items-center text-center">
                    <div className="text-4xl md:text-5xl text-white mb-3 md:mb-4 drop-shadow-lg">{item.icon}</div>
                    <div className="text-white">
                      <h3 className="text-lg md:text-xl font-bold mb-2 drop-shadow-sm">{item.label}</h3>
                      <p className="text-white/90 text-sm md:text-base drop-shadow-sm">{item.description}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInventoryTable = () => {

    return (
      <div className="space-y-6">
        {/* 高度なフィルターパネル */}
        <AdvancedFilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onReset={() => setFilters(initialFilters)}
        />

        {/* 在庫一覧テーブル */}
        <Card className="shadow-xl bg-white border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-full">
                  <FaClipboardList className="text-xl text-white" />
                </div>
                <div>
                  <CardTitle className="text-blue-900 text-xl">在庫一覧</CardTitle>
                  <p className="text-blue-700 text-sm">
                    {hasActiveFilters(filters) 
                      ? `フィルター結果: ${filteredInventoryList.length}件 (全${inventoryList.length}件中)`
                      : `全${inventoryList.length}商品の詳細情報`
                    }
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2 w-full lg:w-auto">
                {/* QRラベル印刷ボタン */}
                <div className="flex gap-2 mb-2 md:mb-0">
                  <Button 
                    onClick={() => setShowQRLabelDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3"
                    title="選択商品のQRラベルを印刷用Excel出力"
                  >
                    <FaPrint className="mr-1" />
                    QRラベル印刷
                  </Button>
                  {selectedItemsForPrint.size > 0 && (
                    <Button 
                      onClick={() => setSelectedItemsForPrint(new Set())}
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 text-sm py-2 px-3"
                      title="選択をクリア"
                    >
                      選択解除 ({selectedItemsForPrint.size})
                    </Button>
                  )}
                </div>
                
                {/* 機能ボタン */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setPreviousScreen('inventory_list');
                      fetchMovements();
                      setSelected('history');
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-4"
                  >
                    <FaHistory className="mr-2" />
                    移動履歴
                  </Button>
                  <Button 
                    onClick={() => setSelected(null)}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 text-sm py-2 px-4"
                  >
                    <FaArrowLeft className="mr-2" />
                    戻る
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {filteredInventoryList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredInventoryList.map((item) => {
                  const status = getInventoryStatus(item) as StockStatus;
                  const statusConfig = STATUS_CONFIG[status];
                  
                  return (
                    <Card 
                      key={item.id} 
                      className={`border transition-all ${
                        selectedItemsForPrint.has(item.id) 
                          ? 'border-blue-500 bg-blue-50 shadow-lg' 
                          : 'border-gray-200 hover:shadow-lg'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* チェックボックス */}
                          <div className="flex-shrink-0 pt-1">
                            <input
                              type="checkbox"
                              checked={selectedItemsForPrint.has(item.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                const newSelection = new Set(selectedItemsForPrint);
                                if (e.target.checked) {
                                  newSelection.add(item.id);
                                } else {
                                  newSelection.delete(item.id);
                                }
                                setSelectedItemsForPrint(newSelection);
                              }}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                          
                          {/* 商品画像 */}
                          <div className="flex-shrink-0">
                            {item.image ? (
                              <div className="w-16 h-16 bg-white rounded border overflow-hidden">
                                <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                                <FaBoxOpen className="text-gray-400 text-xl" />
                              </div>
                            )}
                          </div>
                          
                          {/* 商品情報 */}
                          <div 
                            className="flex-1 min-w-0 cursor-pointer" 
                            onClick={() => setSelectedItem(item)}
                          >
                            <h3 className="font-medium text-gray-900 truncate">{item.product_name}</h3>
                            <p className="text-xs text-gray-500 truncate">{item.item_code}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className={`font-bold ${item.stock_quantity <= item.lowest_stock ? 'text-red-600' : 'text-blue-900'}`}>
                                {item.stock_quantity}
                              </span>
                              <span className="text-gray-500"> {item.unit}</span>
                            </p>
                            
                            {/* ステータスバッジ */}
                            <div className="mt-2 flex items-center gap-2">
                              <Badge className={`${statusConfig.color} ${statusConfig.textColor} text-xs`}>
                                {statusConfig.label}
                              </Badge>
                              {selectedItemsForPrint.has(item.id) && (
                                <Badge className="bg-blue-100 text-blue-700 text-xs">
                                  <FaPrint className="mr-1" />
                                  印刷対象
                                </Badge>
                              )}
                            </div>
                            
                            {/* クリック案内 */}
                            <p className="text-xs text-blue-600 mt-2">クリックして詳細表示</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaBoxOpen className="text-gray-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-600">表示する在庫がありません</p>
              </div>
            )}
          </CardContent>
        </Card>


      </div>
    );
  };

  // 登録方法選択画面
  const renderStockOperations = () => {
    return (
      <div className="space-y-6">
        {/* ヘッダー */}
        <Card className="shadow-xl bg-white border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-full">
                  <FaTruck className="text-xl text-white" />
                </div>
                <div>
                  <CardTitle className="text-blue-900 text-xl">入出庫登録</CardTitle>
                  <p className="text-blue-700 text-sm">登録方法を選択してください</p>
                </div>
              </div>
              <Button 
                onClick={() => setSelected(null)}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <FaArrowLeft className="mr-2" />
                戻る
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* 登録方法選択 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* QRスキャン登録 */}
          <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-0 shadow-xl bg-white touch-manipulation"
            onClick={() => setSelected("qr_registration")}
          >
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 group-hover:from-green-500 group-hover:via-emerald-600 group-hover:to-green-700 transition-all duration-300 p-6 md:p-8 rounded-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl md:text-5xl text-white mb-3 md:mb-4 drop-shadow-lg">
                    <FaQrcode />
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg md:text-xl font-bold mb-2 drop-shadow-sm">QRスキャン登録</h3>
                    <p className="text-white/90 text-sm md:text-base drop-shadow-sm">
                      スマホカメラでQRコードを読み取り<br />
                      連続で複数商品を登録
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 手動登録 */}
          <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-0 shadow-xl bg-white touch-manipulation"
            onClick={() => setSelected("manual_registration")}
          >
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600 group-hover:from-purple-500 group-hover:via-indigo-600 group-hover:to-purple-700 transition-all duration-300 p-6 md:p-8 rounded-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl md:text-5xl text-white mb-3 md:mb-4 drop-shadow-lg">
                    <FaClipboardList />
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg md:text-xl font-bold mb-2 drop-shadow-sm">手動登録</h3>
                    <p className="text-white/90 text-sm md:text-base drop-shadow-sm">
                      商品を選択して数量を入力<br />
                      従来の登録方法
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // QRスキャン登録画面
  const renderQRRegistration = () => {
    return (
      <div className="space-y-6">
        {/* ヘッダー */}
        <Card className="shadow-xl bg-white border-0">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-600 rounded-full">
                  <FaQrcode className="text-xl text-white" />
                </div>
                <div>
                  <CardTitle className="text-green-900 text-xl">QRスキャン登録</CardTitle>
                  <p className="text-green-700 text-sm">QRコードを読み取って入出庫を登録</p>
                </div>
              </div>
              <Button 
                onClick={() => setSelected("stock_operations")}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <FaArrowLeft className="mr-2" />
                戻る
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* スキャンタイプ選択 */}
        <Card className="shadow-xl bg-white border-0">
          <CardContent className="p-6">
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">登録タイプ</label>
              <div className="flex gap-4">
                <Button
                  onClick={() => setCurrentScanType('in')}
                  className={`${currentScanType === 'in' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-emerald-700`}
                >
                  <FaPlus className="mr-2" />
                  入荷
                </Button>
                <Button
                  onClick={() => setCurrentScanType('out')}
                  className={`${currentScanType === 'out' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-orange-700`}
                >
                  <FaMinus className="mr-2" />
                  出荷
                </Button>
              </div>
            </div>

            {/* QRスキャンボタン */}
            <Button
              onClick={() => setShowQRScanner(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold mb-4"
            >
              <FaQrcode className="mr-2" />
              QRコードをスキャン ({currentScanType === 'in' ? '入荷' : '出荷'})
            </Button>

            {/* スキャン済み商品リスト */}
            {scannedItems.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">スキャン済み商品 ({scannedItems.length}件)</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {scannedItems.map((scannedItem, index) => (
                    <div key={`${scannedItem.item.id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={scannedItem.type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}>
                            {scannedItem.type === 'in' ? '入荷' : '出荷'}
                          </Badge>
                          <span className="font-medium">{scannedItem.item.product_name}</span>
                        </div>
                        <p className="text-sm text-gray-600">{scannedItem.item.item_code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => updateScannedQuantity(scannedItem.item.id, scannedItem.quantity - 1)}
                          size="sm"
                          variant="outline"
                          className="w-8 h-8 p-0"
                        >
                          <FaMinus />
                        </Button>
                        <span className="w-12 text-center font-bold">{scannedItem.quantity}</span>
                        <Button
                          onClick={() => updateScannedQuantity(scannedItem.item.id, scannedItem.quantity + 1)}
                          size="sm"
                          variant="outline"
                          className="w-8 h-8 p-0"
                        >
                          <FaPlus />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* バッチ処理ボタン */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={executeBatchMovements}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                  >
                    {loading ? "処理中..." : (
                      <>
                        <FaCheck className="mr-2" />
                        一括処理実行 ({scannedItems.length}件)
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setScannedItems([])}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    disabled={loading}
                  >
                    クリア
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // 手動登録画面
  const renderManualRegistration = () => {
    return (
      <div className="space-y-6">
        {/* ヘッダー */}
        <Card className="shadow-xl bg-white border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-600 rounded-full">
                  <FaClipboardList className="text-xl text-white" />
                </div>
                <div>
                  <CardTitle className="text-purple-900 text-xl">手動登録</CardTitle>
                  <p className="text-purple-700 text-sm">商品を選択して数量を入力</p>
                </div>
              </div>
              <Button 
                onClick={() => setSelected("stock_operations")}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <FaArrowLeft className="mr-2" />
                戻る
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* 手動登録フォーム */}
        <Card className="shadow-xl bg-white border-0">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* 商品選択 */}
              <div>
                <label className="block mb-2 font-semibold text-gray-700">商品名 *</label>
                <select
                  required
                  value={movementForm.item_id}
                  onChange={(e) => setMovementForm(prev => ({ ...prev, item_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="">商品を選択</option>
                  {inventoryList.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.product_name} ({item.item_code}) - 現在庫: {item.stock_quantity}{item.unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* 個数 */}
              <div>
                <label className="block mb-2 font-semibold text-gray-700">個数 *</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={movementForm.quantity}
                  onChange={(e) => setMovementForm(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="個数を入力"
                />
              </div>

              {/* 理由 */}
              <div className="md:col-span-2">
                <label className="block mb-2 font-semibold text-gray-700">理由</label>
                <input
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="例: 新規仕入れ、販売出荷"
                />
              </div>
            </div>

            {/* 手動登録ボタン */}
            <div className="flex gap-4 mt-6">
              <Button
                onClick={() => handleStockMovement('in')}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-semibold"
              >
                {loading ? "処理中..." : (
                  <>
                    <FaPlus className="mr-2" />
                    入荷登録
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleStockMovement('out')}
                disabled={loading}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold"
              >
                {loading ? "処理中..." : (
                  <>
                    <FaMinus className="mr-2" />
                    出荷登録
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 在庫移動履歴
  const renderMovementHistory = () => {
    return (
      <Card className="shadow-xl bg-white border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-600 rounded-full">
                <FaClipboardList className="text-xl text-white" />
              </div>
              <div>
                <CardTitle className="text-purple-900 text-xl">在庫移動履歴</CardTitle>
                <p className="text-purple-700 text-sm">全{movements.length}件の移動記録</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2 w-full lg:w-auto">
              {/* CSVエクスポートボタン */}
              <Button 
                onClick={() => {
                  if (movements.length === 0) {
                    alert("エクスポートする移動履歴がありません。");
                    return;
                  }
                  exportMovementsToCSV(movements);
                }}
                className="bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3"
                title="在庫移動履歴をCSVでエクスポート"
              >
                <FaFileExcel className="mr-2" />
                履歴CSVエクスポート
              </Button>
              
              {/* 既存のボタン */}
              <Button 
                onClick={() => setSelected(previousScreen)}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <FaArrowLeft className="mr-2" />
                戻る
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日時</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">種別</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">個数</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工場</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">理由</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">実行者</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((movement, index) => (
                  <tr key={movement.id} className={`hover:bg-purple-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(movement.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{movement.item_name}</div>
                      <div className="text-sm text-gray-500">{movement.item_code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={movement.movement_type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}>
                        {movement.movement_type === 'in' ? '入荷' : '出荷'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.factory_name || '未指定'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.reason || '未入力'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.user_name || '不明'}
                    </td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <FaClipboardList className="text-4xl mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">移動履歴がありません</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (selected === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* ヘッダータイトル */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-700 rounded-2xl shadow-lg">
                <FaBoxOpen className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                  在庫管理システム
                </h1>
                <p className="text-gray-600">Inventory Management System</p>
              </div>
            </div>
          </div>

          {/* アラート通知バナー 削除 */}
          {/* アラート通知バナー 削除 */}

          {/* 統計カード */}
          <div className="mb-8">
            {renderStatsCards()}
          </div>

          {/* メイン画面 */}
          {renderMenuCards()}
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto py-6 space-y-6">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-700 rounded-2xl shadow-lg">
                <FaBoxOpen className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                  在庫管理システム
                </h1>
                <p className="text-gray-600">Inventory Management System</p>
              </div>
            </div>
          </div>

          {/* 統計カード */}
          <div className="mb-8">
            {renderStatsCards()}
          </div>

          {/* メイン画面 */}
          {!selected && renderMenuCards()}

          {/* 各機能の画面 */}
          {selected === "inventory_list" && (
            <>
              {loading && (
                <Card className="shadow-xl bg-white border-0">
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">在庫データを読み込み中...</p>
                  </CardContent>
                </Card>
              )}
              {error && (
                <Card className="shadow-xl bg-white border-0">
                  <CardContent className="p-8 text-center">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
                      再読み込み
                    </Button>
                  </CardContent>
                </Card>
              )}
              {!loading && !error && renderInventoryTable()}
            </>
          )}
          
          {selected === "stock_operations" && renderStockOperations()}
          {selected === "qr_registration" && renderQRRegistration()}
          {selected === "manual_registration" && renderManualRegistration()}
          
          {/* 商品詳細表示（画面全体） */}
          {selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-green-900 flex items-center gap-3">
                      <FaEye className="text-green-600" />
                      商品詳細情報
                    </h2>
                    <Button
                      onClick={() => setSelectedItem(null)}
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <FaArrowLeft className="mr-2" />
                      閉じる
                    </Button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 左列：基本情報 */}
                    <div className="space-y-6">
                      <div className="flex items-start gap-6">
                        {/* 商品画像 */}
                        <div className="flex-shrink-0">
                          {selectedItem.image ? (
                            <div className="w-32 h-32 bg-white rounded-lg border overflow-hidden shadow-lg">
                              <img src={selectedItem.image} alt={selectedItem.product_name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-32 h-32 bg-gray-200 rounded-lg border flex items-center justify-center shadow-lg">
                              <FaBoxOpen className="text-gray-400 text-4xl" />
                            </div>
                          )}
                        </div>
                        
                        {/* 基本情報 */}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">{selectedItem.product_name}</h3>
                          <div className="space-y-3 text-base">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-medium">商品コード:</span>
                              <span className="font-mono text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">{selectedItem.item_code}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-medium">カテゴリー:</span>
                              <Badge className="bg-purple-100 text-purple-800 text-sm px-3 py-1">{selectedItem.category}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 在庫情報 */}
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-bold text-blue-900 text-lg mb-4 flex items-center gap-2">
                          📊 在庫情報
                        </h4>
                        <div className="space-y-4 text-base">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">現在在庫:</span>
                            <span className={`font-bold text-lg ${selectedItem.stock_quantity <= selectedItem.lowest_stock ? 'text-red-600' : 'text-blue-900'}`}>
                              {selectedItem.stock_quantity} {selectedItem.unit}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">最低在庫:</span>
                            <span className="text-gray-800 font-medium">{selectedItem.lowest_stock} {selectedItem.unit}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">単位:</span>
                            <span className="text-gray-800 font-medium">{selectedItem.unit}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">単価:</span>
                            <span className="font-bold text-green-700 text-lg">¥{selectedItem.unit_price}</span>
                          </div>
                          {selectedItem.supplier && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700 font-medium">発注先:</span>
                              <span className="text-gray-800 font-medium">{selectedItem.supplier}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* 右列：保管場所・その他 */}
                    <div className="space-y-6">
                      {/* 保管場所 */}
                      <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                        <h4 className="font-bold text-orange-900 text-lg mb-4 flex items-center gap-2">
                          📍 保管場所
                        </h4>
                        <div className="space-y-4 text-base">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">工場:</span>
                            <span className="text-gray-800 font-medium">{selectedItem.factory_name || '未設定'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">置き場:</span>
                            <span className="text-gray-800 font-medium">{selectedItem.storing_place || '未設定'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* メモ */}
                      {selectedItem.memo && (
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                            📝 メモ
                          </h4>
                          <p className="text-gray-700 leading-relaxed">{selectedItem.memo}</p>
                        </div>
                      )}
                      
                      {/* 更新情報 */}
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                          📅 更新情報
                        </h4>
                        <div className="space-y-4 text-base">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">作成日:</span>
                            <span className="text-gray-800 font-medium">{new Date(selectedItem.created_at).toLocaleDateString('ja-JP')}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">更新日:</span>
                            <span className="text-gray-800 font-medium">{new Date(selectedItem.updated_at).toLocaleDateString('ja-JP')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selected === "history" && renderMovementHistory()}

          {/* QRスキャナー */}
          {showQRScanner && (
            <QRScanner
              onScan={handleQRScan}
              onClose={() => setShowQRScanner(false)}
              isActive={showQRScanner}
            />
          )}

          {/* QRラベル印刷ダイアログ */}
          {showQRLabelDialog && (
            <QRLabelDialog
              isOpen={showQRLabelDialog}
              onClose={() => setShowQRLabelDialog(false)}
              selectedItems={filteredInventoryList.filter(item => selectedItemsForPrint.has(item.id))}
              allItems={filteredInventoryList}
            />
          )}

          {selected === "locations" && (
            <Card className="shadow-xl bg-white border-0">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200">
                <CardTitle className="text-indigo-900 text-xl">場所管理</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600">場所管理機能を実装予定です。</p>
                <Button 
                  onClick={() => setSelected(null)}
                  variant="outline"
                  className="mt-4 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  <FaArrowLeft className="mr-2" />
                  戻る
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory; 