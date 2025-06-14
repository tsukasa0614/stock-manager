import React, { useState } from "react";
import { UserList } from "../components/users/UserList";
import { UserDialog } from "../components/users/UserDialog";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../hooks/useAuth";
import { UserModeSwitch } from "../components/common/UserModeSwitch";
import { FaUsers, FaUserShield, FaUserPlus, FaChartLine, FaCrown, FaUserCheck, FaCalendarAlt, FaSearch, FaFilter } from "react-icons/fa";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
  lastLogin?: string;
  status: "active" | "inactive";
}

// モックデータ（拡張版）
const mockUsers: User[] = [
  {
    id: "1",
    name: "山田太郎",
    email: "yamada@example.com",
    role: "admin",
    createdAt: "2024-01-01",
    lastLogin: "2024-05-20",
    status: "active",
  },
  {
    id: "2",
    name: "鈴木花子",
    email: "suzuki@example.com",
    role: "user",
    createdAt: "2024-01-02",
    lastLogin: "2024-05-19",
    status: "active",
  },
  {
    id: "3",
    name: "佐藤次郎",
    email: "sato@example.com",
    role: "user",
    createdAt: "2024-01-15",
    lastLogin: "2024-05-18",
    status: "active",
  },
  {
    id: "4",
    name: "田中美咲",
    email: "tanaka@example.com",
    role: "user",
    createdAt: "2024-02-01",
    lastLogin: "2024-05-10",
    status: "inactive",
  },
  {
    id: "5",
    name: "高橋健一",
    email: "takahashi@example.com",
    role: "admin",
    createdAt: "2024-02-15",
    lastLogin: "2024-05-20",
    status: "active",
  },
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <div className="container mx-auto py-6 space-y-6">
        {/* 本番では削除: 開発用のユーザー切り替え機能 */}
        <UserModeSwitch />

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                <FaUsers className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <FaUserPlus />
                ユーザーを追加
              </Button>
            )}
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">総ユーザー数</p>
                    <p className="text-3xl font-bold text-blue-800">{stats.total}</p>
                    <p className="text-blue-600 text-xs">人</p>
                  </div>
                  <FaUsers className="text-4xl text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">管理者</p>
                    <p className="text-3xl font-bold text-purple-800">{stats.admins}</p>
                    <p className="text-purple-600 text-xs">人</p>
                  </div>
                  <FaCrown className="text-4xl text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-600 text-sm font-medium">アクティブ</p>
                    <p className="text-3xl font-bold text-emerald-800">{stats.activeUsers}</p>
                    <p className="text-emerald-600 text-xs">人</p>
                  </div>
                  <FaUserCheck className="text-4xl text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">今月新規</p>
                    <p className="text-3xl font-bold text-orange-800">{stats.newThisMonth}</p>
                    <p className="text-orange-600 text-xs">人</p>
                  </div>
                  <FaCalendarAlt className="text-4xl text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 検索・フィルター */}
          <Card className="shadow-xl bg-white border-0 mb-6">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                <FaSearch />
                検索・フィルター
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">検索</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="名前またはメールアドレス"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">権限</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as "all" | "admin" | "user")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
              <CardTitle className="text-purple-900 text-lg flex items-center gap-2">
                <FaChartLine />
                ユーザー一覧 ({filteredUsers.length}人)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <UserList
                users={filteredUsers}
                isAdmin={isAdmin}
                onEdit={isAdmin ? (user) => {
                  setEditingUser(user);
                  setIsDialogOpen(true);
                } : undefined}
                onDelete={isAdmin ? handleDeleteUser : undefined}
              />
            </CardContent>
          </Card>
        </div>

        <UserDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleSubmit}
          user={editingUser}
        />
      </div>
    </div>
  );
} 