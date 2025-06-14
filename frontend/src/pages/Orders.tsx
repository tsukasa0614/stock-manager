import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { FaClipboardCheck, FaPlay, FaStop, FaSave, FaHistory, FaSearch, FaBarcode, FaChartLine, FaBoxOpen, FaCalendarAlt, FaCheckCircle, FaClock, FaArrowUp, FaArrowDown, FaEquals } from "react-icons/fa";
import { UserModeSwitch } from "../components/common/UserModeSwitch";
import { useAuth } from "../hooks/useAuth";

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
];

const dummyHistory: StocktakingSession[] = [
  { id: "ST-2024-001", startDate: "2024-01-15", endDate: "2024-01-16", status: "完了", totalItems: 150, checkedItems: 150 },
  { id: "ST-2024-002", startDate: "2024-02-15", endDate: "2024-02-16", status: "完了", totalItems: 145, checkedItems: 145 },
  { id: "ST-2024-003", startDate: "2024-03-15", endDate: "2024-03-17", status: "完了", totalItems: 160, checkedItems: 160 },
];

const categories = ["すべて", "食品", "飲料", "日用品"];
const locations = ["すべて", "倉庫A-1", "倉庫A-2", "倉庫B-1", "倉庫B-2", "倉庫C-1"];

type ViewType = "main" | "stocktaking" | "history" | "summary";

