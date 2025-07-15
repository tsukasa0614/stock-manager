import { useAuth } from "../../contexts/AuthContext";

export function UserModeSwitch() {
  const { user, logout } = useAuth();

  if (!user) {
    return null; // ログインしていない場合は表示しない
  }

  return (
    <div className="flex justify-center mb-6">
      <div className="bg-white rounded-lg shadow-md p-4 border">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              ログイン中: <span className="font-semibold text-gray-800">{user.id}</span>
            </div>
            <div className="text-xs bg-gray-100 px-2 py-1 rounded">
              {user.role === "admin" ? "管理者" : "ユーザー"}
            </div>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
} 