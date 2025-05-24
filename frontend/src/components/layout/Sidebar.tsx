import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Factory,
  Users,
  Settings,
  X,
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
    title: "商品発注",
    href: "/orders",
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

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-indigo-600 via-indigo-500 to-indigo-600 border-r border-indigo-400/20 flex flex-col">
      <div className="p-6 border-b border-indigo-400/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <FaBox className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">在庫管理</h1>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === item.href
                    ? "bg-white/20 text-white shadow-lg shadow-indigo-500/20"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="font-medium">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-indigo-400/20">
        <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">ユーザー名</p>
            <p className="text-xs text-white/70 truncate">管理者</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => {}}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 