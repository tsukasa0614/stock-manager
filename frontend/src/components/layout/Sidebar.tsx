import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Factory,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/button";
import { FaBox, FaShieldAlt, FaUser, FaMapMarkerAlt } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

const menuItems = [
  {
    title: "ダッシュボード",
    href: "/home",
    icon: LayoutDashboard,
    color: "bg-yellow-500",
    requiredRole: null, // 全ユーザーがアクセス可能
  },
  {
    title: "在庫管理",
    href: "/inventory",
    icon: Package,
    color: "bg-blue-500",
    requiredRole: null, // 全ユーザーがアクセス可能
  },
  {
    title: "棚卸管理",
    href: "/stocktaking",
    icon: ShoppingCart,
    color: "bg-orange-500",
    requiredRole: null, // 全ユーザーがアクセス可能
  },
  {
    title: "工場管理",
    href: "/factories",
    icon: Factory,
    color: "bg-green-500",
    requiredRole: null, // 全ユーザーがアクセス可能（表示のみ）
  },
  {
    title: "ユーザー管理",
    href: "/users",
    icon: Users,
    color: "bg-red-500",
    requiredRole: null, // 全ユーザーがアクセス可能（表示のみ）
  },
  {
    title: "設定",
    href: "/settings",
    icon: Settings,
    color: "bg-purple-500",
    requiredRole: null, // 全ユーザーがアクセス可能
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const collapsed = isCollapsed !== undefined ? isCollapsed : internalIsCollapsed;

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse(!collapsed);
    } else {
      setInternalIsCollapsed(!internalIsCollapsed);
    }
  };

  const handleLogout = () => {
    if (logout) {
      const confirmed = window.confirm('ログアウトしますか？');
      if (confirmed) {
        logout();
        navigate('/login');
      }
    }
  };

  // ユーザーのアクセス権限を確認
  const hasAccess = (item: typeof menuItems[0]) => {
    if (!item.requiredRole) return true;
    return user?.role === item.requiredRole;
  };

  return (
    <>
      {/* モバイル用メニューボタン */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-lg"
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
        ${collapsed ? 'w-16' : 'w-64'} 
        bg-gradient-to-b from-white via-gray-50 to-white 
        border-r border-gray-200 flex flex-col h-screen shadow-xl
      `}>
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-200 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <FaBox className="w-6 h-6 text-white" />
            </div>
            {!collapsed && <h1 className="text-xl font-bold text-gray-800">在庫管理</h1>}
          </div>
          
          {/* デスクトップ用折りたたみボタン */}
          <div className="hidden md:block absolute -right-3 top-1/2 transform -translate-y-1/2">
            <Button
              onClick={toggleCollapse}
              className="w-6 h-6 bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 rounded-full p-0 shadow-md"
              size="sm"
            >
              {collapsed ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronLeft className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        {/* ログイン者情報 */}
        {!collapsed && (
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user?.id?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-800 truncate">{user?.id || 'ユーザー'}</p>
                  {user?.role === 'admin' ? (
                    <FaShieldAlt className="text-red-500 text-sm" />
                  ) : (
                    <FaUser className="text-blue-500 text-sm" />
                  )}
                </div>
                <p className={`text-xs font-medium ${
                  user?.role === 'admin' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {user?.role === 'admin' ? '管理者' : '現場担当者'}
                </p>
                {user?.managed_factories && user.managed_factories.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <FaMapMarkerAlt className="text-gray-500 text-xs" />
                    <p className="text-xs text-gray-500 truncate">
                      {user.managed_factories.map(f => f.name).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ログイン者情報 (折りたたみ時) */}
        {collapsed && (
          <div className="p-2 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg relative group">
                {user?.id?.charAt(0).toUpperCase() || 'U'}
                {user?.role === 'admin' && (
                  <FaShieldAlt className="absolute -top-1 -right-1 text-red-500 text-xs bg-white rounded-full p-0.5" />
                )}
                {/* ツールチップ */}
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {user?.id || 'ユーザー'} ({user?.role === 'admin' ? '管理者' : '現場担当者'})
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ナビゲーション */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.filter(hasAccess).map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl transition-all duration-200 ${
                    location.pathname === item.href
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  }`}
                  title={collapsed ? item.title : undefined}
                >
                  <div className={`min-w-[2rem] h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  {!collapsed && <span className="font-medium">{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ログアウトボタン */}
        <div className="p-4 border-t border-gray-200">
          {collapsed ? (
            <div className="flex justify-center">
              <Button
                onClick={handleLogout}
                className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-0 shadow-lg hover:shadow-xl transition-all duration-200"
                title="ログアウト"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </Button>
          )}
        </div>
      </div>
    </>
  );
} 