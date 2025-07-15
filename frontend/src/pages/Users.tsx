import { useState } from "react";
import { UserDialog } from "../components/users/UserDialog";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { FaUsers, FaUserPlus, FaChartLine, FaCrown, FaUserCheck, FaCalendarAlt, FaSearch, FaUser } from "react-icons/fa";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
  lastLogin?: string;
  status: "active" | "inactive";
}

// モックユーザーデータ
const mockUsers: User[] = [
  {
    id: "admin",
    name: "管理者",
    email: "admin@example.com",
    role: "admin",
    createdAt: "2024-01-01",
    lastLogin: "2024-01-15",
    status: "active"
  },
  {
    id: "user1",
    name: "田中太郎",
    email: "tanaka@example.com",
    role: "user",
    createdAt: "2024-01-05",
    lastLogin: "2024-01-14",
    status: "active"
  },
  {
    id: "user2",
    name: "佐藤花子",
    email: "sato@example.com",
    role: "user",
    createdAt: "2024-01-10",
    lastLogin: "2024-01-13",
    status: "active"
  },
  {
    id: "user3",
    name: "山田次郎",
    email: "yamada@example.com",
    role: "user",
    createdAt: "2024-01-12",
    status: "inactive"
  },
  {
    id: "user4",
    name: "鈴木一郎",
    email: "suzuki@example.com",
    role: "user",
    createdAt: "2024-01-08",
    lastLogin: "2024-01-12",
    status: "active"
  }
];

export function Users() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // 統計データ
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    activeUsers: users.filter(u => u.status === "active").length,
    newThisMonth: users.filter(u => {
      const userDate = new Date(u.createdAt);
      const now = new Date();
      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
    }).length,
  };

  // フィルタリング
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSubmit = (userData: Omit<User, "id" | "createdAt">) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
    } else {
      const newUser: User = {
        ...userData,
        id: String(users.length + 1),
        createdAt: new Date().toISOString().split('T')[0],
        status: "active"
      };
      setUsers([...users, newUser]);
    }
    setIsDialogOpen(false);
    setEditingUser(undefined);
  };

  const handleDeleteUser = (user: User) => {
    setUsers(users.filter(u => u.id !== user.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-red-100">
      <div className="container mx-auto py-6 space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
                <FaUsers className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  ユーザー管理
                </h1>
                <p className="text-gray-600">User Management System</p>
              </div>
            </div>
            {isAdmin && (
              <Button
                onClick={() => {
                  setEditingUser(undefined);
                  setIsDialogOpen(true);
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <FaUserPlus />
                ユーザーを追加
              </Button>
            )}
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">総ユーザー数</p>
                    <p className="text-2xl font-bold text-red-700">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <FaUsers className="text-red-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">管理者数</p>
                    <p className="text-2xl font-bold text-red-700">{stats.admins}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <FaCrown className="text-red-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">アクティブユーザー</p>
                    <p className="text-2xl font-bold text-red-700">{stats.activeUsers}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <FaUserCheck className="text-red-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">新規ユーザー</p>
                    <p className="text-2xl font-bold text-red-700">{stats.newThisMonth}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <FaCalendarAlt className="text-red-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* フィルター・検索 */}
          <Card className="mb-8 shadow-xl bg-white border-0">
            <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-200">
              <CardTitle className="text-red-900 text-lg flex items-center gap-2">
                <FaSearch />
                フィルター・検索
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">検索</label>
                  <input
                    type="text"
                    placeholder="名前またはメールアドレス..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">役割</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as "all" | "admin" | "user")}
                    className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="all">すべて</option>
                    <option value="admin">管理者</option>
                    <option value="user">一般ユーザー</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                    className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="all">すべて</option>
                    <option value="active">アクティブ</option>
                    <option value="inactive">非アクティブ</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ユーザーリスト */}
          <Card className="shadow-xl bg-white border-0">
            <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-200">
              <CardTitle className="text-red-900 text-lg flex items-center gap-2">
                <FaChartLine />
                ユーザー一覧 ({filteredUsers.length}人)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-red-900">ユーザー</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-red-900">役割</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-red-900">ステータス</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-red-900">最終ログイン</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-red-900">登録日</th>
                      {isAdmin && <th className="px-6 py-4 text-left text-sm font-medium text-red-900">操作</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-red-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "admin" 
                              ? "bg-red-100 text-red-800" 
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {user.role === "admin" ? (
                              <>
                                <FaCrown className="mr-1" />
                                管理者
                              </>
                            ) : (
                              <>
                                <FaUser className="mr-1" />
                                一般ユーザー
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {user.status === "active" ? "アクティブ" : "非アクティブ"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.lastLogin || "未ログイン"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.createdAt}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  setEditingUser(user);
                                  setIsDialogOpen(true);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white"
                                size="sm"
                              >
                                編集
                              </Button>
                              <Button
                                onClick={() => handleDeleteUser(user)}
                                className="bg-gray-500 hover:bg-gray-600 text-white"
                                size="sm"
                              >
                                削除
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {isAdmin && (
          <UserDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSubmit={handleSubmit}
            user={editingUser}
          />
        )}
      </div>
    </div>
  );
} 