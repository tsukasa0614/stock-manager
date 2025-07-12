import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AlertBanner } from "../components/alerts/AlertBanner";
import { FaBoxOpen, FaTruck, FaArrowUp, FaMapMarkerAlt, FaClipboardList, FaChartBar, FaBell, FaExclamationTriangle } from "react-icons/fa";
import { UserModeSwitch } from "../components/common/UserModeSwitch";
import { useAuth } from "../hooks/useAuth";
import { useAlert } from "../contexts/AlertContext";
import { apiClient, type InventoryItem } from "../api/client";
import { Badge } from "../components/ui/badge";
import { FaHistory, FaArrowDown, FaPlus, FaWarehouse } from "react-icons/fa";
import { FaClipboardCheck } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";

// 今日の実績データ
const todayStats = {
  received: 156,
  shipped: 89,
  registered: 12,
  stocktaking: 2
};

// 在庫ステータス
const stockStatus = {
  outOfStock: 8,
  lowStock: 23,
  normal: 145,
  overStock: 12
};

// 倉庫別状況
const warehouseStatus = [
  { name: "倉庫A", usage: 85, capacity: "高", items: 45 },
  { name: "倉庫B", usage: 62, capacity: "中", items: 38 },
  { name: "倉庫C", usage: 34, capacity: "低", items: 22 }
];

// 最近の棚卸結果
const recentStocktaking = [
  { date: "2024-05-20", items: 150, differences: 8, accuracy: 95 },
  { date: "2024-05-15", items: 145, differences: 12, accuracy: 92 },
  { date: "2024-05-10", items: 160, differences: 5, accuracy: 97 }
];

const dummyAlerts = [
  { id: 1, message: "商品Aの在庫が不足しています", status: "未対応", time: "10分前", severity: "high" },
  { id: 2, message: "商品Bの在庫が残り僅かです", status: "対応中", time: "30分前", severity: "medium" },
  { id: 3, message: "倉庫Aの使用率が85%を超えました", status: "未対応", time: "1時間前", severity: "medium" },
  { id: 4, message: "商品Dの棚卸で差異が発見されました", status: "対応中", time: "2時間前", severity: "low" },
  { id: 5, message: "商品Eの在庫が最低在庫を下回りました", status: "未対応", time: "3時間前", severity: "high" },
  { id: 6, message: "倉庫Bの温度が基準値を超えています", status: "対応中", time: "4時間前", severity: "medium" },
];

const dummyActivities = [
  { id: 1, user: "山田太郎", action: "商品Aを50個入荷", time: "10分前", type: "入荷" },
  { id: 2, user: "佐藤花子", action: "商品Bを20個出荷", time: "30分前", type: "出荷" },
  { id: 3, user: "鈴木一郎", action: "新商品「商品C」を登録", time: "1時間前", type: "登録" },
  { id: 4, user: "高橋次郎", action: "倉庫Aの棚卸を完了", time: "2時間前", type: "棚卸" },
  { id: 5, user: "田中美咲", action: "商品Dを30個入荷", time: "3時間前", type: "入荷" },
  { id: 6, user: "佐々木健", action: "商品Eを10個出荷", time: "4時間前", type: "出荷" },
  { id: 7, user: "伊藤雅子", action: "倉庫Bの整理を実施", time: "5時間前", type: "整理" },
  { id: 8, user: "渡辺直樹", action: "商品Fの価格を更新", time: "6時間前", type: "更新" },
];

