import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Pencil, Trash2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
  lastLogin?: string;
  status: "active" | "inactive";
}

interface UserListProps {
  users: User[];
  isAdmin: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export function UserList({ users, isAdmin, onEdit, onDelete }: UserListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名前</TableHead>
            <TableHead>メールアドレス</TableHead>
            <TableHead>権限</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead>最終ログイン</TableHead>
            <TableHead>作成日</TableHead>
            {isAdmin && <TableHead className="w-[100px]">操作</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge 
                  variant={user.role === "admin" ? "default" : "secondary"}
                  className={user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}
                >
                  {user.role === "admin" ? "管理者" : "一般"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={user.status === "active" ? "default" : "secondary"}
                  className={user.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                >
                  {user.status === "active" ? "アクティブ" : "非アクティブ"}
                </Badge>
              </TableCell>
              <TableCell>
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "未ログイン"}
              </TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              {isAdmin && (
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit?.(user)}
                      className="hover:bg-purple-100 hover:text-purple-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete?.(user)}
                      className="hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 