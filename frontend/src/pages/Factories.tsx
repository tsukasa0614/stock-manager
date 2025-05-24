import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FaMap, FaWarehouse, FaPlus, FaEdit, FaTrash, FaBox, FaTable } from "react-icons/fa";

type ViewType = "main" | "factoryMap" | "warehouseMap" | "warehouseInterior" | "create" | "shelfView" | "shelfEdit" | "locationTable" | "factoryDetail";

interface ShelfLocation {
  id: string;
  code: string;
  status: "empty" | "occupied";
  item?: string;
}

interface Shelf {
  id: string;
  name: string;
  levels: number;
  sections: number;
  locations: ShelfLocation[];
  x: number;
  y: number;
}

interface Warehouse {
  id: string;
  name: string;
  type: "warehouse";
  x: number;
  y: number;
  color: string;
  status: "active" | "inactive" | "maintenance";
  shelves: Shelf[];
  address?: string;
  notes?: string;
  capacity?: number;
}

interface Location {
  id: string;
  name: string;
  type: "factory" | "warehouse" | "shelf";
  x: number;
  y: number;
  color: string;
  parentId?: string;
  shelves?: Shelf[];
  warehouses?: Warehouse[];
  address?: string;
  notes?: string;
  capacity?: number;
  status?: "active" | "inactive" | "maintenance";
}

const COLORS = [
  "#3B82F6", // blue-500
  "#10B981", // green-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#8B5CF6", // purple-500
  "#EC4899", // pink-500
];

const inputClassName = "w-full p-2 border rounded-md bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const WAREHOUSE_STATUS = {
  active: { label: "稼働中", color: "bg-green-100 text-green-800" },
  inactive: { label: "停止中", color: "bg-gray-100 text-gray-800" },
  maintenance: { label: "メンテナンス中", color: "bg-yellow-100 text-yellow-800" },
};

