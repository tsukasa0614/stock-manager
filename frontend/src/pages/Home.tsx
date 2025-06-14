import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { FaBell, FaHistory, FaArrowDown, FaArrowUp, FaBoxOpen, FaClipboardCheck, FaUsers, FaIndustry, FaPlus, FaEdit, FaSearch, FaChartLine, FaWarehouse, FaThermometerHalf, FaCloudSun, FaFire, FaClock, FaCheckCircle, FaExclamationTriangle, FaTruck, FaCalendarAlt } from "react-icons/fa";
import { UserModeSwitch } from "../components/common/UserModeSwitch";

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
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <div className="container mx-auto py-6 space-y-6">
        {/* 本番では削除: 開発用のユーザー切り替え機能 */}
        <UserModeSwitch />

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl">
                <FaChartLine className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  ダッシュボード
                </h1>
                <p className="text-gray-600">Inventory Management Dashboard</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                {currentTime.toLocaleTimeString('ja-JP')}
              </p>
              <p className="text-sm text-gray-600">
                {currentTime.toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>

          {/* 今日の実績カード */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">今日の入荷</p>
                    <p className="text-3xl font-bold text-blue-800">{todayStats.received}</p>
                    <p className="text-blue-600 text-xs">件</p>
                  </div>
                  <FaArrowDown className="text-4xl text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-600 text-sm font-medium">今日の出荷</p>
                    <p className="text-3xl font-bold text-emerald-800">{todayStats.shipped}</p>
                    <p className="text-emerald-600 text-xs">件</p>
                  </div>
                  <FaArrowUp className="text-4xl text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">新規登録</p>
                    <p className="text-3xl font-bold text-purple-800">{todayStats.registered}</p>
                    <p className="text-purple-600 text-xs">商品</p>
                  </div>
                  <FaPlus className="text-4xl text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">棚卸完了</p>
                    <p className="text-3xl font-bold text-orange-800">{todayStats.stocktaking}</p>
                    <p className="text-orange-600 text-xs">セッション</p>
                  </div>
                  <FaClipboardCheck className="text-4xl text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* メインコンテンツエリア */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 在庫ステータス */}
            <Card className="shadow-xl bg-white border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                <CardTitle className="text-blue-900 text-lg flex items-center gap-2">
                  <FaBoxOpen />
                  在庫ステータス
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">在庫切れ</span>
                    </div>
                    <span className="font-bold text-red-600">{stockStatus.outOfStock}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">在庫少</span>
                    </div>
                    <span className="font-bold text-yellow-600">{stockStatus.lowStock}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">適正在庫</span>
                    </div>
                    <span className="font-bold text-green-600">{stockStatus.normal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">在庫過多</span>
                    </div>
                    <span className="font-bold text-blue-600">{stockStatus.overStock}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 倉庫別状況 */}
            <Card className="shadow-xl bg-white border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
                <CardTitle className="text-purple-900 text-lg flex items-center gap-2">
                  <FaWarehouse />
                  倉庫別状況
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {warehouseStatus.map((warehouse, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{warehouse.name}</span>
                        <span className="text-sm font-bold">{warehouse.usage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            warehouse.usage >= 80 ? 'bg-red-500' :
                            warehouse.usage >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${warehouse.usage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{warehouse.items}品目</span>
                        <span>使用率{warehouse.capacity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* アラート・活動履歴・棚卸結果 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* アラート履歴 */}
            <Card className="shadow-xl bg-white border-0">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
                <CardTitle className="text-red-900 text-lg flex items-center gap-2">
                  <FaBell />
                  重要アラート
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {dummyAlerts.map(alert => (
                    <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{alert.status}</Badge>
                            <span className="text-xs text-gray-500">{alert.time}</span>
                          </div>
                        </div>
                        {alert.severity === "high" && <FaExclamationTriangle className="text-red-500 mt-1" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 最近の活動 */}
            <Card className="shadow-xl bg-white border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <CardTitle className="text-green-900 text-lg flex items-center gap-2">
                  <FaHistory />
                  最近の活動
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {dummyActivities.map(activity => (
                    <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUsers className="text-blue-500 text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
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
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200">
                <CardTitle className="text-indigo-900 text-lg flex items-center gap-2">
                  <FaClipboardCheck />
                  棚卸結果
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentStocktaking.map((result, index) => (
                    <div key={index} className="p-3 bg-indigo-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{result.date}</span>
                        <Badge className="bg-indigo-100 text-indigo-700">
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
    </div>
  );
};

export default Home; 