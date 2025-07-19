import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface UserMenuProps {
  isCollapsed?: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({ isCollapsed = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    if (logout) {
      const confirmed = window.confirm('ログアウトしますか？');
      if (confirmed) {
        logout();
        navigate('/login');
      }
    }
  };

  if (isCollapsed) {
    return (
      <div className="flex justify-center">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200"
            title="ユーザーメニュー"
          >
            {user?.id?.charAt(0).toUpperCase() || 'U'}
          </button>
          {isDropdownOpen && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px] z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{user?.id || 'ユーザー'}</p>
                <p className="text-xs text-gray-500">{user?.role === 'admin' ? '管理者' : '現場担当者'}</p>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                設定
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:from-gray-100 hover:to-blue-100 transition-all duration-200"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
          {user?.id?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-gray-800 truncate">{user?.id || 'ユーザー'}</p>
          <p className="text-xs text-gray-500">{user?.role === 'admin' ? '管理者' : '現場担当者'}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isDropdownOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-full z-50">
          <button
            onClick={() => {
              navigate('/settings');
              setIsDropdownOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            設定
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
};