const Home: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const { user } = useAuth();
  const { alerts, unreadCount, criticalCount, generateAlertsFromInventory } = useAlert();
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 在庫データを取得し、アラートを生成
  useEffect(() => {
    const fetchInventoryAndGenerateAlerts = async () => {
      try {
        const response = await apiClient.getInventory("");
        if (response && Array.isArray(response) && isMountedRef.current) {
          setInventoryList(response);
          // 在庫データからアラートを生成
          generateAlertsFromInventory(response);
        }
      } catch (error) {
        console.error('在庫データの取得に失敗しました:', error);
      }
    };

    fetchInventoryAndGenerateAlerts();
    
    // 5分ごとに在庫データを確認してアラートを生成
    const interval = setInterval(fetchInventoryAndGenerateAlerts, 5 * 60 * 1000);
    
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [generateAlertsFromInventory]);

  // 統計データを計算
  const stats = {
    totalItems: inventoryList.length,
    totalQuantity: inventoryList.reduce((sum, item) => sum + item.stock_quantity, 0),
    totalValue: inventoryList.reduce((sum, item) => sum + (item.stock_quantity * parseFloat(item.unit_price)), 0),
    lowStockItems: inventoryList.filter(item => item.stock_quantity <= item.lowest_stock).length,
    outOfStockItems: inventoryList.filter(item => item.stock_quantity === 0).length,
    alertsUnread: unreadCount,
    alertsCritical: criticalCount
  };

  const overStockItems = inventoryList.filter(item => item.stock_quantity > item.lowest_stock * 3).length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "入荷": return "text-green-600";
      case "出荷": return "text-blue-600";
      case "登録": return "text-purple-600";
      case "棚卸": return "text-orange-600";
      case "整理": return "text-indigo-600";
      case "更新": return "text-pink-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">在庫管理システム</h1>
          <p className="text-gray-600">現在時刻: {currentTime}</p>
          <div className="mt-4 flex justify-center">
            <UserModeSwitch />
          </div>
        </div>

        {/* アラート通知バナー */}
        <div className="mb-8">
          <AlertBanner maxVisible={3} />
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-3xl font-bold text-red-800">{stats.lowStockItems + stats.outOfStockItems}</p>
                </div>
                <FaExclamationTriangle className="text-4xl text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* アラート統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">未読アラート</p>
                  <p className="text-3xl font-bold text-orange-800">{stats.alertsUnread}</p>
                  <p className="text-orange-600 text-xs">確認が必要な通知</p>
                </div>
                <FaBell className="text-4xl text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">緊急アラート</p>
                  <p className="text-3xl font-bold text-yellow-800">{stats.alertsCritical}</p>
                  <p className="text-yellow-600 text-xs">即座に対応が必要</p>
                </div>
                <FaExclamationTriangle className="text-4xl text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* メインコンテンツエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* 在庫状況 */}
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-indigo-900 text-xl flex items-center gap-2">
                <FaBoxOpen className="text-indigo-600" />
                在庫状況
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaExclamationTriangle className="text-red-500" />
                    <span className="text-sm">在庫切れ</span>
                  </div>
                  <span className="font-bold text-red-600">{stats.outOfStockItems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaExclamationTriangle className="text-yellow-500" />
                    <span className="text-sm">在庫少</span>
                  </div>
                  <span className="font-bold text-yellow-600">{stats.lowStockItems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaBoxOpen className="text-green-500" />
                    <span className="text-sm">適正在庫</span>
                  </div>
                  <span className="font-bold text-green-600">{stats.totalItems - stats.outOfStockItems - stats.lowStockItems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaBoxOpen className="text-blue-500" />
                    <span className="text-sm">在庫過多</span>
                  </div>
                  <span className="font-bold text-blue-600">{overStockItems}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={() => navigate('/inventory')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <FaBoxOpen className="mr-2" />
              在庫確認
            </Button>
            <Button 
              onClick={() => navigate('/inventory/register')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <FaPlus className="mr-2" />
              商品登録
            </Button>
            <Button 
              onClick={() => navigate('/movement')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <FaHistory className="mr-2" />
              移動管理
            </Button>
            <Button 
              onClick={() => navigate('/report')}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <FaChartBar className="mr-2" />
              レポート
            </Button>
          </div>
        </div>

        {/* アラート・活動履歴・棚卸結果 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* アラート履歴 */}
          <Card className="shadow-xl bg-white border-0">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200">
              <CardTitle className="text-yellow-900 text-base md:text-lg flex items-center gap-2">
                <FaBell />
                重要アラート
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <div className="space-y-2 md:space-y-3 max-h-64 md:max-h-80 overflow-y-auto">
                {dummyAlerts.slice(0, 4).map(alert => (
                  <div key={alert.id} className={`p-2 md:p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs md:text-sm font-medium">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{alert.status}</Badge>
                          <span className="text-xs text-gray-500">{alert.time}</span>
                        </div>
                      </div>
                      {alert.severity === "high" && <FaExclamationTriangle className="text-red-500 mt-1 flex-shrink-0" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 最近の活動 */}
          <Card className="shadow-xl bg-white border-0">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200">
              <CardTitle className="text-yellow-900 text-base md:text-lg flex items-center gap-2">
                <FaHistory />
                最近の活動
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <div className="space-y-2 md:space-y-3 max-h-64 md:max-h-80 overflow-y-auto">
                {dummyActivities.slice(0, 6).map(activity => (
                  <div key={activity.id} className="flex items-center gap-2 md:gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUsers className="text-blue-500 text-xs md:text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm">
                        <span className="font-medium text-blue-700">{activity.user}</span>
                        <span className="mx-1">が</span>
                        <span className={getTypeColor(activity.type)}>{activity.action}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 最近の棚卸結果 */}
          <Card className="shadow-xl bg-white border-0">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200">
              <CardTitle className="text-yellow-900 text-base md:text-lg flex items-center gap-2">
                <FaClipboardCheck />
                棚卸結果
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <div className="space-y-3 md:space-y-4">
                {recentStocktaking.map((result, index) => (
                  <div key={index} className="p-2 md:p-3 bg-indigo-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs md:text-sm font-medium">{result.date}</span>
                      <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                        {result.accuracy}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>対象: {result.items}品目</div>
                      <div>差異: {result.differences}件</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home; 