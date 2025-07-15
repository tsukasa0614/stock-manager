import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import { 
  FaIndustry, 
  FaWarehouse,
  FaChartLine,
  FaPlus, 
  FaEdit, 
  FaEye, 
  FaTrash,
  FaBoxes,
  FaArrowLeft
} from "react-icons/fa";

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
  location: string;
  manager: string;
  totalCapacity: number;
  usedCapacity: number;
}

interface Factory {
  id: string;
  name: string;
  location: string;
  manager: string;
  contactNumber: string;
  warehouseCount: number;
  totalCapacity: number;
  usedCapacity: number;
  status: "active" | "inactive" | "maintenance";
  efficiency: number;
  lastMaintenance: string;
  nextMaintenance: string;
  warehouses: Warehouse[];
}

const Factories: React.FC = () => {
  const [currentView, setCurrentView] = useState<"overview" | "factory-detail" | "warehouse-detail" | "shelf-layout">("overview");
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [editingFactory, setEditingFactory] = useState<Factory | null>(null);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [showFactoryDialog, setShowFactoryDialog] = useState(false);
  const [showWarehouseDialog, setShowWarehouseDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: "factory" | "warehouse", id: string} | null>(null);
  const [showShelfConfigDialog, setShowShelfConfigDialog] = useState(false);
  const [shelves, setShelves] = useState<ShelfItem[]>([]);
  const [selectedShelf, setSelectedShelf] = useState<ShelfItem | null>(null);
  const [newShelfName, setNewShelfName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "maintenance">("all");
  const [sortBy, setSortBy] = useState<"name" | "location" | "efficiency">("name");
  const { user } = useAuth();
  
  const isAdmin = user?.role === "admin";

// モックデータ
  const [factories, setFactories] = useState<Factory[]>([
  {
    id: "1",
      name: "東京工場",
      location: "東京都大田区",
      manager: "田中太郎",
      contactNumber: "03-1234-5678",
      warehouseCount: 3,
      totalCapacity: 10000,
      usedCapacity: 7500,
    status: "active",
      efficiency: 85,
      lastMaintenance: "2024-01-15",
      nextMaintenance: "2024-04-15",
    warehouses: [
      { 
          id: "w1",
          name: "第1倉庫",
        status: "active", 
          shelfCount: 50,
          totalItems: 1200,
          location: "A棟",
          manager: "佐藤花子",
          totalCapacity: 5000,
          usedCapacity: 3500,
      },
      { 
          id: "w2",
          name: "第2倉庫",
        status: "active", 
          shelfCount: 30,
          totalItems: 800,
          location: "B棟",
          manager: "鈴木一郎",
          totalCapacity: 3000,
          usedCapacity: 2000,
      },
    ],
  },
  {
    id: "2",
      name: "大阪工場",
      location: "大阪府堺市",
      manager: "山田次郎",
      contactNumber: "06-9876-5432",
      warehouseCount: 2,
      totalCapacity: 8000,
      usedCapacity: 6000,
    status: "active",
      efficiency: 92,
      lastMaintenance: "2024-02-01",
      nextMaintenance: "2024-05-01",
    warehouses: [
      { 
          id: "w3",
          name: "第1倉庫",
        status: "active", 
          shelfCount: 40,
          totalItems: 950,
          location: "メイン棟",
          manager: "高橋美咲",
          totalCapacity: 4000,
          usedCapacity: 3200,
      },
      { 
          id: "w4",
          name: "第2倉庫",
          status: "maintenance",
          shelfCount: 25,
          totalItems: 600,
          location: "サブ棟",
          manager: "中村健太",
          totalCapacity: 2500,
          usedCapacity: 1800,
      },
    ],
  },
  ]);

  const filteredFactories = factories.filter(factory => {
    const matchesSearch = factory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         factory.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         factory.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || factory.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedFactories = [...filteredFactories].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "location":
        return a.location.localeCompare(b.location);
      case "efficiency":
        return b.efficiency - a.efficiency;
      default:
        return 0;
    }
  });

  const handleFactoryClick = (factoryId: string) => {
    setSelectedFactoryId(factoryId);
    setCurrentView("factory-detail");
  };

  const handleWarehouseClick = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    setCurrentView("warehouse-detail");
  };

  const handleEditFactory = (factory: Factory) => {
      setEditingFactory(factory);
    setShowFactoryDialog(true);
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setShowWarehouseDialog(true);
  };

  const handleDeleteFactory = (factoryId: string) => {
    setDeleteTarget({type: "factory", id: factoryId});
    setShowDeleteDialog(true);
  };

  const handleDeleteWarehouse = (warehouseId: string) => {
    setDeleteTarget({type: "warehouse", id: warehouseId});
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "factory") {
      setFactories(factories.filter(f => f.id !== deleteTarget.id));
    } else {
      setFactories(factories.map(f => ({
        ...f,
        warehouses: f.warehouses.filter(w => w.id !== deleteTarget.id)
      })));
    }
    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "稼働中";
      case "inactive":
        return "停止中";
      case "maintenance":
        return "メンテナンス中";
      default:
        return "不明";
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "text-green-600";
    if (efficiency >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-0 shadow-xl">
           <CardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                <p className="text-sm font-medium text-green-600">工場数</p>
                <p className="text-2xl font-bold text-green-700">{factories.length}</p>
               </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaIndustry className="text-green-600 text-xl" />
              </div>
             </div>
           </CardContent>
         </Card>
         
        <Card className="bg-white border-0 shadow-xl">
           <CardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                <p className="text-sm font-medium text-green-600">倉庫数</p>
                <p className="text-2xl font-bold text-green-700">{factories.reduce((sum, f) => sum + f.warehouseCount, 0)}</p>
               </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaWarehouse className="text-green-600 text-xl" />
              </div>
             </div>
           </CardContent>
         </Card>
         
        <Card className="bg-white border-0 shadow-xl">
           <CardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                <p className="text-sm font-medium text-green-600">平均効率</p>
                <p className="text-2xl font-bold text-green-700">{Math.round(factories.reduce((sum, f) => sum + f.efficiency, 0) / factories.length)}%</p>
               </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaChartLine className="text-green-600 text-xl" />
              </div>
             </div>
           </CardContent>
         </Card>
         
        <Card className="bg-white border-0 shadow-xl">
           <CardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                <p className="text-sm font-medium text-green-600">稼働率</p>
                <p className="text-2xl font-bold text-green-700">{Math.round(factories.reduce((sum, f) => sum + f.usedCapacity, 0) / factories.reduce((sum, f) => sum + f.totalCapacity, 0) * 100)}%</p>
               </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaBoxes className="text-green-600 text-xl" />
              </div>
             </div>
           </CardContent>
         </Card>
       </div>

      {/* 検索・フィルタ */}
      <Card className="bg-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="工場名、場所、管理者で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-green-300 focus:border-green-500 focus:ring-green-500"
              />
      </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-40 border-green-300 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="active">稼働中</SelectItem>
                  <SelectItem value="inactive">停止中</SelectItem>
                  <SelectItem value="maintenance">メンテナンス中</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40 border-green-300 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="並び順" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">名前順</SelectItem>
                  <SelectItem value="location">場所順</SelectItem>
                  <SelectItem value="efficiency">効率順</SelectItem>
                </SelectContent>
              </Select>
    </div>
      </div>
        </CardContent>
      </Card>

      {/* 工場リスト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedFactories.map((factory) => (
          <Card key={factory.id} className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <FaIndustry className="text-white text-lg" />
                  </div>
                  <div>
                    <CardTitle className="text-green-900 text-lg">{factory.name}</CardTitle>
                    <p className="text-green-700 text-sm">{factory.location}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(factory.status)}>
                  {getStatusLabel(factory.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">管理者</span>
                  <span className="text-sm font-medium text-green-800">{factory.manager}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">倉庫数</span>
                  <span className="text-sm font-medium text-green-800">{factory.warehouseCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">効率</span>
                  <span className={`text-sm font-medium ${getEfficiencyColor(factory.efficiency)}`}>{factory.efficiency}%</span>
                  </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">稼働率</span>
                  <span className="text-sm font-medium text-green-800">{Math.round(factory.usedCapacity / factory.totalCapacity * 100)}%</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                  <Button 
                  onClick={() => handleFactoryClick(factory.id)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  size="sm"
                  >
                    <FaEye className="mr-2" />
                  詳細
                  </Button>
                  {isAdmin && (
                    <>
                      <Button 
                      onClick={() => handleEditFactory(factory)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                      <FaEdit />
                      </Button>
                      <Button 
                      onClick={() => handleDeleteFactory(factory.id)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                        size="sm"
                      >
                      <FaTrash />
                      </Button>
                    </>
                  )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 新規工場追加ボタン */}
          {isAdmin && (
        <div className="flex justify-center">
            <Button 
                      onClick={() => {
              setEditingFactory(null);
              setShowFactoryDialog(true);
                      }}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                    >
            <FaPlus />
            新規工場追加
                    </Button>
                  </div>
      )}
    </div>
  );

  // メインレンダリング
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      <div className="container mx-auto py-6 space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                <FaIndustry className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  工場管理
                </h1>
                <p className="text-gray-600">Factory Management System</p>
              </div>
            </div>
            {currentView !== "overview" && (
              <Button
                onClick={() => setCurrentView("overview")}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <FaArrowLeft />
                戻る
              </Button>
            )}
          </div>

          {/* コンテンツ */}
          {currentView === "overview" && renderOverview()}
          {/* 他のビューは必要に応じて追加 */}
        </div>
      </div>
    </div>
  );
};

export default Factories; 