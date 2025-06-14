import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserModeSwitch } from "../components/common/UserModeSwitch";
import { useAuth } from "../hooks/useAuth";
import { 
  FaIndustry, 
  FaWarehouse, 
  FaMapMarkerAlt, 
  FaChartLine, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaArrowRight,
  FaMap,
  FaGripVertical,
  FaBoxes,
  FaCog,
  FaChevronRight
} from "react-icons/fa";
import Draggable from "react-draggable";
import { Resizable } from "react-resizable";
import type { ResizeCallbackData } from "react-resizable";
import "react-resizable/css/styles.css";

interface ShelfItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  items: Array<{
    id: string;
    number: string;
    name: string;
  }>;
}

interface Warehouse {
  id: string;
  name: string;
  status: "active" | "inactive" | "maintenance";
  shelfCount: number;
  totalItems: number;
  lastUpdated: string;
  map?: {
    width: number;
    height: number;
    shelves: ShelfItem[];
  };
}

interface Factory {
  id: string;
  name: string;
  address: string;
  totalWarehouses: number;
  totalShelves: number;
  status: "active" | "inactive";
  lastUpdated: string;
  warehouses: Warehouse[];
}

const STATUS_CONFIG = {
  active: { label: "稼働中", color: "bg-emerald-100", textColor: "text-emerald-700" },
  inactive: { label: "停止中", color: "bg-gray-100", textColor: "text-gray-700" },
  maintenance: { label: "メンテナンス", color: "bg-amber-100", textColor: "text-amber-700" }
};

// モックデータ
const mockFactories: Factory[] = [
  {
    id: "1",
    name: "東京第一工場",
    address: "東京都千代田区丸の内1-1-1",
    totalWarehouses: 3,
    totalShelves: 15,
    status: "active",
    lastUpdated: "2024-01-15",
    warehouses: [
      { 
        id: "1-1", 
        name: "A棟倉庫", 
        status: "active", 
        shelfCount: 8,
        totalItems: 245,
        lastUpdated: "2024-01-15",
        map: {
          width: 800,
          height: 600,
          shelves: [
            { id: "s1", x: 100, y: 100, width: 200, height: 100, name: "A-1", items: [] },
            { id: "s2", x: 350, y: 100, width: 200, height: 100, name: "A-2", items: [] },
            { id: "s3", x: 100, y: 250, width: 200, height: 100, name: "B-1", items: [] },
            { id: "s4", x: 350, y: 250, width: 200, height: 100, name: "B-2", items: [] },
          ]
        }
      },
      { 
        id: "1-2", 
        name: "B棟倉庫", 
        status: "maintenance", 
        shelfCount: 5,
        totalItems: 123,
        lastUpdated: "2024-01-10",
        map: {
          width: 800,
          height: 600,
          shelves: [
            { id: "s5", x: 100, y: 100, width: 200, height: 100, name: "C-1", items: [] },
            { id: "s6", x: 350, y: 100, width: 200, height: 100, name: "C-2", items: [] },
          ]
        }
      },
      { 
        id: "1-3", 
        name: "C棟倉庫", 
        status: "active", 
        shelfCount: 2,
        totalItems: 67,
        lastUpdated: "2024-01-14",
        map: {
          width: 800,
          height: 600,
          shelves: [
            { id: "s7", x: 100, y: 100, width: 200, height: 100, name: "D-1", items: [] },
          ]
        }
      },
    ],
  },
  {
    id: "2",
    name: "大阪第二工場",
    address: "大阪府大阪市北区梅田2-2-2",
    totalWarehouses: 2,
    totalShelves: 12,
    status: "active",
    lastUpdated: "2024-01-12",
    warehouses: [
      { 
        id: "2-1", 
        name: "メイン倉庫", 
        status: "active", 
        shelfCount: 8,
        totalItems: 312,
        lastUpdated: "2024-01-12",
        map: {
          width: 800,
          height: 600,
          shelves: [
            { id: "s8", x: 100, y: 100, width: 200, height: 100, name: "E-1", items: [] },
            { id: "s9", x: 350, y: 100, width: 200, height: 100, name: "E-2", items: [] },
          ]
        }
      },
      { 
        id: "2-2", 
        name: "サブ倉庫", 
        status: "inactive", 
        shelfCount: 4,
        totalItems: 89,
        lastUpdated: "2024-01-08",
        map: {
          width: 800,
          height: 600,
          shelves: []
        }
      },
    ],
  },
];

