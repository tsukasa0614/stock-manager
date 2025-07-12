import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { FaBoxOpen, FaTruck, FaArrowUp, FaMapMarkerAlt, FaClipboardList, FaChartBar, FaEdit, FaEye, FaHistory, FaArrowLeft } from "react-icons/fa";
import { UserModeSwitch } from "../components/common/UserModeSwitch";
import { useAuth } from "../hooks/useAuth";
import { apiClient, type InventoryItem, type StockMovement, type Factory } from "../api/client";

// 管理者用メニュー
const adminMenuItems = [
  { 
    key: "register", 
    label: "在庫登録・削除", 
    icon: <FaBoxOpen />,
    description: "新しい商品の登録や既存商品の削除",
    color: "from-blue-500 to-blue-600",
    hoverColor: "hover:from-blue-600 hover:to-blue-700"
  },
  { 
    key: "locations", 
    label: "場所管理", 
    icon: <FaMapMarkerAlt />,
    description: "保管場所の登録・編集・削除",
    color: "from-indigo-500 to-indigo-600",
    hoverColor: "hover:from-indigo-600 hover:to-indigo-700"
  },
];

// 一般ユーザー用メニュー
const userMenuItems = [
  { 
    key: "receiving", 
    label: "在庫入荷", 
    icon: <FaTruck />,
    description: "商品の入荷処理と数量更新",
    color: "from-emerald-500 to-emerald-600",
    hoverColor: "hover:from-emerald-600 hover:to-emerald-700"
  },
  { 
    key: "shipping", 
    label: "在庫出荷", 
    icon: <FaArrowUp />,
    description: "商品の出荷処理と在庫減算",
    color: "from-orange-500 to-orange-600",
    hoverColor: "hover:from-orange-600 hover:to-orange-700"
  },
  { 
    key: "check", 
    label: "在庫確認", 
    icon: <FaClipboardList />,
    description: "全商品の在庫状況を確認",
    color: "from-purple-500 to-purple-600",
    hoverColor: "hover:from-purple-600 hover:to-purple-700"
  },
  { 
    key: "history", 
    label: "移動履歴", 
    icon: <FaHistory />,
    description: "全ての入出荷履歴を確認",
    color: "from-indigo-500 to-indigo-600",
    hoverColor: "hover:from-indigo-600 hover:to-indigo-700"
  },
];

type StockStatus = "normal" | "low" | "out" | "high";

const STATUS_CONFIG: Record<StockStatus, { label: string; color: string; textColor: string }> = {
  normal: { label: "適正", color: "bg-emerald-100", textColor: "text-emerald-700" },
  low: { label: "少ない", color: "bg-yellow-100", textColor: "text-yellow-700" },
  out: { label: "在庫切れ", color: "bg-red-100", textColor: "text-red-700" },
  high: { label: "過多", color: "bg-blue-100", textColor: "text-blue-700" }
};

// 在庫ステータスを計算するヘルパー関数
const getInventoryStatus = (item: InventoryItem): StockStatus => {
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

const Inventory: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [previousScreen, setPreviousScreen] = useState<string | null>(null);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
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

  // 統計データ
  const stats = {
    totalItems: inventoryList.length,
    totalQuantity: inventoryList.reduce((sum, item) => sum + item.stock_quantity, 0),
    totalValue: inventoryList.reduce((sum, item) => sum + (item.stock_quantity * parseFloat(item.unit_price)), 0),
    lowStockItems: inventoryList.filter(item => item.stock_quantity <= item.lowest_stock).length,
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">総商品数</p>
              <p className="text-3xl font-bold text-blue-800">{stats.totalItems}</p>
            </div>
            <FaBoxOpen className="text-4xl text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-medium">総在庫数</p>
              <p className="text-3xl font-bold text-emerald-800">{stats.totalQuantity}</p>
            </div>
            <FaClipboardList className="text-4xl text-emerald-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">総在庫価値</p>
              <p className="text-2xl font-bold text-purple-800">¥{stats.totalValue.toLocaleString()}</p>
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
            </div>
            <FaTruck className="text-4xl text-red-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMenuCards = () => (
    <div className="space-y-8">
      {/* 管理者用メニュー */}
      {isAdmin && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="w-1 h-6 bg-blue-500 mr-3"></div>
            管理者機能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminMenuItems.map(item => (
              <Card
                key={item.key}
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 shadow-lg bg-white"
                onClick={() => handleMenuClick(item.key)}
              >
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-r ${item.color} ${item.hoverColor} transition-all duration-300 p-6`}>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl text-white">{item.icon}</div>
                      <div className="text-white">
                        <h3 className="text-xl font-bold">{item.label}</h3>
                        <p className="text-blue-100 text-sm">{item.description}</p>
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
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <div className="w-1 h-6 bg-emerald-500 mr-3"></div>
          基本機能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {userMenuItems.map(item => (
            <Card
              key={item.key}
              className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 shadow-lg bg-white"
              onClick={() => handleMenuClick(item.key)}
            >
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${item.color} ${item.hoverColor} transition-all duration-300 p-6`}>
                  <div className="flex flex-col items-center text-center">
                    <div className="text-4xl text-white mb-3">{item.icon}</div>
                    <div className="text-white">
                      <h3 className="text-lg font-bold mb-2">{item.label}</h3>
                      <p className="text-white/80 text-sm">{item.description}</p>
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

  const renderInventoryTable = () => (
    <Card className="shadow-xl bg-white border-0">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-full">
              <FaClipboardList className="text-xl text-white" />
            </div>
            <div>
              <CardTitle className="text-blue-900 text-xl">在庫一覧</CardTitle>
              <p className="text-blue-700 text-sm">全{inventoryList.length}商品の詳細情報</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => {
                setPreviousScreen('check'); // 在庫確認画面から来たことを記録
                fetchMovements();
                setSelected('history');
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <FaHistory className="mr-2" />
              移動履歴
            </Button>
            <Button 
              onClick={() => setSelected(null)}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
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
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品名</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">保管場所</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">在庫数</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">単価</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">在庫価値</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最終更新</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryList.map((stock, index) => {
                const status = getInventoryStatus(stock);
                return (
                  <tr key={stock.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{stock.product_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {stock.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.storing_place || '未設定'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{stock.stock_quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥{parseFloat(stock.unit_price).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ¥{(stock.stock_quantity * parseFloat(stock.unit_price)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`${STATUS_CONFIG[status]?.color} ${STATUS_CONFIG[status]?.textColor}`}>
                        {STATUS_CONFIG[status]?.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(stock.updated_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                          <FaEye className="mr-1" />
                          詳細
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
                          onClick={() => {
                            setPreviousScreen('check'); // 在庫確認画面から来たことを記録
                            fetchMovements();
                            setSelected('history');
                          }}
                        >
                          <FaHistory className="mr-1" />
                          履歴
                        </Button>
                        {isAdmin && (
                          <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                            <FaEdit className="mr-1" />
                            編集
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-600 rounded-full">
                <FaClipboardList className="text-xl text-white" />
              </div>
              <div>
                <CardTitle className="text-purple-900 text-xl">在庫移動履歴</CardTitle>
                <p className="text-purple-700 text-sm">全{movements.length}件の移動記録</p>
              </div>
            </div>
            <Button 
              onClick={() => setSelected(previousScreen)}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <FaArrowLeft className="mr-2" />
              戻る
            </Button>
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
          {renderStatsCards()}

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
        </div>
      </div>
    </div>
  );
};

export default Inventory; 