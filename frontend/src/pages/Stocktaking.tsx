import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  FaBoxOpen, 
  FaCheckCircle, 
  FaHistory, 
  FaChartLine,
  FaClipboardCheck,
  FaPlay,
  FaStop,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaClock,
  FaSearch,
  FaCalendarAlt
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

// 棚卸データの型定義
interface InventoryItem {
  id: number;
  code: string;
  name: string;
  category: string;
  location: string;
  unit: string;
  theoreticalStock: number; // 理論在庫
  actualStock: number | null; // 実際在庫（未入力時はnull）
  unitPrice: number;
}

interface StocktakingSession {
  id: string;
  startDate: string;
  endDate?: string;
  status: "進行中" | "完了";
  totalItems: number;
  checkedItems: number;
}

// ダミーデータ
const dummyInventoryItems: InventoryItem[] = [
  { id: 1, code: "PROD-001", name: "商品A", category: "食品", location: "倉庫A-1", unit: "個", theoreticalStock: 120, actualStock: null, unitPrice: 100 },
  { id: 2, code: "PROD-002", name: "商品B", category: "飲料", location: "倉庫A-2", unit: "箱", theoreticalStock: 80, actualStock: null, unitPrice: 200 },
  { id: 3, code: "PROD-003", name: "商品C", category: "食品", location: "倉庫B-1", unit: "個", theoreticalStock: 50, actualStock: null, unitPrice: 150 },
  { id: 4, code: "PROD-004", name: "商品D", category: "日用品", location: "倉庫B-2", unit: "セット", theoreticalStock: 30, actualStock: null, unitPrice: 300 },
  { id: 5, code: "PROD-005", name: "商品E", category: "飲料", location: "倉庫C-1", unit: "箱", theoreticalStock: 25, actualStock: null, unitPrice: 180 },
  { id: 6, code: "PROD-006", name: "商品F", category: "食品", location: "倉庫C-2", unit: "個", theoreticalStock: 100, actualStock: null, unitPrice: 120 },
  { id: 7, code: "PROD-007", name: "商品G", category: "日用品", location: "倉庫D-1", unit: "セット", theoreticalStock: 40, actualStock: null, unitPrice: 250 },
  { id: 8, code: "PROD-008", name: "商品H", category: "飲料", location: "倉庫D-2", unit: "箱", theoreticalStock: 60, actualStock: null, unitPrice: 190 },
];

const dummyStocktakingSessions: StocktakingSession[] = [
  { id: "session-1", startDate: "2024-01-15", endDate: "2024-01-18", status: "完了", totalItems: 8, checkedItems: 8 },
  { id: "session-2", startDate: "2024-01-20", status: "進行中", totalItems: 8, checkedItems: 5 },
];