const Factories: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>("main");
  const [selectedFactory, setSelectedFactory] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [newLocationName, setNewLocationName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragLocation, setDragLocation] = useState<Location | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Location | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [factoryMode, setFactoryMode] = useState<"view" | "create" | "edit" | "delete">("view");
  const [warehouseMode, setWarehouseMode] = useState<"view" | "create" | "edit" | "delete">("view");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const MAX_LOCATIONS = 10;

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/auth/check-admin', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error('管理者チェックに失敗しました:', error);
      }
    };
    checkAdmin();
  }, []);

  const getNextColor = (type: "factory" | "warehouse") => {
    const existingLocations = locations.filter(loc => loc.type === type);
    const usedColors = existingLocations.map(loc => loc.color);
    return COLORS.find(color => !usedColors.includes(color)) || COLORS[0];
  };

  const getNextName = (type: "factory" | "warehouse") => {
    const existingLocations = locations.filter(loc => loc.type === type);
    const usedNames = existingLocations.map(loc => loc.name);
    
    if (type === "factory") {
      for (let i = 1; i <= MAX_LOCATIONS; i++) {
        const name = `工場${i}`;
        if (!usedNames.includes(name)) return name;
      }
    } else {
      for (let i = 1; i <= MAX_LOCATIONS; i++) {
        const name = `倉庫${i}`;
        if (!usedNames.includes(name)) return name;
      }
    }
    return `${type === "factory" ? "工場" : "倉庫"}${Date.now()}`;
  };

  const renderMainView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card 
        className="cursor-pointer hover:scale-105 transition-all duration-200 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        onClick={() => setCurrentView("factoryMap")}
      >
        <CardHeader className="bg-blue-50 border-b border-blue-200">
          <div className="flex items-center gap-2">
            <FaMap className="text-blue-500" />
            <CardTitle className="text-blue-900">工場マップ</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-blue-700">工場の配置と管理</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:scale-105 transition-all duration-200 bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        onClick={() => setCurrentView("warehouseMap")}
      >
        <CardHeader className="bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-2">
            <FaWarehouse className="text-green-500" />
            <CardTitle className="text-green-900">倉庫マップ</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-green-700">倉庫の配置と管理</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:scale-105 transition-all duration-200 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        onClick={() => setCurrentView("create")}
      >
        <CardHeader className="bg-purple-50 border-b border-purple-200">
          <div className="flex items-center gap-2">
            <FaPlus className="text-purple-500" />
            <CardTitle className="text-purple-900">新規作成</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-purple-700">工場・倉庫・棚の作成</p>
        </CardContent>
      </Card>
    </div>
  );

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>, type: "factory" | "warehouse") => {
    if (type === "warehouse" && !selectedFactory) {
      alert("倉庫を作成するには工場を選択してください");
      return;
    }

    const existingLocations = locations.filter(loc => loc.type === type);
    if (existingLocations.length >= MAX_LOCATIONS) {
      alert(`${type === "factory" ? "工場" : "倉庫"}は最大${MAX_LOCATIONS}個までしか作成できません`);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 128));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height - 128));

    if (factoryMode === "create" || warehouseMode === "create") {
      const newLocation: Location = {
        id: Date.now().toString(),
        name: getNextName(type),
        type,
        x,
        y,
        color: getNextColor(type),
        parentId: type === "warehouse" ? selectedFactory?.id : undefined,
      };

      setLocations([...locations, newLocation]);
    }
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>, location: Location) => {
    if (factoryMode !== "edit" && warehouseMode !== "edit") return;
    
    setIsDragging(true);
    setDragLocation(location);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart({
      x: e.clientX - location.x,
      y: e.clientY - location.y
    });
  };

  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragLocation) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragStart.x, rect.width - 128));
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragStart.y, rect.height - 128));

    setLocations(locations.map(loc =>
      loc.id === dragLocation.id ? { ...loc, x, y } : loc
    ));
  };

  const handleDragEnd = async () => {
    if (!isDragging || !dragLocation) return;

    try {
      const updatedLocation = {
        ...dragLocation,
        x: dragLocation.x,
        y: dragLocation.y
      };

      await fetch(`/api/locations/${dragLocation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedLocation)
      });

      setIsDragging(false);
      setDragLocation(null);
    } catch (error) {
      alert('位置の更新に失敗しました');
    }
  };

  const handleLocationClick = (location: Location, e: React.MouseEvent) => {
    e.stopPropagation();

    if (factoryMode === "delete" || warehouseMode === "delete") {
      if (!isAdmin) {
        alert("削除モードは管理者のみ使用可能です");
        return;
      }
      if (confirm(`${location.name}を削除してもよろしいですか？`)) {
        if (location.type === "factory") {
          handleDeleteFactory(location);
        } else {
          handleDeleteWarehouse(location);
        }
      }
    } else if (factoryMode === "edit" || warehouseMode === "edit") {
      setEditingLocation(location);
      setNewLocationName(location.name);
      setSelectedColor(location.color);
    } else {
      if (location.type === "factory") {
        handleFactoryClick(location);
      } else {
        handleWarehouseClick(location);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingLocation) return;

    try {
      const updatedLocation = {
        ...editingLocation,
        name: newLocationName,
        color: selectedColor,
      };

      await fetch(`/api/locations/${editingLocation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedLocation)
      });

      setLocations(locations.map(loc =>
        loc.id === editingLocation.id ? updatedLocation : loc
      ));

      setEditingLocation(null);
      setNewLocationName("");
    } catch (error) {
      alert('更新に失敗しました');
    }
  };

  const handleWarehouseClick = (warehouse: Location) => {
    setSelectedWarehouse(warehouse);
    setCurrentView("warehouseInterior");
  };

  const handleShelfClick = (shelf: Shelf, e: React.MouseEvent) => {
    e.stopPropagation();

    if (warehouseMode === "delete") {
      if (!isAdmin) {
        alert("削除モードは管理者のみ使用可能です");
        return;
      }
      if (confirm(`${shelf.name}を削除してもよろしいですか？`)) {
        handleDeleteShelf(shelf);
      }
    } else if (warehouseMode === "edit") {
      setSelectedShelf(shelf);
      setCurrentView("shelfEdit");
    } else {
      setSelectedShelf(shelf);
      setCurrentView("locationTable");
    }
  };

  const handleShelfDragStart = (e: React.MouseEvent<HTMLDivElement>, shelf: Shelf) => {
    if (warehouseMode !== "edit") return;
    
    setIsDragging(true);
    setSelectedShelf(shelf);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart({
      x: e.clientX - shelf.x,
      y: e.clientY - shelf.y
    });
  };

  const handleFactoryClick = (factory: Location) => {
    setSelectedFactory(factory);
    setCurrentView("warehouseMap");
  };

  const handleDeleteFactory = async (factory: Location) => {
    if (!confirm(`${factory.name}を削除してもよろしいですか？`)) return;
    
    try {
      await fetch(`/api/factories/${factory.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setLocations(locations.filter(loc => loc.id !== factory.id));
    } catch (error) {
      alert('工場の削除に失敗しました');
    }
  };

  const handleDeleteWarehouse = async (warehouse: Location) => {
    if (!confirm(`${warehouse.name}を削除してもよろしいですか？`)) return;
    
    try {
      await fetch(`/api/factories/${selectedFactory?.id}/warehouses/${warehouse.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setLocations(locations.filter(loc => loc.id !== warehouse.id));
    } catch (error) {
      alert('倉庫の削除に失敗しました');
    }
  };

  const handleDeleteShelf = async (shelf: Shelf) => {
    if (!confirm(`${shelf.name}を削除してもよろしいですか？`)) return;
    
    try {
      await fetch(`/api/factories/${selectedFactory?.id}/warehouses/${selectedWarehouse?.id}/shelves/${shelf.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setLocations(locations.map(loc => 
        loc.id === selectedFactory?.id
          ? {
              ...loc,
              warehouses: loc.warehouses?.map((w: Warehouse) =>
                w.id === selectedWarehouse?.id
                  ? { ...w, shelves: w.shelves?.filter((s: Shelf) => s.id !== shelf.id) }
                  : w
              )
            }
          : loc
      ));
    } catch (error) {
      alert('棚の削除に失敗しました');
    }
  };

  const renderLocationTable = () => {
    if (!selectedShelf) return null;

    return (
      <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-blue-200">
        <CardHeader className="bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaTable className="text-blue-500" />
              <CardTitle className="text-blue-900">{selectedShelf.name} - 商品配置表</CardTitle>
            </div>
            <Button 
              variant="outline" 
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => setCurrentView("shelfView")}
            >
              戻る
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-2 border">区画</th>
                  <th className="px-4 py-2 border">商品名</th>
                  <th className="px-4 py-2 border">数量</th>
                  <th className="px-4 py-2 border">操作</th>
                </tr>
              </thead>
              <tbody>
                {selectedShelf.locations.map(location => (
                  <tr key={location.id} className="even:bg-blue-50/50">
                    <td className="px-4 py-2 border">{location.code}</td>
                    <td className="px-4 py-2 border">{location.item || "-"}</td>
                    <td className="px-4 py-2 border">{location.status === "occupied" ? "1" : "0"}</td>
                    <td className="px-4 py-2 border text-center">
                      <Button size="sm" variant="outline" className="mr-2">
                        編集
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-500">
                        削除
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderShelfView = () => {
    if (!selectedWarehouse) return null;

    return (
      <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-green-200">
        <CardHeader className="bg-green-50 border-b border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaBox className="text-green-500" />
              <CardTitle className="text-green-900">
                {selectedFactory ? `${selectedFactory.name} - ` : ""}
                {selectedWarehouse.name} - 棚管理
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => setCurrentView("shelfEdit")}
              >
                棚を追加
              </Button>
              <Button 
                variant="outline" 
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => setCurrentView("warehouseMap")}
              >
                倉庫マップに戻る
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedWarehouse.shelves?.map(shelf => (
              <Card 
                key={shelf.id} 
                className="border-green-200 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={(e) => handleShelfClick(shelf, e)}
              >
                <CardHeader className="bg-green-50 border-b border-green-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-900">{shelf.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-green-600">
                        <FaEdit />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500">
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid gap-2">
                    {Array.from({ length: shelf.levels }).map((_, level) => (
                      <div key={level} className="flex gap-2">
                        {Array.from({ length: shelf.sections }).map((_, section) => {
                          const location = shelf.locations.find(
                            loc => loc.code === `${shelf.name}-${level + 1}-${section + 1}`
                          );
                          return (
                            <div
                              key={section}
                              className={`w-16 h-16 border rounded-lg flex items-center justify-center text-sm ${
                                location?.status === "occupied"
                                  ? "bg-red-100 border-red-300"
                                  : "bg-green-50 border-green-200"
                              }`}
                            >
                              {location?.code}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFactoryDetail = () => {
    if (!selectedFactory) return null;

    return (
      <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-blue-200">
        <CardHeader className="bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaMap className="text-blue-500" />
              <CardTitle className="text-blue-900">{selectedFactory.name} - 工場詳細</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => setCurrentView("factoryMap")}
              >
                戻る
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50 border-b border-blue-200">
                <CardTitle className="text-blue-900">倉庫一覧</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {locations
                    .filter(loc => loc.type === "warehouse" && loc.parentId === selectedFactory.id)
                    .map(warehouse => (
                      <div
                        key={warehouse.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleWarehouseClick(warehouse)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: warehouse.color }}
                          />
                          <span className="font-medium">{warehouse.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="text-blue-600">
                            <FaEdit />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500">
                            <FaTrash />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50 border-b border-blue-200">
                <CardTitle className="text-blue-900">工場情報</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">工場名</label>
                    <input
                      type="text"
                      value={selectedFactory.name}
                      className="w-full p-2 border rounded-md"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">倉庫数</label>
                    <input
                      type="text"
                      value={locations.filter(loc => loc.type === "warehouse" && loc.parentId === selectedFactory.id).length}
                      className="w-full p-2 border rounded-md"
                      readOnly
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderShelfEdit = () => {
    if (!selectedWarehouse) return null;

    return (
      <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-green-200">
        <CardHeader className="bg-green-50 border-b border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaBox className="text-green-500" />
              <CardTitle className="text-green-900">棚の追加</CardTitle>
            </div>
            <Button 
              variant="outline" 
              className="border-green-300 text-green-700 hover:bg-green-50"
              onClick={() => setCurrentView("shelfView")}
            >
              戻る
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">棚名</label>
              <input
                type="text"
                className={inputClassName}
                placeholder="例:A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">段数</label>
              <input
                type="number"
                className={inputClassName}
                min="1"
                max="10"
                defaultValue={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">区画数</label>
              <input
                type="number"
                className={inputClassName}
                min="1"
                max="10"
                defaultValue={3}
              />
            </div>
            <div className="flex justify-end">
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-green-500/50 hover:scale-105 transition-all duration-200">
                作成
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFactoryMap = () => (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-blue-200">
      <CardHeader className="bg-blue-50 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaMap className="text-blue-500" />
            <CardTitle className="text-blue-900">工場マップ</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={factoryMode === "create" ? "default" : "outline"}
              className={`${
                factoryMode === "create"
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "border-blue-300 text-blue-700 hover:bg-blue-50"
              }`}
              onClick={() => setFactoryMode(factoryMode === "create" ? "view" : "create")}
            >
              作成モード
            </Button>
            <Button 
              variant={factoryMode === "edit" ? "default" : "outline"}
              className={`${
                factoryMode === "edit"
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "border-blue-300 text-blue-700 hover:bg-blue-50"
              }`}
              onClick={() => setFactoryMode(factoryMode === "edit" ? "view" : "edit")}
            >
              編集モード
            </Button>
            <Button 
              variant={factoryMode === "delete" ? "default" : "outline"}
              className={`${
                factoryMode === "delete"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "border-red-300 text-red-700 hover:bg-red-50"
              }`}
              onClick={() => setFactoryMode(factoryMode === "delete" ? "view" : "delete")}
            >
              削除モード
            </Button>
            <Button 
              variant="outline" 
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => setCurrentView("main")}
            >
              戻る
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div 
              className={`aspect-[2/1] bg-gray-100 rounded-lg relative ${
                factoryMode === "create" ? "cursor-crosshair" : "cursor-default"
              }`}
              onClick={(e) => {
                if (factoryMode === "create") {
                  handleMapClick(e, "factory");
                }
              }}
            >
              {locations.filter(loc => loc.type === "factory").map(location => (
                <div
                  key={location.id}
                  className={`absolute w-32 h-32 text-white rounded-lg flex items-center justify-center ${
                    factoryMode === "delete" ? "cursor-pointer" : "cursor-default"
                  } transform hover:scale-105 transition-transform`}
                  style={{ 
                    left: location.x, 
                    top: location.y,
                    backgroundColor: location.color
                  }}
                  onClick={(e) => handleLocationClick(location, e)}
                  onMouseDown={(e) => handleDragStart(e, location)}
                >
                  <div className="relative group">
                    {location.name}
                  </div>
                </div>
              ))}
              {factoryMode === "create" && renderCreateForm()}
              {factoryMode === "delete" && (
                <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">
                    {isAdmin ? "削除したい項目をクリック" : "削除モードは管理者のみ使用可能です"}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50 border-b border-blue-200">
                <CardTitle className="text-blue-900">工場一覧</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {locations
                    .filter(loc => loc.type === "factory")
                    .map(factory => (
                      <div
                        key={factory.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={(e) => handleLocationClick(factory, e)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: factory.color }}
                          />
                          <div className="font-medium">{factory.name}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderWarehouseMap = () => (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-green-200">
      <CardHeader className="bg-green-50 border-b border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaWarehouse className="text-green-500" />
            <CardTitle className="text-green-900">
              {selectedFactory ? `${selectedFactory.name} - 倉庫マップ` : "倉庫マップ"}
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={warehouseMode === "create" ? "default" : "outline"}
              className={`${
                warehouseMode === "create"
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "border-green-300 text-green-700 hover:bg-green-50"
              }`}
              onClick={() => setWarehouseMode(warehouseMode === "create" ? "view" : "create")}
            >
              作成モード
            </Button>
            <Button 
              variant={warehouseMode === "edit" ? "default" : "outline"}
              className={`${
                warehouseMode === "edit"
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "border-green-300 text-green-700 hover:bg-green-50"
              }`}
              onClick={() => setWarehouseMode(warehouseMode === "edit" ? "view" : "edit")}
            >
              編集モード
            </Button>
            <Button 
              variant={warehouseMode === "delete" ? "default" : "outline"}
              className={`${
                warehouseMode === "delete"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "border-red-300 text-red-700 hover:bg-red-50"
              }`}
              onClick={() => setWarehouseMode(warehouseMode === "delete" ? "view" : "delete")}
            >
              削除モード
            </Button>
            {selectedFactory && (
              <Button 
                variant="outline" 
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => {
                  setSelectedFactory(null);
                  setCurrentView("factoryMap");
                }}
              >
                工場マップに戻る
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div 
              className={`aspect-[2/1] bg-gray-100 rounded-lg relative ${
                warehouseMode === "create" ? "cursor-crosshair" : "cursor-default"
              }`}
              onClick={(e) => {
                if (warehouseMode === "create") {
                  handleMapClick(e, "warehouse");
                }
              }}
            >
              {locations
                .filter(loc => loc.type === "warehouse" && (!selectedFactory || loc.parentId === selectedFactory.id))
                .map(location => (
                  <div
                    key={location.id}
                    className={`absolute w-32 h-32 text-white rounded-lg flex items-center justify-center ${
                      warehouseMode === "delete" ? "cursor-pointer" : "cursor-default"
                    } transform hover:scale-105 transition-transform`}
                    style={{ 
                      left: location.x, 
                      top: location.y,
                      backgroundColor: location.color
                    }}
                    onClick={(e) => handleLocationClick(location, e)}
                    onMouseDown={(e) => handleDragStart(e, location)}
                  >
                    <div className="relative group">
                      {location.name}
                    </div>
                  </div>
                ))}
              {warehouseMode === "create" && renderCreateForm()}
              {warehouseMode === "delete" && (
                <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">
                    {isAdmin ? "削除したい項目をクリック" : "削除モードは管理者のみ使用可能です"}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <Card className="border-green-200">
              <CardHeader className="bg-green-50 border-b border-green-200">
                <CardTitle className="text-green-900">倉庫一覧</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {locations
                    .filter(loc => loc.type === "warehouse" && (!selectedFactory || loc.parentId === selectedFactory.id))
                    .map(warehouse => (
                      <div
                        key={warehouse.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={(e) => handleLocationClick(warehouse, e)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: warehouse.color }}
                          />
                          <div>
                            <div className="font-medium">{warehouse.name}</div>
                            <div className="text-sm text-gray-500">
                              {warehouse.shelves?.length || 0}個の棚
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            WAREHOUSE_STATUS[warehouse.status || "active"].color
                          }`}>
                            {WAREHOUSE_STATUS[warehouse.status || "active"].label}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderWarehouseInterior = () => {
    if (!selectedWarehouse) return null;

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (warehouseMode !== "create") return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 200));
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height - 160));

      const newShelf: Shelf = {
        id: Date.now().toString(),
        name: `Shelf-${(selectedWarehouse.shelves?.length || 0) + 1}`,
        levels: 3,
        sections: 3,
        locations: Array.from({ length: 9 }).map((_, i) => ({
          id: `${Date.now()}-${i}`,
          code: `${i + 1}`,
          status: "empty"
        })),
        x,
        y
      };

      setLocations(locations.map(loc => 
        loc.id === selectedWarehouse.id
          ? { ...loc, shelves: [...(loc.shelves || []), newShelf] }
          : loc
      ));
    };

    return (
      <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-green-200">
        <CardHeader className="bg-green-50 border-b border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaWarehouse className="text-green-500" />
              <CardTitle className="text-green-900">
                {selectedWarehouse.name} - 倉庫内マップ
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={warehouseMode === "create" ? "default" : "outline"}
                className={`${
                  warehouseMode === "create"
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "border-green-300 text-green-700 hover:bg-green-50"
                }`}
                onClick={() => setWarehouseMode(warehouseMode === "create" ? "view" : "create")}
              >
                作成モード
              </Button>
              <Button 
                variant={warehouseMode === "edit" ? "default" : "outline"}
                className={`${
                  warehouseMode === "edit"
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "border-blue-300 text-blue-700 hover:bg-blue-50"
                }`}
                onClick={() => setWarehouseMode(warehouseMode === "edit" ? "view" : "edit")}
              >
                編集モード
              </Button>
              <Button 
                variant={warehouseMode === "delete" ? "default" : "outline"}
                className={`${
                  warehouseMode === "delete"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "border-red-300 text-red-700 hover:bg-red-50"
                }`}
                onClick={() => setWarehouseMode(warehouseMode === "delete" ? "view" : "delete")}
              >
                削除モード
              </Button>
              <Button 
                variant="outline" 
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => setCurrentView("warehouseMap")}
              >
                倉庫マップに戻る
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div 
                className={`aspect-[2/1] bg-gray-100 rounded-lg relative ${
                  warehouseMode === "create" ? "cursor-crosshair" : "cursor-default"
                }`}
                onClick={handleMapClick}
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                {selectedWarehouse.shelves?.map(shelf => (
                  <div
                    key={shelf.id}
                    className={`absolute bg-white/90 rounded-lg border-2 ${
                      warehouseMode === "edit" ? "border-blue-300" : "border-blue-200"
                    } p-2 ${
                      warehouseMode === "delete" ? "cursor-pointer" : 
                      warehouseMode === "edit" ? "cursor-move" : "cursor-default"
                    } transform hover:scale-105 transition-transform`}
                    style={{ 
                      left: shelf.x, 
                      top: shelf.y,
                      width: `${shelf.sections * 60 + 16}px`,
                      height: `${shelf.levels * 60 + 16}px`,
                    }}
                    onClick={(e) => handleShelfClick(shelf, e)}
                    onMouseDown={(e) => handleShelfDragStart(e, shelf)}
                  >
                    <div className="relative">
                      <div className="absolute -top-6 left-0 text-sm font-medium text-blue-900">
                        {shelf.name}
                      </div>
                      <div className="grid gap-2">
                        {Array.from({ length: shelf.levels }).map((_, level) => (
                          <div key={level} className="flex gap-2">
                            {Array.from({ length: shelf.sections }).map((_, section) => (
                              <div
                                key={section}
                                className="w-14 h-14 bg-blue-50 border border-blue-200 rounded flex items-center justify-center text-xs text-blue-900"
                              >
                                {level + 1}-{section + 1}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {warehouseMode === "create" && renderCreateForm()}
                {warehouseMode === "delete" && (
                  <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700">
                      {isAdmin ? "削除したい項目をクリック" : "削除モードは管理者のみ使用可能です"}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <Card className="border-green-200">
                <CardHeader className="bg-green-50 border-b border-green-200">
                  <CardTitle className="text-green-900">棚一覧</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {selectedWarehouse.shelves?.map(shelf => (
                      <div
                        key={shelf.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={(e) => handleShelfClick(shelf, e)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="font-medium">{shelf.name}</div>
                          <div className="text-sm text-gray-500">
                            {shelf.sections}区画 × {shelf.levels}段
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCreate = () => (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-purple-200">
      <CardHeader className="bg-purple-50 border-b border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaPlus className="text-purple-500" />
            <CardTitle className="text-purple-900">新規作成</CardTitle>
          </div>
          <Button 
            variant="outline" 
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
            onClick={() => setCurrentView("main")}
          >
            戻る
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50 border-b border-purple-200">
              <CardTitle className="text-purple-900">工場作成</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">工場名</label>
                  <input
                    type="text"
                    className={inputClassName}
                    placeholder="例:A工場"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">住所</label>
                  <input
                    type="text"
                    className={inputClassName}
                    placeholder="工場の住所"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">備考</label>
                  <textarea
                    className={inputClassName}
                    rows={3}
                    placeholder="工場に関する追加情報"
                  />
                </div>
                <div className="flex justify-end">
                  <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                    作成
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="bg-green-50 border-b border-green-200">
              <CardTitle className="text-green-900">倉庫作成</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">工場</label>
                  <select className={inputClassName}>
                    <option value="">工場を選択</option>
                    {locations
                      .filter(loc => loc.type === "factory")
                      .map(factory => (
                        <option key={factory.id} value={factory.id}>
                          {factory.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">倉庫名</label>
                  <input
                    type="text"
                    className={inputClassName}
                    placeholder="例:1号倉庫"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">状態</label>
                  <select className={inputClassName}>
                    <option value="active">稼働中</option>
                    <option value="maintenance">メンテナンス中</option>
                    <option value="inactive">停止中</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                    作成
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 md:col-span-2">
            <CardHeader className="bg-blue-50 border-b border-blue-200">
              <CardTitle className="text-blue-900">棚作成</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">倉庫</label>
                    <select className={inputClassName}>
                      <option value="">倉庫を選択</option>
                      {locations
                        .filter(loc => loc.type === "warehouse")
                        .map(warehouse => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">棚名</label>
                    <input
                      type="text"
                      className={inputClassName}
                      placeholder="例:A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">段数</label>
                    <input
                      type="number"
                      className={inputClassName}
                      min="1"
                      max="10"
                      defaultValue={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">区画数</label>
                    <input
                      type="number"
                      className={inputClassName}
                      min="1"
                      max="10"
                      defaultValue={3}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                      作成
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="text-sm font-medium mb-2">プレビュー</div>
                  <div className="grid gap-2">
                    {Array.from({ length: 3 }).map((_, level) => (
                      <div key={level} className="flex gap-2">
                        {Array.from({ length: 3 }).map((_, section) => (
                          <div
                            key={section}
                            className="w-16 h-16 bg-white border-2 border-blue-200 rounded-lg flex items-center justify-center text-sm"
                          >
                            A-{level + 1}-{section + 1}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );

  const renderEditModal = () => {
    if (!editingLocation) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <h3 className="text-lg font-medium mb-4">編集</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">名前</label>
              <input
                type="text"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                className={inputClassName}
                placeholder="名前を入力"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">色</label>
              <div className="grid grid-cols-6 gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={(e) => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingLocation(null);
                  setNewLocationName("");
                }}
              >
                キャンセル
              </Button>
              <Button onClick={handleSaveEdit}>
                保存
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateForm = () => {
    if (factoryMode !== "create" && warehouseMode !== "create") return null;

    const type = factoryMode === "create" ? "factory" : "warehouse";
    const existingLocations = locations.filter(loc => loc.type === type);
    const remaining = MAX_LOCATIONS - existingLocations.length;

    return (
      <div className="absolute top-4 left-4 bg-white/90 p-4 rounded-lg border border-blue-200">
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            残り作成可能数: {remaining}個
          </div>
          <div className="text-sm text-blue-700">
            マップをクリックして{type === "factory" ? "工場" : "倉庫"}を配置
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-900">工場管理</h1>
        </div>

        {currentView === "main" && renderMainView()}
        {currentView === "factoryMap" && renderFactoryMap()}
        {currentView === "warehouseMap" && renderWarehouseMap()}
        {currentView === "warehouseInterior" && renderWarehouseInterior()}
        {currentView === "create" && renderCreate()}
        {currentView === "shelfView" && renderShelfView()}
        {currentView === "shelfEdit" && renderShelfEdit()}
        {currentView === "locationTable" && renderLocationTable()}
        {currentView === "factoryDetail" && renderFactoryDetail()}
        {renderEditModal()}
      </div>
    </div>
  );
};

export default Factories; 