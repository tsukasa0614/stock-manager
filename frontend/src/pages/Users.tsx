import React, { useState } from "react";
import { UserList } from "../components/users/UserList";
import { UserDialog } from "../components/users/UserDialog";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { UserModeSwitch } from "../components/common/UserModeSwitch";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

// モックデータ
const mockUsers: User[] = [
  {
    id: "1",
    name: "山田太郎",
    email: "yamada@example.com",
    role: "admin",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "鈴木花子",
    email: "suzuki@example.com",
    role: "user",
    createdAt: "2024-01-02",
  },
];

export function Users() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const handleSubmit = (userData: Omit<User, "id" | "createdAt">) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
    } else {
      setUsers([...users, { ...userData, id: String(users.length + 1), createdAt: new Date().toISOString().split('T')[0] }]);
    }
    setIsDialogOpen(false);
    setEditingUser(undefined);
  };

  const handleDeleteUser = (user: User) => {
    setUsers(users.filter(u => u.id !== user.id));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 本番では削除: 開発用のユーザー切り替え機能 */}
      <UserModeSwitch />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
            <p className="text-gray-600 mt-1">
              システムユーザーの追加・編集・削除を行います
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => {
                setEditingUser(undefined);
                setIsDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              ユーザーを追加
            </Button>
          )}
        </div>

        <UserList
          users={users}
          isAdmin={isAdmin}
          onEdit={isAdmin ? (user) => {
            setEditingUser(user);
            setIsDialogOpen(true);
          } : undefined}
          onDelete={isAdmin ? handleDeleteUser : undefined}
        />
      </div>

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        user={editingUser}
      />
    </div>
  );
} 