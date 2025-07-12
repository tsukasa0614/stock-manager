import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ResponsiveTable } from "../components/ui/responsive-table";
import { AdvancedFilterPanel } from "../components/inventory/AdvancedFilterPanel";
import { AlertBanner } from "../components/alerts/AlertBanner";
import { AlertManagement } from "../components/alerts/AlertManagement";
import { FaBoxOpen, FaTruck, FaArrowUp, FaMapMarkerAlt, FaClipboardList, FaChartBar, FaEdit, FaEye, FaHistory, FaArrowLeft, FaDownload, FaFileExcel, FaFileAlt, FaExclamationTriangle, FaFilter } from "react-icons/fa";
import { UserModeSwitch } from "../components/common/UserModeSwitch";
import { useAuth } from "../hooks/useAuth";
import { useAlert } from "../contexts/AlertContext";
import { apiClient, type InventoryItem, type StockMovement, type Factory } from "../api/client";
import { 
  exportInventoryToCSV, 
  exportMovementsToCSV, 
  exportInventorySummaryToCSV, 
  exportLowStockToCSV 
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

// 管理者用メニューアイテム
const adminMenuItems = [
  {
    key: "check",
    label: "在庫確認",
    description: "全在庫の一覧確認と管理",
    icon: <FaClipboardList />,
    color: "from-blue-500 to-blue-600",
    hoverColor: "group-hover:from-blue-600 group-hover:to-blue-700"
  },
  {
    key: "move", 
    label: "在庫移動",
    description: "入出庫の記録と管理",
    icon: <FaTruck />,
    color: "from-emerald-500 to-emerald-600",
    hoverColor: "group-hover:from-emerald-600 group-hover:to-emerald-700"
  },
  {
    key: "alerts",
    label: "アラート管理", 
    description: "在庫不足等の通知管理",
    icon: <FaExclamationTriangle />,
    color: "from-red-500 to-red-600",
    hoverColor: "group-hover:from-red-600 group-hover:to-red-700"
  },
  {
    key: "analysis",
    label: "在庫分析",
    description: "在庫データの分析",
    icon: <FaChartBar />,
    color: "from-purple-500 to-purple-600", 
    hoverColor: "group-hover:from-purple-600 group-hover:to-purple-700"
  }
];

// 一般ユーザー用メニューアイテム
const userMenuItems = [
  {
    key: "check",
    label: "在庫確認",
    description: "在庫一覧の確認",
    icon: <FaClipboardList />,
    color: "from-blue-500 to-blue-600",
    hoverColor: "group-hover:from-blue-600 group-hover:to-blue-700"
  },
  {
    key: "register",
    label: "商品登録", 
    description: "新商品の登録",
    icon: <FaBoxOpen />,
    color: "from-green-500 to-green-600",
    hoverColor: "group-hover:from-green-600 group-hover:to-green-700"
  },
  {
    key: "move",
    label: "在庫移動",
    description: "入出庫の記録",
    icon: <FaTruck />,
    color: "from-emerald-500 to-emerald-600", 
    hoverColor: "group-hover:from-emerald-600 group-hover:to-emerald-700"
  },
  {
    key: "history",
    label: "移動履歴",
    description: "入出庫履歴の確認",
    icon: <FaHistory />,
    color: "from-purple-500 to-purple-600",
    hoverColor: "group-hover:from-purple-600 group-hover:to-purple-700"
  }
];

const Inventory: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [previousScreen, setPreviousScreen] = useState<string | null>(null);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
    } else if (key === "history") {
      setPreviousScreen(null); // メインメニューから来た場合
      fetchMovements();
      setSelected(key);
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
        user_id: 'test_admin', // 開発用: テストユーザーのIDを使用
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
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
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
              <FaBoxOpen className="text-4xl text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium">
                  {hasActiveFilters(filters) ? '表示中在庫数' : '総在庫数'}
                </p>
                <p className="text-3xl font-bold text-emerald-800">{stats.totalQuantity}</p>
                {hasActiveFilters(filters) && (
                  <p className="text-emerald-600 text-xs">
                    全体: {inventoryList.reduce((sum, item) => sum + item.stock_quantity, 0)}
                  </p>
                )}
              </div>
              <FaClipboardList className="text-4xl text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">
                  {hasActiveFilters(filters) ? '表示中在庫価値' : '総在庫価値'}
                </p>
                <p className="text-2xl font-bold text-purple-800">¥{stats.totalValue.toLocaleString()}</p>
                {hasActiveFilters(filters) && (
                  <p className="text-purple-600 text-xs">
                    全体: ¥{inventoryList.reduce((sum, item) => sum + (item.stock_quantity * parseFloat(item.unit_price)), 0).toLocaleString()}
                  </p>
                )}
              </div>
              <FaChartBar className="text-4xl text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">要注意商品</p>
                <p className="text-3xl font-bold text-red-800">{stats.lowStockItems}</p>
                {hasActiveFilters(filters) && (
                  <p className="text-red-600 text-xs">
                    全体: {inventoryList.filter(item => item.stock_quantity <= item.lowest_stock).length}件
                  </p>
                )}
              </div>
              <FaTruck className="text-4xl text-red-400" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {adminMenuItems.map(item => (
              <Card
                key={item.key}
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-0 shadow-lg bg-white touch-manipulation"
                onClick={() => handleMenuClick(item.key)}
              >
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-r ${item.color} ${item.hoverColor} transition-all duration-300 p-4 md:p-6`}>
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="text-3xl md:text-4xl text-white">{item.icon}</div>
                      <div className="text-white">
                        <h3 className="text-lg md:text-xl font-bold">{item.label}</h3>
                        <p className="text-blue-100 text-sm md:text-base">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 一般ユーザー用メニュー */}
      <div>
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
          <div className="w-1 h-4 md:h-6 bg-emerald-500 mr-3"></div>
          基本機能
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {userMenuItems.map(item => (
            <Card
              key={item.key}
              className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-0 shadow-lg bg-white touch-manipulation"
              onClick={() => handleMenuClick(item.key)}
            >
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${item.color} ${item.hoverColor} transition-all duration-300 p-4 md:p-6`}>
                  <div className="flex flex-col items-center text-center">
                    <div className="text-3xl md:text-4xl text-white mb-2 md:mb-3">{item.icon}</div>
                    <div className="text-white">
                      <h3 className="text-sm md:text-lg font-bold mb-1 md:mb-2">{item.label}</h3>
                      <p className="text-white/80 text-xs md:text-sm hidden md:block">{item.description}</p>
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
    // レスポンシブテーブル用の列定義
    const columns = [
      {
        key: 'product_name',
        label: '商品名',
        render: (value: string, row: InventoryItem) => (
          <div className="flex items-center gap-3">
            {row.image && (
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={row.image} alt={row.product_name} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-gray-900">{value}</div>
              <div className="text-xs text-gray-500">{row.item_code}</div>
            </div>
          </div>
        )
      },
      {
        key: 'category',
        label: 'カテゴリ',
        render: (value: string) => (
          <Badge className="bg-blue-100 text-blue-800">{value}</Badge>
        )
      },
      {
        key: 'storing_place',
        label: '保管場所',
        render: (value: string) => value || '未設定'
      },
      {
        key: 'stock_quantity',
        label: '在庫数',
        render: (value: number, row: InventoryItem) => (
          <div className="text-sm font-bold text-gray-900">{value}{row.unit}</div>
        )
      },
      {
        key: 'unit_price',
        label: '単価',
        render: (value: string) => `¥${parseFloat(value).toLocaleString()}`
      },
      {
        key: 'total_value',
        label: '在庫価値',
        render: (_value: any, row: InventoryItem) => (
          <div className="text-sm font-semibold text-gray-900">
            ¥{(row.stock_quantity * parseFloat(row.unit_price)).toLocaleString()}
          </div>
        )
      },
      {
        key: 'status',
        label: 'ステータス',
        render: (_value: any, row: InventoryItem) => {
          const status = getInventoryStatus(row) as StockStatus;
          return (
            <Badge className={`${STATUS_CONFIG[status]?.color} ${STATUS_CONFIG[status]?.textColor}`}>
              {STATUS_CONFIG[status]?.label}
            </Badge>
          );
        }
      },
      {
        key: 'updated_at',
        label: '最終更新',
        render: (value: string) => new Date(value).toLocaleDateString()
      }
    ];

    // アクション定義
    const actions = [
      {
        icon: <FaEye />,
        label: '詳細',
        onClick: (row: InventoryItem) => {
          navigate(`/inventory/detail/${row.item_code}`);
        },
        className: 'border-blue-300 text-blue-700 hover:bg-blue-50'
      },
      {
        icon: <FaHistory />,
        label: '履歴',
        onClick: (_row: InventoryItem) => {
          setPreviousScreen('check');
          fetchMovements();
          setSelected('history');
        },
        className: 'border-purple-300 text-purple-700 hover:bg-purple-50'
      },
      {
        icon: <FaEdit />,
        label: '編集',
        onClick: (row: InventoryItem) => {
          navigate(`/inventory/register?edit=${row.item_code}`);
        },
        className: 'border-gray-300 text-gray-700 hover:bg-gray-50',
        show: (_row: InventoryItem) => isAdmin
      }
    ];

    return (
      <div className="space-y-6">
        {/* 高度なフィルターパネル */}
        <AdvancedFilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          inventories={inventoryList}
          factories={factories}
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
                {/* CSVエクスポートボタン群 */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => {
                      const dataToExport = hasActiveFilters(filters) ? filteredInventoryList : inventoryList;
                      exportInventoryToCSV(dataToExport);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3"
                    title={hasActiveFilters(filters) ? "フィルター結果をCSVでエクスポート" : "全在庫データをCSVでエクスポート"}
                  >
                    <FaFileExcel className="mr-1" />
                    {hasActiveFilters(filters) ? 'フィルター結果CSV' : '全在庫CSV'}
                  </Button>
                  <Button 
                    onClick={() => {
                      const lowStockItems = filteredInventoryList.filter(item => item.stock_quantity <= item.lowest_stock);
                      if (lowStockItems.length === 0) {
                        alert(hasActiveFilters(filters) ? "フィルター結果に在庫不足商品がありません。" : "在庫不足商品がありません。");
                        return;
                      }
                      exportLowStockToCSV(lowStockItems);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3"
                    title="在庫不足商品をCSVでエクスポート"
                  >
                    <FaExclamationTriangle className="mr-1" />
                    不足商品CSV
                  </Button>
                  <Button 
                    onClick={() => {
                      const dataToExport = hasActiveFilters(filters) ? filteredInventoryList : inventoryList;
                      exportInventorySummaryToCSV(dataToExport);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 px-3"
                    title="在庫サマリーをCSVでエクスポート"
                  >
                    <FaFileAlt className="mr-1" />
                    サマリーCSV
                  </Button>
                </div>
                
                {/* 既存のボタン */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setPreviousScreen('check');
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
          <CardContent className="p-0">
            <ResponsiveTable
              data={filteredInventoryList}
              columns={columns}
              actions={actions}
              keyField="id"
              mobileCardTitle={(row) => row.product_name}
              mobileCardSubtitle={(row) => `${row.item_code} | ${row.category}`}
            />
          </CardContent>
        </Card>
      </div>
    );
  };

  // 在庫移動フォーム
  const renderStockMovementForm = (movementType: 'in' | 'out') => {
    const isInbound = movementType === 'in';
    
    return (
      <Card className="shadow-xl bg-white border-0">
        <CardHeader className={`bg-gradient-to-r ${isInbound ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-orange-50 to-orange-100 border-orange-200'} border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 ${isInbound ? 'bg-emerald-600' : 'bg-orange-600'} rounded-full`}>
                {isInbound ? <FaTruck className="text-xl text-white" /> : <FaArrowUp className="text-xl text-white" />}
              </div>
              <div>
                <CardTitle className={`${isInbound ? 'text-emerald-900' : 'text-orange-900'} text-xl`}>
                  {isInbound ? '在庫入荷' : '在庫出荷'}
                </CardTitle>
                <p className={`${isInbound ? 'text-emerald-700' : 'text-orange-700'} text-sm`}>
                  {isInbound ? '商品の入荷処理と数量更新' : '商品の出荷処理と在庫減算'}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setSelected(null)}
              variant="outline"
              className={`${isInbound ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' : 'border-orange-300 text-orange-700 hover:bg-orange-50'}`}
            >
              <FaArrowLeft className="mr-2" />
              戻る
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid gap-6 md:grid-cols-2">
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

            {/* 工場選択 */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">工場</label>
              <select
                value={movementForm.factory_id}
                onChange={(e) => setMovementForm(prev => ({ ...prev, factory_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">工場を選択（任意）</option>
                {factories.map(factory => (
                  <option key={factory.id} value={factory.id}>{factory.factory_name}</option>
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
            <div>
              <label className="block mb-2 font-semibold text-gray-700">理由</label>
              <input
                value={movementForm.reason}
                onChange={(e) => setMovementForm(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                placeholder={isInbound ? "例: 新規仕入れ、返品入荷" : "例: 販売出荷、不良品返却"}
              />
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-4 mt-8">
            <Button
              onClick={() => handleStockMovement(movementType)}
              disabled={loading}
              className={`flex-1 ${isInbound ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'} text-white py-3 text-lg font-semibold`}
            >
              {loading ? "処理中..." : (
                <>
                  {isInbound ? <FaTruck className="mr-2" /> : <FaArrowUp className="mr-2" />}
                  {isInbound ? '入荷実行' : '出荷実行'}
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setPreviousScreen(movementType === 'in' ? 'receiving' : 'shipping'); // 入荷・出荷画面から来たことを記録
                fetchMovements();
                setSelected('history');
              }}
              variant="outline"
              className="flex-1 py-3 text-lg"
              disabled={loading}
            >
              <FaHistory className="mr-2" />
              移動履歴を確認
            </Button>
          </div>
        </CardContent>
      </Card>
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

  // アラート管理画面の描画
  const renderAlertManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => setSelected(null)}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <FaArrowLeft className="mr-2" />
          戻る
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">アラート管理</h2>
      </div>
      <AlertManagement />
    </div>
  );

  // 在庫分析画面の描画（プレースホルダー）
  const renderAnalysis = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => setSelected(null)}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <FaArrowLeft className="mr-2" />
          戻る
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">在庫分析</h2>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <FaChartBar className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">在庫分析機能</h3>
          <p className="text-gray-600">在庫の動向分析、ABC分析、回転率分析などの機能を実装予定です。</p>
        </CardContent>
      </Card>
    </div>
  );

  if (selected === null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* ヘッダータイトル */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <FaBoxOpen className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  在庫管理システム
                </h1>
                <p className="text-gray-600">Inventory Management System</p>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <UserModeSwitch />
            </div>
          </div>

          {/* アラート通知バナー */}
          <div className="mb-6">
            <AlertBanner maxVisible={2} />
          </div>

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <div className="container mx-auto py-6 space-y-6">
        {/* 本番では削除: 開発用のユーザー切り替え機能 */}
        <UserModeSwitch />

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <FaBoxOpen className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
          {selected === "check" && (
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
          {selected === "receiving" && renderStockMovementForm('in')}
          {selected === "shipping" && renderStockMovementForm('out')}
          {selected === "history" && renderMovementHistory()}
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
          {selected === "alerts" && renderAlertManagement()}
          {selected === "analysis" && renderAnalysis()}
        </div>
      </div>
    </div>
  );
};

export default Inventory; 