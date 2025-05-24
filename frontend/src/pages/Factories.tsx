import React, { useState } from "react";
import type { ChangeEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaPlus, FaEdit, FaTrash, FaWarehouse, FaChevronRight, FaChevronDown, FaMap, FaGripVertical } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  subWarehouses?: Warehouse[];
  map?: {
    width: number;
    height: number;
    shelves: ShelfItem[];
  };
}

interface Factory {
  id: string;
  name: string;
  address?: string;
  warehouses: Warehouse[];
}

const WAREHOUSE_STATUS = {
  active: { label: "稼働中", color: "bg-green-100 text-green-800" },
  inactive: { label: "停止中", color: "bg-gray-100 text-gray-800" },
  maintenance: { label: "メンテナンス中", color: "bg-yellow-100 text-yellow-800" },
};

// 仮のデータ
const mockFactories: Factory[] = [
  {
    id: "1",
    name: "A工場",
    address: "東京都千代田区1-1-1",
    warehouses: [
      { 
        id: "1-1", 
        name: "1号倉庫", 
        status: "active", 
        shelfCount: 5,
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
        name: "2号倉庫", 
        status: "maintenance", 
        shelfCount: 3,
        map: {
          width: 800,
          height: 600,
          shelves: [
            { id: "s5", x: 100, y: 100, width: 200, height: 100, name: "C-1", items: [] },
            { id: "s6", x: 350, y: 100, width: 200, height: 100, name: "C-2", items: [] },
          ]
        }
      },
    ],
  },
  {
    id: "2",
    name: "B工場",
    address: "東京都港区2-2-2",
    warehouses: [
      { 
        id: "2-1", 
        name: "1号倉庫", 
        status: "active", 
        shelfCount: 4,
        map: {
          width: 800,
          height: 600,
          shelves: [
            { id: "s7", x: 100, y: 100, width: 200, height: 100, name: "D-1", items: [] },
            { id: "s8", x: 350, y: 100, width: 200, height: 100, name: "D-2", items: [] },
          ]
        }
      },
      { 
        id: "2-2", 
        name: "2号倉庫", 
        status: "inactive", 
        shelfCount: 0,
        map: {
          width: 800,
          height: 600,
          shelves: []
        }
      },
    ],
  },
];

