import { useState } from "react";
import { apiClient } from "../api/client";
import { Button } from "@mui/material";

type FactoryStatus = "active" | "inactive";

export function FactoryRegister() {
  const [factoryName, setFactoryName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [capacity, setCapacity] = useState(0);

  
  const handleSave = async () => {
    const factoryData = {
      factory_name: factoryName,
      address: address,
      phone: phone,
      status: status,
      capacity: capacity,
    }
    try {
      const res = await apiClient.createFactory(factoryData);
      console.log("Factory registered:", res.data);
    } catch (error) {
      console.error("Error registering factory:", error);
    }
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">工場登録</h1>
        {/* 既存のコンテンツ */}


        {/* 工場登録フォーム */}
        <div>
          <input
            type="text" value={factoryName} onChange={(e) => setFactoryName(e.target.value)} placeholder="工場名" />
          <input
            type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="住所" />
          <input
            type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="電話番号" />
          <select value={status} onChange={(e) => setStatus(e.target.value as FactoryStatus)}>
            <option value="active">アクティブ</option>
            <option value="inactive">非アクティブ</option>
          </select>
          <input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} placeholder="容量" />
          <Button onClick={handleSave}>登録</Button>
        </div>
      </div>
    </div>
  );
} 