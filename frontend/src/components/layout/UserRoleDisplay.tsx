import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserShield, FaUser } from 'react-icons/fa';

interface UserRoleDisplayProps {
  sidebarCollapsed?: boolean;
}

export const UserRoleDisplay: React.FC<UserRoleDisplayProps> = ({ sidebarCollapsed = false }) => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 z-50 transition-all duration-300 ${
      sidebarCollapsed ? 'left-20' : 'left-72'
    }`}>
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            user.role === 'admin' 
              ? 'bg-red-100 text-red-600' 
              : 'bg-blue-100 text-blue-600'
          }`}>
            {user.role === 'admin' ? (
              <FaUserShield className="w-4 h-4" />
            ) : (
              <FaUser className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-800">
              {user.id}
            </div>
            <div className={`text-xs font-semibold ${
              user.role === 'admin' 
                ? 'text-red-600' 
                : 'text-blue-600'
            }`}>
              {user.role === 'admin' ? '管理者' : '現場担当者'}
            </div>
            {user.managed_factories && user.managed_factories.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                工場: {user.managed_factories.map(f => f.name).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 