const Stocktaking: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>("main");
  const [items, setItems] = useState<InventoryItem[]>(dummyInventoryItems);
  const [currentSession, setCurrentSession] = useState<StocktakingSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [selectedLocation, setSelectedLocation] = useState("すべて");
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  // フィルタリングされた商品
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "すべて" || item.category === selectedCategory;
    const matchesLocation = selectedLocation === "すべて" || item.location === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // 棚卸開始
  const startStocktaking = () => {
    const session: StocktakingSession = {
      id: `ST-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      startDate: new Date().toISOString().split('T')[0],
      status: "進行中",
      totalItems: items.length,
      checkedItems: 0
    };
    setCurrentSession(session);
    setCurrentView("stocktaking");
  };

  // 棚卸終了
  const endStocktaking = () => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        endDate: new Date().toISOString().split('T')[0],
        status: "完了" as const,
        checkedItems: items.filter(item => item.actualStock !== null).length
      };
      setCurrentSession(null);
      setCurrentView("summary");
    }
  };

  // 実際在庫の更新
  const updateActualStock = (itemId: number, actualStock: number) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, actualStock } : item
    ));
  };

  // 差異計算
  const getDifference = (item: InventoryItem) => {
    if (item.actualStock === null) return null;
    return item.actualStock - item.theoreticalStock;
  };

  // 差異金額計算
  const getDifferenceValue = (item: InventoryItem) => {
    const diff = getDifference(item);
    if (diff === null) return null;
    return diff * item.unitPrice;
  };

  // 進捗計算
  const getProgress = () => {
    const checkedItems = items.filter(item => item.actualStock !== null).length;
    return Math.round((checkedItems / items.length) * 100);
  };

  // 統計データ計算
  const getStats = () => {
    const totalValue = items.reduce((sum, item) => sum + (item.theoreticalStock * item.unitPrice), 0);
    const checkedItems = items.filter(item => item.actualStock !== null);
    const differences = checkedItems.map(item => getDifference(item)).filter(diff => diff !== null);
    const positiveCount = differences.filter(diff => diff! > 0).length;
    const negativeCount = differences.filter(diff => diff! < 0).length;
    const exactCount = differences.filter(diff => diff === 0).length;
    
    return {
      totalItems: items.length,
      totalValue,
      checkedItems: checkedItems.length,
      progress: getProgress(),
      positiveCount,
      negativeCount,
      exactCount
    };
  };

  // メイン画面
  const renderMainView = () => {
    const stats = getStats();
    
    return (
      <div className="space-y-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
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

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">総在庫価値</p>
                  <p className="text-2xl font-bold text-emerald-800">¥{stats.totalValue.toLocaleString()}</p>
                </div>
                <FaChartLine className="text-4xl text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">完了率</p>
                  <p className="text-3xl font-bold text-purple-800">{stats.progress}%</p>
                </div>
                <FaClipboardCheck className="text-4xl text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">確認済み</p>
                  <p className="text-3xl font-bold text-orange-800">{stats.checkedItems}</p>
                </div>
                <FaCheckCircle className="text-4xl text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* メインアクションカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group cursor-pointer hover:scale-105 transition-all duration-300 bg-white shadow-xl hover:shadow-2xl border-0">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    <FaPlay className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">新しい棚卸を開始</h3>
                    <p className="text-blue-100">在庫の実地棚卸を開始します</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <Button 
                  onClick={startStocktaking}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 text-lg font-semibold shadow-lg"
                  disabled={!isAdmin}
                >
                  <FaPlay className="mr-2" />
                  棚卸開始
                </Button>
                {!isAdmin && (
                  <p className="text-xs text-gray-500 mt-2 text-center">※管理者のみ実行可能</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer hover:scale-105 transition-all duration-300 bg-white shadow-xl hover:shadow-2xl border-0"
            onClick={() => setCurrentView("history")}
          >
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    <FaHistory className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">棚卸履歴</h3>
                    <p className="text-emerald-100">過去の棚卸結果を確認</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{dummyHistory.length}</p>
                  <p className="text-sm text-gray-600">件の履歴</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-xl border-0">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    <FaChartLine className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">差異分析</h3>
                    <p className="text-purple-100">在庫差異の詳細分析</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <FaArrowUp className="text-green-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-green-600">{stats.positiveCount}</p>
                    <p className="text-xs text-gray-500">過多</p>
                  </div>
                  <div>
                    <FaEquals className="text-blue-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-blue-600">{stats.exactCount}</p>
                    <p className="text-xs text-gray-500">一致</p>
                  </div>
                  <div>
                    <FaArrowDown className="text-red-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-red-600">{stats.negativeCount}</p>
                    <p className="text-xs text-gray-500">不足</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // 棚卸実行画面
  const renderStocktakingView = () => {
    const progress = getProgress();
    
    return (
      <div className="space-y-6">
        {/* ヘッダー情報 */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <FaClock className="text-xl text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-900">棚卸実行中</h2>
                  <p className="text-blue-700">セッションID: {currentSession?.id}</p>
                  <p className="text-blue-600 text-sm">開始日: {currentSession?.startDate}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-800">{progress}%</p>
                    <p className="text-sm text-blue-600">完了</p>
                  </div>
                  <div className="w-20 h-20">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeDasharray={`${progress}, 100`}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* フィルター */}
        <Card className="shadow-lg bg-white border-0">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="商品名・コードで検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <Button 
                onClick={endStocktaking}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold"
              >
                <FaStop className="mr-2" />
                棚卸終了
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 商品リスト */}
        <Card className="shadow-xl bg-white border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
            <CardTitle className="text-blue-900 text-xl">商品一覧 ({filteredItems.length}件)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品情報</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">保管場所</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">理論在庫</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">実際在庫</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">差異</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状態</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item, index) => {
                    const difference = getDifference(item);
                    const isChecked = item.actualStock !== null;
                    
                    return (
                      <tr key={item.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FaBoxOpen className="text-blue-500" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.code}</div>
                              <Badge variant="outline" className="text-xs mt-1">{item.category}</Badge>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{item.theoreticalStock}{item.unit}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            value={item.actualStock || ""}
                            onChange={(e) => updateActualStock(item.id, parseInt(e.target.value) || 0)}
                            className="w-20 px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {difference !== null && (
                            <div className={`flex items-center gap-1 ${
                              difference > 0 ? 'text-green-600' : 
                              difference < 0 ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              {difference > 0 && <FaArrowUp />}
                              {difference < 0 && <FaArrowDown />}
                              {difference === 0 && <FaEquals />}
                              <span className="font-bold">{Math.abs(difference)}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isChecked ? (
                            <Badge className="bg-green-100 text-green-700">
                              <FaCheckCircle className="mr-1" />
                              完了
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700">
                              <FaClock className="mr-1" />
                              未確認
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 履歴画面
  const renderHistoryView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
            <FaHistory className="text-2xl text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">棚卸履歴</h2>
            <p className="text-gray-600">過去の棚卸セッション一覧</p>
          </div>
        </div>
        <Button 
          onClick={() => setCurrentView("main")}
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          メインに戻る
        </Button>
      </div>

      <div className="grid gap-4">
        {dummyHistory.map((session, index) => (
          <Card key={session.id} className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <FaClipboardCheck className="text-emerald-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{session.id}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt />
                        <span>{session.startDate} - {session.endDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaBoxOpen />
                        <span>{session.totalItems}品目</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">
                      {Math.round((session.checkedItems / session.totalItems) * 100)}%
                    </p>
                    <p className="text-sm text-gray-500">完了率</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">
                    <FaCheckCircle className="mr-1" />
                    {session.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // サマリー画面
  const renderSummaryView = () => {
    const checkedItems = items.filter(item => item.actualStock !== null);
    const totalDifferenceValue = checkedItems.reduce((sum, item) => {
      const diffValue = getDifferenceValue(item);
      return sum + (diffValue || 0);
    }, 0);

    const positiveItems = checkedItems.filter(item => getDifference(item)! > 0);
    const negativeItems = checkedItems.filter(item => getDifference(item)! < 0);
    const exactItems = checkedItems.filter(item => getDifference(item) === 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
              <FaChartLine className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">棚卸結果サマリー</h2>
              <p className="text-gray-600">在庫差異の詳細分析結果</p>
            </div>
          </div>
          <Button 
            onClick={() => setCurrentView("main")}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            メインに戻る
          </Button>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <FaBoxOpen className="text-4xl text-blue-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-blue-800">{checkedItems.length}</p>
              <p className="text-blue-600 font-medium">確認済み商品</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <FaArrowUp className="text-4xl text-green-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-green-800">{positiveItems.length}</p>
              <p className="text-green-600 font-medium">在庫過多</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <FaArrowDown className="text-4xl text-red-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-red-800">{negativeItems.length}</p>
              <p className="text-red-600 font-medium">在庫不足</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <FaEquals className="text-4xl text-emerald-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-emerald-800">{exactItems.length}</p>
              <p className="text-emerald-600 font-medium">在庫一致</p>
            </CardContent>
          </Card>
        </div>

        {/* 金額影響 */}
        <Card className="shadow-xl bg-white border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
            <CardTitle className="text-purple-900 text-xl">金額影響分析</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-4xl font-bold mb-2 text-purple-800">
                {totalDifferenceValue >= 0 ? '+' : ''}¥{totalDifferenceValue.toLocaleString()}
              </p>
              <p className="text-purple-600">総差異金額</p>
              <div className="mt-4 text-sm text-gray-600">
                {totalDifferenceValue > 0 && "在庫過多による資産増加"}
                {totalDifferenceValue < 0 && "在庫不足による資産減少"}
                {totalDifferenceValue === 0 && "差異なし"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 詳細テーブル */}
        <Card className="shadow-xl bg-white border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
            <CardTitle className="text-blue-900 text-xl">差異詳細</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">理論在庫</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">実際在庫</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">差異</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額影響</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {checkedItems.filter(item => getDifference(item) !== 0).map((item, index) => {
                    const difference = getDifference(item)!;
                    const diffValue = getDifferenceValue(item)!;
                    
                    return (
                      <tr key={item.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.code}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.theoreticalStock}{item.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.actualStock}{item.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center gap-1 font-bold ${
                            difference > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {difference > 0 ? <FaArrowUp /> : <FaArrowDown />}
                            {Math.abs(difference)}{item.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`font-bold ${
                            diffValue > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {diffValue >= 0 ? '+' : ''}¥{diffValue.toLocaleString()}
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
      </div>
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
                <FaClipboardCheck className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  棚卸管理システム
                </h1>
                <p className="text-gray-600">Stocktaking Management System</p>
              </div>
            </div>
          </div>

          {/* メイン画面 */}
          {currentView === "main" && renderMainView()}
          {currentView === "stocktaking" && renderStocktakingView()}
          {currentView === "history" && renderHistoryView()}
          {currentView === "summary" && renderSummaryView()}
        </div>
      </div>
    </div>
  );
};

export default Stocktaking; 