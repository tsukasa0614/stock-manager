import React from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useAuth } from "../../hooks/useAuth";

export function UserModeSwitch() {
  // 本番では削除: 開発用のユーザー切り替え機能
  const [currentRole, setCurrentRole] = React.useState<"admin" | "user">("admin");
  const { setUser } = useAuth();

  // 本番では削除: 開発用のユーザー切り替え機能
  React.useEffect(() => {
    setUser({
      id: "1",
      name: currentRole === "admin" ? "管理者" : "一般ユーザー",
      email: currentRole === "admin" ? "admin@example.com" : "user@example.com",
      role: currentRole,
    });
  }, [currentRole, setUser]);

  return (
    <div className="flex justify-center mb-6">
      <Tabs value={currentRole} onValueChange={(value) => setCurrentRole(value as "admin" | "user")}>
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="admin">管理者モード</TabsTrigger>
          <TabsTrigger value="user">一般ユーザーモード</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
} 