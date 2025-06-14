import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { FaBoxOpen, FaTruck, FaArrowUp, FaMapMarkerAlt, FaClipboardList, FaChartBar, FaPlus, FaEdit, FaEye } from "react-icons/fa";
import { UserModeSwitch } from "../components/common/UserModeSwitch";
import { useAuth } from "../hooks/useAuth";

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
];

type StockStatus = "normal" | "low" | "out" | "high";

interface StockItem {
  id: number;
  name: string;
  location: string;
  quantity: number;
  updated: string;
  status: StockStatus;
  category: string;
  unitPrice: number;
}

const dummyStock: StockItem[] = [
  { id: 1, name: "商品A", location: "倉庫A-1", quantity: 120, updated: "2024-05-21", status: "normal", category: "食品", unitPrice: 150 },
  { id: 2, name: "商品B", location: "倉庫A-2", quantity: 80, updated: "2024-05-20", status: "normal", category: "飲料", unitPrice: 200 },
  { id: 3, name: "商品C", location: "倉庫B-1", quantity: 15, updated: "2024-05-19", status: "low", category: "食品", unitPrice: 180 },
  { id: 4, name: "商品D", location: "倉庫B-2", quantity: 0, updated: "2024-05-18", status: "out", category: "日用品", unitPrice: 300 },
  { id: 5, name: "商品E", location: "倉庫C-1", quantity: 45, updated: "2024-05-17", status: "normal", category: "飲料", unitPrice: 120 },
  { id: 6, name: "商品F", location: "倉庫C-2", quantity: 8, updated: "2024-05-16", status: "low", category: "食品", unitPrice: 250 },
  { id: 7, name: "商品G", location: "倉庫A-1", quantity: 200, updated: "2024-05-15", status: "high", category: "日用品", unitPrice: 100 },
  { id: 8, name: "商品H", location: "倉庫B-1", quantity: 95, updated: "2024-05-14", status: "normal", category: "飲料", unitPrice: 180 },
];

const STATUS_CONFIG: Record<StockStatus, { label: string; color: string; textColor: string }> = {
  normal: { label: "適正", color: "bg-emerald-100", textColor: "text-emerald-700" },
  low: { label: "少ない", color: "bg-yellow-100", textColor: "text-yellow-700" },
  out: { label: "在庫切れ", color: "bg-red-100", textColor: "text-red-700" },
  high: { label: "過多", color: "bg-blue-100", textColor: "text-blue-700" }
};

const Inventory: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = user?.role === "admin";

  // 統計データ
  const stats = {
    totalItems: dummyStock.length,
    totalQuantity: dummyStock.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: dummyStock.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
    lowStockItems: dummyStock.filter(item => item.status === "low" || item.status === "out").length,
  };

  const handleMenuClick = (key: string) => {
    if (key === "register") {
      navigate("/inventory/register");
    } else {
      setSelected(key);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className="text-blue-700 text-sm">全{dummyStock.length}商品の詳細情報</p>
            </div>
          </div>
          <Button 
            onClick={() => setSelected(null)}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            メニューに戻る
          </Button>
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
              {dummyStock.map((stock, index) => (
                <tr key={stock.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{stock.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {stock.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{stock.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥{stock.unitPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ¥{(stock.quantity * stock.unitPrice).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`${STATUS_CONFIG[stock.status].color} ${STATUS_CONFIG[stock.status].textColor}`}>
                      {STATUS_CONFIG[stock.status].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.updated}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                        <FaEye className="mr-1" />
                        詳細
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
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

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
          {selected === "check" && renderInventoryTable()}
          {selected === "receiving" && (
            <Card className="shadow-xl bg-white border-0">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200">
                <CardTitle className="text-emerald-900 text-xl">在庫入荷</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600">在庫入荷機能を実装予定です。</p>
                <Button 
                  onClick={() => setSelected(null)}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  メニューに戻る
                </Button>
              </CardContent>
            </Card>
          )}
          {selected === "shipping" && (
            <Card className="shadow-xl bg-white border-0">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                <CardTitle className="text-orange-900 text-xl">在庫出荷</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600">在庫出荷機能を実装予定です。</p>
                <Button 
                  onClick={() => setSelected(null)}
                  className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  メニューに戻る
                </Button>
              </CardContent>
            </Card>
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
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  メニューに戻る
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