const Stocktaking: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(dummyInventoryItems);
  const [currentSession, setCurrentSession] = useState<StocktakingSession | null>(
    dummyStocktakingSessions.find(s => s.status === "進行中") || null
  );
  const [sessions, setSessions] = useState<StocktakingSession[]>(dummyStocktakingSessions);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { user } = useAuth();

  // 統計データ
  const stats = {
    totalItems: inventoryItems.length,
    checkedItems: inventoryItems.filter(item => item.actualStock !== null).length,
    matchedItems: inventoryItems.filter(item => item.actualStock === item.theoreticalStock).length,
    discrepancyItems: inventoryItems.filter(item => item.actualStock !== null && item.actualStock !== item.theoreticalStock).length,
  };

  // フィルタリング
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "checked" && item.actualStock !== null) ||
                         (statusFilter === "unchecked" && item.actualStock === null);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // 棚卸しセッション開始
  const startSession = () => {
    const newSession: StocktakingSession = {
      id: `session-${Date.now()}`,
      startDate: new Date().toISOString().split('T')[0],
      status: "進行中",
      totalItems: inventoryItems.length,
      checkedItems: 0
    };
    setSessions([...sessions, newSession]);
    setCurrentSession(newSession);
    
    // 実際在庫をリセット
    setInventoryItems(items => items.map(item => ({ ...item, actualStock: null })));
  };

  // 棚卸しセッション終了
  const endSession = () => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        endDate: new Date().toISOString().split('T')[0],
        status: "完了" as const,
        checkedItems: stats.checkedItems
      };
      setSessions(sessions.map(s => s.id === currentSession.id ? updatedSession : s));
      setCurrentSession(null);
    }
  };

  // 実際在庫の更新
  const updateActualStock = (id: number, actualStock: number) => {
    setInventoryItems(items =>
      items.map(item =>
        item.id === id ? { ...item, actualStock } : item
      )
    );
  };

  // 差異のステータス取得
  const getDiscrepancyStatus = (item: InventoryItem) => {
    if (item.actualStock === null) return "未確認";
    if (item.actualStock === item.theoreticalStock) return "一致";
    if (item.actualStock > item.theoreticalStock) return "過多";
    return "不足";
  };

  // 差異の色取得
  const getDiscrepancyColor = (item: InventoryItem) => {
    const status = getDiscrepancyStatus(item);
    switch (status) {
      case "一致":
        return "bg-green-100 text-green-800";
      case "過多":
        return "bg-blue-100 text-blue-800";
      case "不足":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200">
      <div className="container mx-auto py-6 space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <FaClipboardCheck className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                  棚卸管理
                </h1>
                <p className="text-gray-600">Stock Taking Management</p>
              </div>
            </div>
            {!currentSession ? (
              <Button
                onClick={startSession}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <FaPlay />
                棚卸開始
              </Button>
            ) : (
              <Button
                onClick={endSession}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <FaStop />
                棚卸終了
              </Button>
            )}
          </div>

          {/* 現在のセッション情報 */}
          {currentSession && (
            <Card className="mb-8 shadow-xl bg-white border-0">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                <CardTitle className="text-orange-900 text-lg flex items-center gap-2">
                  <FaClock />
                  現在の棚卸作業
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.checkedItems}</div>
                      <div className="text-sm text-gray-500">確認済み</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.totalItems}</div>
                      <div className="text-sm text-gray-500">総商品数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{Math.round((stats.checkedItems / stats.totalItems) * 100)}%</div>
                      <div className="text-sm text-gray-500">進捗率</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-100 text-orange-800">
                      {currentSession.status}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      開始日: {currentSession.startDate}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">総商品数</p>
                    <p className="text-2xl font-bold text-orange-700">{stats.totalItems}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <FaBoxOpen className="text-orange-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">確認済み</p>
                    <p className="text-2xl font-bold text-orange-700">{stats.checkedItems}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <FaCheckCircle className="text-orange-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">一致</p>
                    <p className="text-2xl font-bold text-orange-700">{stats.matchedItems}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <FaEquals className="text-orange-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">差異</p>
                    <p className="text-2xl font-bold text-orange-700">{stats.discrepancyItems}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <FaChartLine className="text-orange-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* フィルター・検索 */}
          <Card className="mb-8 shadow-xl bg-white border-0">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
              <CardTitle className="text-orange-900 text-lg flex items-center gap-2">
                <FaSearch />
                検索・フィルター
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">商品検索</label>
                  <input
                    type="text"
                    placeholder="商品名または商品コード..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="all">すべて</option>
                    <option value="食品">食品</option>
                    <option value="飲料">飲料</option>
                    <option value="日用品">日用品</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="all">すべて</option>
                    <option value="checked">確認済み</option>
                    <option value="unchecked">未確認</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 棚卸商品リスト */}
          <Card className="shadow-xl bg-white border-0">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
              <CardTitle className="text-orange-900 text-lg flex items-center gap-2">
                <FaBoxOpen />
                棚卸商品リスト ({filteredItems.length}商品)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-orange-900">商品コード</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-orange-900">商品名</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-orange-900">カテゴリ</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-orange-900">保管場所</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-orange-900">理論在庫</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-orange-900">実際在庫</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-orange-900">差異</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-orange-900">ステータス</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {item.code}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.location}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.theoreticalStock} {item.unit}
                        </td>
                        <td className="px-6 py-4">
                          {currentSession ? (
                            <input
                              type="number"
                              value={item.actualStock || ""}
                              onChange={(e) => updateActualStock(item.id, parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                              placeholder="0"
                            />
                          ) : (
                            <span className="text-sm text-gray-500">
                              {item.actualStock !== null ? `${item.actualStock} ${item.unit}` : "未確認"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {item.actualStock !== null && (
                            <div className="flex items-center gap-2">
                              {item.actualStock > item.theoreticalStock ? (
                                <FaArrowUp className="text-blue-600" />
                              ) : item.actualStock < item.theoreticalStock ? (
                                <FaArrowDown className="text-red-600" />
                              ) : (
                                <FaEquals className="text-green-600" />
                              )}
                              <span className={`font-medium ${
                                item.actualStock > item.theoreticalStock ? 'text-blue-600' :
                                item.actualStock < item.theoreticalStock ? 'text-red-600' :
                                'text-green-600'
                              }`}>
                                {item.actualStock - item.theoreticalStock > 0 ? '+' : ''}
                                {item.actualStock - item.theoreticalStock}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getDiscrepancyColor(item)}>
                            {getDiscrepancyStatus(item)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 棚卸履歴 */}
          <Card className="mt-8 shadow-xl bg-white border-0">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
              <CardTitle className="text-orange-900 text-lg flex items-center gap-2">
                <FaHistory />
                棚卸履歴
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FaCalendarAlt className="text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {session.startDate} {session.endDate && `- ${session.endDate}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          {session.checkedItems} / {session.totalItems} 商品確認済み
                        </div>
                      </div>
                    </div>
                    <Badge className={session.status === "完了" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                      {session.status}
                    </Badge>
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

export default Stocktaking; 