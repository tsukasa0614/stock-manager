import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Factory,
  Users,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { Button } from "../ui/button";
import { FaBox } from "react-icons/fa";

const menuItems = [
  {
    title: "ダッシュボード",
    href: "/home",
    icon: LayoutDashboard,
    color: "bg-yellow-500",
  },
  {
    title: "在庫管理",
    href: "/inventory",
    icon: Package,
    color: "bg-blue-500",
  },
  {
    title: "棚卸管理",
    href: "/stocktaking",
    icon: ShoppingCart,
    color: "bg-orange-500",
  },
  {
    title: "工場管理",
    href: "/factories",
    icon: Factory,
    color: "bg-green-500",
  },
  {
    title: "ユーザー管理",
    href: "/users",
    icon: Users,
    color: "bg-red-500",
  },
  {
    title: "設定",
    href: "/settings",
    icon: Settings,
    color: "bg-purple-500",
  },
];

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* モバイル用メニューボタン */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white hover:bg-gray-50 text-gray-700 p-2 shadow-lg border border-gray-200"
          size="sm"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* モバイル用オーバーレイ */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* サイドバー */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 
        transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'} 
        bg-gradient-to-b from-white via-gray-50 to-white 
        border-r border-gray-200 flex flex-col h-screen shadow-xl
      `}>
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-200 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <FaBox className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && <h1 className="text-xl font-bold text-gray-800">在庫管理</h1>}
          </div>
          
          {/* デスクトップ用折りたたみボタン */}
          <div className="hidden md:block absolute -right-3 top-1/2 transform -translate-y-1/2">
            <Button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-6 h-6 bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 rounded-full p-0 shadow-md"
              size="sm"
            >
              {isCollapsed ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronLeft className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl transition-all duration-200 ${
                    location.pathname === item.href
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-800 shadow-lg border border-blue-100"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  }`}
                  title={isCollapsed ? item.title : undefined}
                >
                  <div className={`min-w-[2rem] h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  {!isCollapsed && <span className="font-medium">{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ユーザー情報 */}
        <div className="p-4 border-t border-gray-200">
          {isCollapsed ? (
            /* 折りたたみ時：アイコンのみ */
            <div className="flex justify-center">
              <div 
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg"
                title="ユーザー名 (管理者)"
              >
                U
              </div>
            </div>
          ) : (
            /* 展開時：フル表示 */
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                U
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">ユーザー名</p>
                <p className="text-xs text-gray-500 truncate">管理者</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                onClick={() => {}}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 