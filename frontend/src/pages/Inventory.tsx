import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FaBoxOpen, FaTruck, FaArrowUp, FaMapMarkerAlt, FaClipboardList, } from "react-icons/fa";
import { UserModeSwitch } from "../components/common/UserModeSwitch";

// 管理者用メニュー
const adminMenuItems = [
  { key: "register", label: "在庫登録・削除", icon: <FaBoxOpen /> },
  { key: "locations", label: "場所登録・削除", icon: <FaMapMarkerAlt /> },
];

// 一般ユーザー用メニュー
const userMenuItems = [
  { key: "receiving", label: "在庫入荷", icon: <FaTruck /> },
  { key: "shipping", label: "在庫出荷", icon: <FaArrowUp /> },
  { key: "check", label: "在庫確認", icon: <FaClipboardList /> },
];

const dummyStock = [
  { id: 1, name: "商品A", location: "倉庫A", quantity: 120, updated: "2024-05-21" },
  { id: 2, name: "商品B", location: "倉庫B", quantity: 80, updated: "2024-05-20" },
  { id: 3, name: "商品C", location: "倉庫A", quantity: 50, updated: "2024-05-19" },
];

const Inventory: React.FC = () => {
  const [selected, setSelected] = useState("check");
  const [isAdmin, setIsAdmin] = useState(false); // 管理者フラグ
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 本番では削除: 開発用のユーザー切り替え機能 */}
      <UserModeSwitch />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">在庫管理</h1>
        <div className="flex justify-between items-center mb-8">
          <Button
            onClick={() => setIsAdmin(!isAdmin)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isAdmin ? "管理者モード" : "一般ユーザーモード"}
          </Button>
        </div>

        {/* 管理者用メニュー */}
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {adminMenuItems.map(item => (
              <Card
                key={item.key}
                className={`cursor-pointer transition-all shadow-md border-2 ${
                  selected === item.key
                    ? "border-blue-500 ring-2 ring-blue-300 scale-[1.03] bg-white"
                    : "border-blue-100 hover:border-blue-300 hover:scale-105 bg-white/80 backdrop-blur-sm"
                }`}
                onClick={() => {
                  if (item.key === "register") {
                    navigate("/inventory/register");
                  } else {
                    setSelected(item.key);
                  }
                }}
              >
                <CardHeader className="flex flex-row items-center gap-4 py-6">
                  <div className={`text-3xl ${selected === item.key ? "text-blue-500" : "text-blue-400"}`}>{item.icon}</div>
                  <CardTitle className="text-lg font-semibold text-blue-900">{item.label}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* 一般ユーザー用メニュー */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {userMenuItems.map(item => (
            <Card
              key={item.key}
              className={`cursor-pointer transition-all shadow-md border-2 ${
                selected === item.key
                  ? "border-blue-500 ring-2 ring-blue-300 scale-[1.03] bg-white"
                  : "border-blue-100 hover:border-blue-300 hover:scale-105 bg-white/80 backdrop-blur-sm"
              }`}
              onClick={() => setSelected(item.key)}
            >
              <CardHeader className="flex flex-row items-center gap-4 py-6">
                <div className={`text-3xl ${selected === item.key ? "text-blue-500" : "text-blue-400"}`}>{item.icon}</div>
                <CardTitle className="text-lg font-semibold text-blue-900">{item.label}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* 以下、既存の在庫確認や他のカードの内容 */}
        {selected === "check" && (
          <Card className="shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-900">在庫一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-2 border border-blue-200">ID</th>
                      <th className="px-4 py-2 border border-blue-200">商品名</th>
                      <th className="px-4 py-2 border border-blue-200">保管場所</th>
                      <th className="px-4 py-2 border border-blue-200">在庫数</th>
                      <th className="px-4 py-2 border border-blue-200">最終更新日</th>
                      <th className="px-4 py-2 border border-blue-200">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dummyStock.map(stock => (
                      <tr key={stock.id} className="even:bg-blue-50/50">
                        <td className="px-4 py-2 border border-blue-200">{stock.id}</td>
                        <td className="px-4 py-2 border border-blue-200">{stock.name}</td>
                        <td className="px-4 py-2 border border-blue-200">{stock.location}</td>
                        <td className="px-4 py-2 border border-blue-200 text-right">{stock.quantity}</td>
                        <td className="px-4 py-2 border border-blue-200">{stock.updated}</td>
                        <td className="px-4 py-2 border border-blue-200 text-center">
                          <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">編集</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
        {selected === "register" && (
          <Card className="shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-900">在庫登録・削除</CardTitle>
            </CardHeader>
            <CardContent>
              （ここに在庫登録・削除フォームを追加予定）
            </CardContent>
          </Card>
        )}
        {selected === "receiving" && (
          <Card className="shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-900">在庫入荷</CardTitle>
            </CardHeader>
            <CardContent>
              （ここに在庫入荷フォームを追加予定）
            </CardContent>
          </Card>
        )}
        {selected === "shipping" && (
          <Card className="shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-900">在庫出荷</CardTitle>
            </CardHeader>
            <CardContent>
              （ここに在庫出荷フォームを追加予定）
            </CardContent>
          </Card>
        )}
        {selected === "locations" && (
          <Card className="shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-900">場所登録・削除</CardTitle>
            </CardHeader>
            <CardContent>
              （ここに場所管理フォームを追加予定）
            </CardContent>
          </Card>
        )}
        {selected === "factorymap" && (
          <Card className="shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-900">工場マップ</CardTitle>
            </CardHeader>
            <CardContent>
              （ここに工場マップの機能を追加予定）
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Inventory; 