const Factories: React.FC = () => {
  const [factories, setFactories] = useState<Factory[]>(mockFactories);
  const [isAdmin, setIsAdmin] = useState(true);
  const [expandedFactory, setExpandedFactory] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  
  // 工場関連の状態
  const [isFactoryDialogOpen, setIsFactoryDialogOpen] = useState(false);
  const [editingFactory, setEditingFactory] = useState<Factory | null>(null);
  const [newFactory, setNewFactory] = useState<Partial<Factory>>({
    name: "",
    warehouses: []
  });

  // 倉庫関連の状態
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [newWarehouse, setNewWarehouse] = useState<Partial<Warehouse>>({
    name: "",
    status: "active",
    shelfCount: 0
  });
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(null);

  // 棚の詳細関連の状態
  const [selectedShelf, setSelectedShelf] = useState<ShelfItem | null>(null);
  const [isShelfDetailOpen, setIsShelfDetailOpen] = useState(false);
  const [editingShelfItem, setEditingShelfItem] = useState<{
    shelfId: string;
    item: ShelfItem["items"][0];
  } | null>(null);

  const toggleFactory = (factoryId: string) => {
    setExpandedFactory(expandedFactory === factoryId ? null : factoryId);
  };

  // 工場の追加・編集
  const handleFactorySubmit = () => {
    if (editingFactory) {
      setFactories(factories.map(f => 
        f.id === editingFactory.id 
          ? { ...f, ...newFactory }
          : f
      ));
    } else {
      const newFactoryWithId = {
        ...newFactory,
        id: `factory-${Date.now()}`,
        warehouses: []
      } as Factory;
      setFactories([...factories, newFactoryWithId]);
    }
    setIsFactoryDialogOpen(false);
    setEditingFactory(null);
    setNewFactory({ name: "", warehouses: [] });
  };

  // 工場の削除
  const handleFactoryDelete = (factoryId: string) => {
    if (window.confirm("この工場を削除してもよろしいですか？")) {
      setFactories(factories.filter(f => f.id !== factoryId));
    }
  };

  // 倉庫の追加・編集
  const handleWarehouseSubmit = () => {
    if (!selectedFactoryId) return;

    if (editingWarehouse) {
      // 編集モード
      setFactories(factories.map(f => {
        if (f.id === selectedFactoryId) {
          return {
            ...f,
            warehouses: f.warehouses.map(w =>
              w.id === editingWarehouse.id
                ? { ...w, ...newWarehouse }
                : w
            )
          };
        }
        return f;
      }));
    } else {
      // 新規追加モード
      const newWarehouseWithId = {
        ...newWarehouse,
        id: `warehouse-${Date.now()}`,
        map: {
          width: 800,
          height: 600,
          shelves: []
        }
      } as Warehouse;

      setFactories(factories.map(f => {
        if (f.id === selectedFactoryId) {
          return {
            ...f,
            warehouses: [...f.warehouses, newWarehouseWithId]
          };
        }
        return f;
      }));
    }
    setIsWarehouseDialogOpen(false);
    setEditingWarehouse(null);
    setNewWarehouse({ name: "", status: "active", shelfCount: 0 });
  };

  // 倉庫の削除
  const handleWarehouseDelete = (factoryId: string, warehouseId: string) => {
    if (window.confirm("この倉庫を削除してもよろしいですか？")) {
      setFactories(factories.map(f => {
        if (f.id === factoryId) {
          return {
            ...f,
            warehouses: f.warehouses.filter(w => w.id !== warehouseId)
          };
        }
        return f;
      }));
    }
  };

  // 工場編集ダイアログを開く
  const openFactoryEditDialog = (factory: Factory) => {
    setEditingFactory(factory);
    setNewFactory({ name: factory.name, warehouses: factory.warehouses });
    setIsFactoryDialogOpen(true);
  };

  // 倉庫編集ダイアログを開く
  const openWarehouseEditDialog = (factoryId: string, warehouse: Warehouse) => {
    setSelectedFactoryId(factoryId);
    setEditingWarehouse(warehouse);
    setNewWarehouse({
      name: warehouse.name,
      status: warehouse.status,
      shelfCount: warehouse.shelfCount
    });
    setIsWarehouseDialogOpen(true);
  };

  // 棚の位置を更新
  const handleShelfDrag = (shelfId: string, x: number, y: number) => {
    if (!selectedWarehouse?.map) return;

    setFactories(factories.map(f => {
      if (f.id === selectedFactoryId) {
        return {
          ...f,
          warehouses: f.warehouses.map(w => {
            if (w.id === selectedWarehouse.id && w.map) {
              return {
                ...w,
                map: {
                  ...w.map,
                  shelves: w.map.shelves.map(shelf =>
                    shelf.id === shelfId
                      ? { ...shelf, x, y }
                      : shelf
                  )
                }
              };
            }
            return w;
          })
        };
      }
      return f;
    }));
  };

  // 棚のサイズを更新
  const handleShelfResize = (shelfId: string, width: number, height: number) => {
    if (!selectedWarehouse?.map) return;

    setFactories(factories.map(f => {
      if (f.id === selectedFactoryId) {
        return {
          ...f,
          warehouses: f.warehouses.map(w => {
            if (w.id === selectedWarehouse.id && w.map) {
              return {
                ...w,
                map: {
                  ...w.map,
                  shelves: w.map.shelves.map(shelf =>
                    shelf.id === shelfId
                      ? { ...shelf, width, height }
                      : shelf
                  )
                }
              };
            }
            return w;
          })
        };
      }
      return f;
    }));
  };

  // 棚の詳細を表示
  const handleShelfClick = (shelf: ShelfItem) => {
    setSelectedShelf(shelf);
    setIsShelfDetailOpen(true);
  };

  // 商品を追加
  const handleAddItem = (shelfId: string) => {
    if (!selectedWarehouse?.map) return;

    const newItem = {
      id: `item-${Date.now()}`,
      number: "",
      name: ""
    };

    setFactories(factories.map(f => {
      if (f.id === selectedFactoryId) {
        return {
          ...f,
          warehouses: f.warehouses.map(w => {
            if (w.id === selectedWarehouse.id && w.map) {
              return {
                ...w,
                map: {
                  ...w.map,
                  shelves: w.map.shelves.map(shelf =>
                    shelf.id === shelfId
                      ? { ...shelf, items: [...shelf.items, newItem] }
                      : shelf
                  )
                }
              };
            }
            return w;
          })
        };
      }
      return f;
    }));
  };

  // 商品を編集
  const handleEditItem = (shelfId: string, itemId: string, updates: Partial<ShelfItem["items"][0]>) => {
    if (!selectedWarehouse?.map) return;

    setFactories(factories.map(f => {
      if (f.id === selectedFactoryId) {
        return {
          ...f,
          warehouses: f.warehouses.map(w => {
            if (w.id === selectedWarehouse.id && w.map) {
              return {
                ...w,
                map: {
                  ...w.map,
                  shelves: w.map.shelves.map(shelf =>
                    shelf.id === shelfId
                      ? {
                          ...shelf,
                          items: shelf.items.map(item =>
                            item.id === itemId
                              ? { ...item, ...updates }
                              : item
                          )
                        }
                      : shelf
                  )
                }
              };
            }
            return w;
          })
        };
      }
      return f;
    }));
  };

  const renderWarehouseMap = (warehouse: Warehouse) => {
    if (!warehouse.map) return null;

    return (
      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ width: warehouse.map.width, height: warehouse.map.height }}>
        {warehouse.map.shelves.map(shelf => (
          <Draggable
            key={shelf.id}
            position={{ x: shelf.x, y: shelf.y }}
            onDrag={(_e: any, data: { x: number; y: number }) => handleShelfDrag(shelf.id, data.x, data.y)}
            bounds="parent"
          >
            <Resizable
              width={shelf.width}
              height={shelf.height}
              onResize={(_e: React.SyntheticEvent, { size }: ResizeCallbackData) => handleShelfResize(shelf.id, size.width, size.height)}
              draggableOpts={{ grid: [25, 25] }}
            >
              <div
                className="absolute bg-white border-2 border-blue-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                style={{
                  width: shelf.width,
                  height: shelf.height,
                }}
                onClick={() => handleShelfClick(shelf)}
              >
                <div className="flex flex-col items-center">
                  <FaGripVertical className="text-blue-400 mb-1" />
                  <span className="text-sm font-medium text-blue-900">{shelf.name}</span>
                </div>
              </div>
            </Resizable>
          </Draggable>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="max-w-[95%] mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-900">工場管理</h1>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setIsAdmin(!isAdmin)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isAdmin ? "管理者モード" : "一般ユーザーモード"}
              
            </Button>
            {isAdmin && (
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <FaPlus className="mr-2" />
                新規工場
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 space-y-4 bg-white/80 rounded-lg p-4 shadow-sm">
            {factories.map((factory) => (
              <Card key={factory.id} className="bg-white/90 backdrop-blur-sm border border-gray-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        className="text-blue-900 hover:bg-blue-100"
                        onClick={() => toggleFactory(factory.id)}
                      >
                        {expandedFactory === factory.id ? <FaChevronDown /> : <FaChevronRight />}
                      </Button>
                      <CardTitle className="text-blue-900 text-lg">{factory.name}</CardTitle>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          className="text-blue-600 hover:bg-blue-100"
                          onClick={() => openFactoryEditDialog(factory)}
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="text-red-500 hover:bg-red-100"
                          onClick={() => handleFactoryDelete(factory.id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                {expandedFactory === factory.id && (
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-medium text-gray-900">倉庫一覧</h3>
                        {isAdmin && (
                          <Button 
                            size="sm" 
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => {
                              setSelectedFactoryId(factory.id);
                              setEditingWarehouse(null);
                              setNewWarehouse({ name: "", status: "active", shelfCount: 0 });
                              setIsWarehouseDialogOpen(true);
                            }}
                          >
                            <FaPlus className="mr-2" />
                            新規倉庫
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {factory.warehouses.map((warehouse) => (
                          <div
                            key={warehouse.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedWarehouse(warehouse)}
                          >
                            <div className="flex items-center gap-3">
                              <FaWarehouse className="text-blue-500 text-lg" />
                              <div>
                                <div className="font-medium text-base">{warehouse.name}</div>
                                <div className="text-sm text-gray-500">
                                  {warehouse.shelfCount}個の棚
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded-full text-sm ${
                                WAREHOUSE_STATUS[warehouse.status].color
                              }`}>
                                {WAREHOUSE_STATUS[warehouse.status].label}
                              </span>
                              {isAdmin && (
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-blue-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openWarehouseEditDialog(factory.id, warehouse);
                                    }}
                                  >
                                    <FaEdit />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-red-500"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleWarehouseDelete(factory.id, warehouse.id);
                                    }}
                                  >
                                    <FaTrash />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <div className="lg:col-span-3 space-y-4">
            {selectedWarehouse ? (
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-blue-50 border-b border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaMap className="text-blue-500" />
                      <CardTitle className="text-blue-900">
                        {selectedWarehouse.name} - 倉庫マップ
                      </CardTitle>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                          <FaPlus className="mr-2" />
                          棚を追加
                        </Button>
                        <Button variant="outline" className="border-blue-300 text-blue-700">
                          <FaEdit className="mr-2" />
                          編集
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-center">
                    {renderWarehouseMap(selectedWarehouse)}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/90 backdrop-blur-sm h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FaMap className="mx-auto text-4xl mb-2" />
                  <p>倉庫を選択してマップを表示</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* 工場編集ダイアログ */}
      <Dialog open={isFactoryDialogOpen} onOpenChange={setIsFactoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFactory ? "工場を編集" : "新規工場を追加"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="factory-name">工場名</Label>
              <Input
                id="factory-name"
                value={newFactory.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewFactory({ ...newFactory, name: e.target.value })}
                placeholder="工場名を入力"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFactoryDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleFactorySubmit}>
              {editingFactory ? "更新" : "追加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 倉庫編集ダイアログ */}
      <Dialog open={isWarehouseDialogOpen} onOpenChange={setIsWarehouseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingWarehouse ? "倉庫を編集" : "新規倉庫を追加"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse-name">倉庫名</Label>
              <Input
                id="warehouse-name"
                value={newWarehouse.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                placeholder="倉庫名を入力"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse-status">ステータス</Label>
              <Select
                value={newWarehouse.status}
                onValueChange={(value: string) => setNewWarehouse({ ...newWarehouse, status: value as "active" | "inactive" | "maintenance" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ステータスを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">稼働中</SelectItem>
                  <SelectItem value="inactive">停止中</SelectItem>
                  <SelectItem value="maintenance">メンテナンス中</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse-shelves">棚の数</Label>
              <Input
                id="warehouse-shelves"
                type="number"
                value={newWarehouse.shelfCount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewWarehouse({ ...newWarehouse, shelfCount: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWarehouseDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleWarehouseSubmit}>
              {editingWarehouse ? "更新" : "追加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 棚の詳細ダイアログ */}
      <Dialog open={isShelfDetailOpen} onOpenChange={setIsShelfDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedShelf?.name} - 棚の詳細</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {selectedShelf?.items.map((item) => (
                <div key={item.id} className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">商品番号: {item.number}</div>
                      <div className="text-gray-600">{item.name}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingShelfItem({ shelfId: selectedShelf.id, item })}
                    >
                      <FaEdit />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              className="w-full"
              onClick={() => selectedShelf && handleAddItem(selectedShelf.id)}
            >
              <FaPlus className="mr-2" />
              商品を追加
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 商品編集ダイアログ */}
      <Dialog
        open={!!editingShelfItem}
        onOpenChange={() => setEditingShelfItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>商品を編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-number">商品番号</Label>
              <Input
                id="item-number"
                value={editingShelfItem?.item.number}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  editingShelfItem &&
                  handleEditItem(editingShelfItem.shelfId, editingShelfItem.item.id, {
                    number: e.target.value
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-name">商品名</Label>
              <Input
                id="item-name"
                value={editingShelfItem?.item.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  editingShelfItem &&
                  handleEditItem(editingShelfItem.shelfId, editingShelfItem.item.id, {
                    name: e.target.value
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingShelfItem(null)}>
              キャンセル
            </Button>
            <Button onClick={() => setEditingShelfItem(null)}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Factories; 