type ViewMode = "overview" | "factories" | "warehouses" | "map";

const Factories: React.FC = () => {
  const [factories, setFactories] = useState<Factory[]>(mockFactories);
  const [currentView, setCurrentView] = useState<ViewMode>("overview");
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  // 統計データ
  const stats = {
    totalFactories: factories.length,
    totalWarehouses: factories.reduce((sum, f) => sum + f.totalWarehouses, 0),
    totalShelves: factories.reduce((sum, f) => sum + f.totalShelves, 0),
    activeFactories: factories.filter(f => f.status === "active").length,
  };

  // 工場を選択
  const selectFactory = (factory: Factory) => {
    setSelectedFactory(factory);
    setCurrentView("warehouses");
  };

  // 倉庫を選択
  const selectWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setCurrentView("map");
  };

  // マップレンダリング
  const renderWarehouseMap = (warehouse: Warehouse) => {
    if (!warehouse.map) return null;

    return (
      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 overflow-hidden shadow-inner" 
           style={{ width: warehouse.map.width, height: warehouse.map.height }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        {warehouse.map.shelves.map(shelf => (
          <Draggable
            key={shelf.id}
            position={{ x: shelf.x, y: shelf.y }}
            bounds="parent"
            disabled={!isAdmin}
          >
                                          <div
                  className="absolute bg-white border-2 border-indigo-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:shadow-lg transition-all duration-200 group"
                  style={{
                    width: shelf.width,
                    height: shelf.height,
                  }}
                >
                  <div className="flex flex-col items-center">
                    <FaGripVertical className="text-indigo-400 mb-1 group-hover:text-indigo-600" />
                    <span className="text-sm font-semibold text-indigo-900">{shelf.name}</span>
                    <span className="text-xs text-indigo-600">{shelf.items.length} 商品</span>
                  </div>
                </div>
          </Draggable>
        ))}
      </div>
    );
  };

  // オーバービュー画面
  const renderOverview = () => (
    <div className="space-y-8">
      {/* 統計カード */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
           <CardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-blue-600 text-sm font-medium">総工場数</p>
                 <p className="text-3xl font-bold text-blue-800">{stats.totalFactories}</p>
               </div>
               <FaIndustry className="text-4xl text-blue-400" />
             </div>
           </CardContent>
         </Card>
         
         <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg">
           <CardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-emerald-600 text-sm font-medium">総倉庫数</p>
                 <p className="text-3xl font-bold text-emerald-800">{stats.totalWarehouses}</p>
               </div>
               <FaWarehouse className="text-4xl text-emerald-400" />
             </div>
           </CardContent>
         </Card>
         
         <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
           <CardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-purple-600 text-sm font-medium">総棚数</p>
                 <p className="text-3xl font-bold text-purple-800">{stats.totalShelves}</p>
               </div>
               <FaBoxes className="text-4xl text-purple-400" />
             </div>
           </CardContent>
         </Card>
         
         <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
           <CardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-orange-600 text-sm font-medium">稼働率</p>
                 <p className="text-3xl font-bold text-orange-800">{Math.round((stats.activeFactories / stats.totalFactories) * 100)}%</p>
               </div>
               <FaChartLine className="text-4xl text-orange-400" />
             </div>
           </CardContent>
         </Card>
       </div>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-4">
                 <Button 
           onClick={() => setCurrentView("factories")}
           className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-6 text-lg font-semibold"
         >
           <FaIndustry className="mr-3 text-xl" />
           工場一覧を見る
           <FaArrowRight className="ml-3" />
         </Button>
         
         {isAdmin && (
           <Button 
             className="bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-6 text-lg font-semibold"
           >
             <FaPlus className="mr-3 text-xl" />
             新規工場追加
           </Button>
         )}
      </div>
    </div>
  );

  // 工場一覧画面
  const renderFactories = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">工場一覧</h2>
        <Button 
          variant="outline"
          onClick={() => setCurrentView("overview")}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          オーバービューに戻る
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {factories.map((factory) => (
          <Card key={factory.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${STATUS_CONFIG[factory.status].color}`}>
                    <FaIndustry className={`text-xl ${STATUS_CONFIG[factory.status].textColor}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">{factory.name}</CardTitle>
                    <p className="text-sm text-gray-600">{factory.address}</p>
                  </div>
                </div>
                <Badge className={`${STATUS_CONFIG[factory.status].color} ${STATUS_CONFIG[factory.status].textColor}`}>
                  {STATUS_CONFIG[factory.status].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{factory.totalWarehouses}</div>
                  <div className="text-sm text-gray-500">倉庫</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{factory.totalShelves}</div>
                  <div className="text-sm text-gray-500">棚</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {factory.warehouses.reduce((sum, w) => sum + w.totalItems, 0)}
                  </div>
                  <div className="text-sm text-gray-500">商品</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  最終更新: {factory.lastUpdated}
                </div>
                <Button 
                  onClick={() => selectFactory(factory)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white group-hover:bg-indigo-700 transition-colors"
                >
                  <FaEye className="mr-2" />
                  詳細を見る
                  <FaChevronRight className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // 倉庫一覧画面
  const renderWarehouses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{selectedFactory?.name}</h2>
          <p className="text-gray-600">{selectedFactory?.address}</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => setCurrentView("factories")}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          工場一覧に戻る
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">倉庫名</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">棚数</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品数</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最終更新</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {selectedFactory?.warehouses.map((warehouse, index) => (
              <tr key={warehouse.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${STATUS_CONFIG[warehouse.status].color} mr-3`}>
                      <FaWarehouse className={`text-sm ${STATUS_CONFIG[warehouse.status].textColor}`} />
                    </div>
                    <div className="text-sm font-medium text-gray-900">{warehouse.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`${STATUS_CONFIG[warehouse.status].color} ${STATUS_CONFIG[warehouse.status].textColor}`}>
                    {STATUS_CONFIG[warehouse.status].label}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warehouse.shelfCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warehouse.totalItems}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warehouse.lastUpdated}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => selectWarehouse(warehouse)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <FaMap className="mr-2" />
                      マップ
                    </Button>
                    {isAdmin && (
                      <>
                        <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                          <FaEdit className="mr-2" />
                          編集
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                          <FaTrash className="mr-2" />
                          削除
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // マップ画面
  const renderMap = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{selectedWarehouse?.name}</h2>
          <p className="text-gray-600">{selectedFactory?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setCurrentView("warehouses")}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            倉庫一覧に戻る
          </Button>
          {isAdmin && (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <FaCog className="mr-2" />
              レイアウト編集
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-white border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 rounded-full">
                <FaMap className="text-xl text-white" />
              </div>
              <div>
                <CardTitle className="text-indigo-900">倉庫レイアウト</CardTitle>
                <p className="text-indigo-700 text-sm">
                  {selectedWarehouse?.shelfCount}個の棚 • {selectedWarehouse?.totalItems}個の商品
                </p>
              </div>
            </div>
            <Badge className={`${STATUS_CONFIG[selectedWarehouse?.status || 'active'].color} ${STATUS_CONFIG[selectedWarehouse?.status || 'active'].textColor}`}>
              {STATUS_CONFIG[selectedWarehouse?.status || 'active'].label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex justify-center">
            {selectedWarehouse && renderWarehouseMap(selectedWarehouse)}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      <div className="container mx-auto py-6 space-y-6">
        {/* ユーザーモード切り替え */}
        <UserModeSwitch />

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                <FaIndustry className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  工場管理システム
                </h1>
                <p className="text-gray-600">Factory Management System</p>
              </div>
            </div>
          </div>

          {currentView === "overview" && renderOverview()}
          {currentView === "factories" && renderFactories()}
          {currentView === "warehouses" && renderWarehouses()}
          {currentView === "map" && renderMap()}
        </div>
      </div>

      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default Factories; 