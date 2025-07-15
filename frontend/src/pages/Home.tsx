import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { AlertBanner } from "../components/alerts/AlertBanner";
import { FaBoxOpen, FaClipboardList, FaWarehouse, FaChartBar, FaUsers, FaCog, FaFileAlt, FaTachometerAlt } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { apiClient, type InventoryItem } from "../api/client";

const Home: React.FC = () => {
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { generateAlertsFromInventory } = useAlert();
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  const isAdmin = user?.role === "admin";

  // 在庫データを取得
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const response = await apiClient.getInventories();
        if (response.data && Array.isArray(response.data) && isMountedRef.current) {
          setInventoryList(response.data);
          generateAlertsFromInventory(response.data);
        }
      } catch (error) {
        console.error('在庫データの取得に失敗しました:', error);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchInventoryData();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [generateAlertsFromInventory]);

  // 基本統計を計算
  const stats = {
    totalItems: inventoryList.length,
    totalQuantity: inventoryList.reduce((sum, item) => sum + item.stock_quantity, 0),
    totalValue: inventoryList.reduce((sum, item) => sum + (item.stock_quantity * parseFloat(item.unit_price)), 0),
    lowStockItems: inventoryList.filter(item => item.stock_quantity <= item.lowest_stock).length,
    outOfStockItems: inventoryList.filter(item => item.stock_quantity === 0).length,
  };

  // 管理者機能
  const adminFeatures = [
    {
      title: "在庫管理",
      description: "商品の確認・登録・入出庫",
      icon: <FaBoxOpen className="text-3xl" />,
      color: "from-blue-500 to-blue-600",
      hoverColor: "group-hover:from-blue-600 group-hover:to-blue-700",
      path: "/inventory",
      available: true
    },
    {
      title: "棚卸し",
      description: "在庫の棚卸し作業",
      icon: <FaClipboardList className="text-3xl" />,
      color: "from-orange-500 to-orange-600",
      hoverColor: "group-hover:from-orange-600 group-hover:to-orange-700",
      path: "/stocktaking",
      available: true
    },
    {
      title: "工場管理",
      description: "工場・倉庫の管理",
      icon: <FaWarehouse className="text-3xl" />,
      color: "from-green-500 to-green-600",
      hoverColor: "group-hover:from-green-600 group-hover:to-green-700",
      path: "/factories",
      available: true
    },
    {
      title: "ユーザー管理",
      description: "アカウント・権限管理",
      icon: <FaUsers className="text-3xl" />,
      color: "from-red-500 to-red-600",
      hoverColor: "group-hover:from-red-600 group-hover:to-red-700",
      path: "/users",
      available: user?.is_superuser === true
    },
    {
      title: "レポート",
      description: "統計・分析レポート",
      icon: <FaFileAlt className="text-3xl" />,
      color: "from-indigo-500 to-indigo-600",
      hoverColor: "group-hover:from-indigo-600 group-hover:to-indigo-700",
      path: "/reports",
      available: true
    },
    {
      title: "システム設定",
      description: "全体設定・管理",
      icon: <FaCog className="text-3xl" />,
      color: "from-purple-500 to-purple-600",
      hoverColor: "group-hover:from-purple-600 group-hover:to-purple-700",
      path: "/settings",
      available: true
    }
  ];

  // 一般ユーザー機能
  const userFeatures = [
    {
      title: "在庫確認",
      description: "商品の在庫状況を確認",
      icon: <FaBoxOpen className="text-3xl" />,
      color: "from-blue-500 to-blue-600",
      hoverColor: "group-hover:from-blue-600 group-hover:to-blue-700",
      path: "/inventory",
      available: user?.managed_factories?.some(f => f.permissions?.inventory)
    },
    {
      title: "棚卸し",
      description: "在庫の棚卸し作業",
      icon: <FaClipboardList className="text-3xl" />,
      color: "from-orange-500 to-orange-600",
      hoverColor: "group-hover:from-orange-600 group-hover:to-orange-700",
      path: "/stocktaking",
      available: user?.managed_factories?.some(f => f.permissions?.stocktaking)
    },
    {
      title: "レポート",
      description: "在庫レポートの確認",
      icon: <FaFileAlt className="text-3xl" />,
      color: "from-indigo-500 to-indigo-600",
      hoverColor: "group-hover:from-indigo-600 group-hover:to-indigo-700",
      path: "/reports",
      available: user?.managed_factories?.some(f => f.permissions?.reports)
    }
  ];

  // 表示する機能を選択
  const features = isAdmin ? adminFeatures : userFeatures;
  const availableFeatures = features.filter(feature => feature.available);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200">
      <div className="container mx-auto py-6 space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                <FaTachometerAlt className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                  ダッシュボード
                </h1>
                <p className="text-gray-600">Dashboard</p>
              </div>
            </div>
          </div>

          {/* アラート表示 */}
          <div className="mb-8">
            <AlertBanner maxVisible={3} />
          </div>

          {/* 基本統計 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">総商品数</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalItems}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FaBoxOpen className="text-yellow-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">総在庫数</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalQuantity}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FaWarehouse className="text-yellow-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">総在庫価値</p>
                    <p className="text-2xl font-bold text-gray-800">¥{stats.totalValue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FaChartBar className="text-yellow-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">在庫不足</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.lowStockItems}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FaClipboardList className="text-yellow-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 機能カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => navigate(feature.path)}
              >
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-r ${feature.color} ${feature.hoverColor} p-6 text-white transition-all duration-300`}>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl text-white drop-shadow-lg group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-white drop-shadow-sm">{feature.title}</h3>
                        <p className="text-white/95 text-sm drop-shadow-sm">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 