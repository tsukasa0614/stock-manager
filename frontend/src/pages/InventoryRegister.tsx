import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FaPlus, FaTrash, FaEdit, FaUpload, FaImage } from "react-icons/fa";

const tabs = [
  { key: "add", label: "在庫登録", icon: <FaPlus /> },
  { key: "delete", label: "在庫削除", icon: <FaTrash /> },
  { key: "edit", label: "在庫編集", icon: <FaEdit /> },
];

const categories = ["電化製品", "家具", "衣類", "食品"];
const units = ["個", "箱", "kg", "m"];
const locations = ["倉庫A", "倉庫B", "店舗C"];
const orderMethods = ["自動発注", "手動発注", "定期発注"];
const suppliers = ["サプライヤーA", "サプライヤーB", "サプライヤーC"];
const leadTimes = ["1-2日", "3-5日", "1週間", "2週間"];

const InventoryRegister: React.FC = () => {
  const [tab, setTab] = useState("add");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = () => {
    if (tab === "add") {
      return (
        <form className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">商品画像</label>
            <div className="flex items-center gap-4">
              <div className="relative aspect-square h-32 w-32 overflow-hidden rounded-lg border bg-gray-50 flex items-center justify-center">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <FaImage className="text-4xl text-gray-300" />
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <FaUpload />
                <span className="underline">画像を選択</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              {previewImage && (
                <Button type="button" variant="outline" onClick={() => setPreviewImage(null)}>
                  画像をクリア
                </Button>
              )}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 font-medium">商品コード</label>
              <input className="w-full border rounded px-3 py-2" placeholder="例: PROD-001" />
            </div>
            <div>
              <label className="block mb-1 font-medium">商品名</label>
              <input className="w-full border rounded px-3 py-2" placeholder="商品名を入力" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 font-medium">規格</label>
              <input className="w-full border rounded px-3 py-2" placeholder="規格を入力" />
            </div>
            <div>
              <label className="block mb-1 font-medium">カテゴリー</label>
              <select className="w-full border rounded px-3 py-2">
                <option value="">カテゴリーを選択</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 font-medium">在庫数</label>
              <input className="w-full border rounded px-3 py-2" type="number" min="0" placeholder="0" />
            </div>
            <div>
              <label className="block mb-1 font-medium">最低在庫数</label>
              <input className="w-full border rounded px-3 py-2" type="number" min="0" placeholder="0" />
            </div>
            <div>
              <label className="block mb-1 font-medium">単位</label>
              <select className="w-full border rounded px-3 py-2">
                <option value="">単位を選択</option>
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">単価（円）</label>
            <input className="w-full border rounded px-3 py-2" type="number" min="0" placeholder="0" />
          </div>
          <div>
            <label className="block mb-1 font-medium">保管場所</label>
            <select className="w-full border rounded px-3 py-2">
              <option value="">保管場所を選択</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 font-medium">発注方法</label>
              <select className="w-full border rounded px-3 py-2">
                <option value="">発注方法を選択</option>
                {orderMethods.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">発注先</label>
              <select className="w-full border rounded px-3 py-2">
                <option value="">発注先を選択</option>
                {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">納期</label>
              <select className="w-full border rounded px-3 py-2">
                <option value="">納期を選択</option>
                {leadTimes.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">備考</label>
            <textarea className="w-full border rounded px-3 py-2 resize-none" placeholder="備考を入力" rows={3} />
          </div>
          <div className="flex gap-4 justify-end">
            <Button type="submit" className="flex-1">登録</Button>
            <Button type="reset" variant="outline" className="flex-1">キャンセル</Button>
          </div>
        </form>
      );
    } else if (tab === "delete") {
      return (
        <form className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">削除する商品ID</label>
            <input className="w-full border rounded px-3 py-2" type="number" placeholder="商品ID" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="submit" variant="destructive">削除</Button>
            <Button type="reset" variant="outline">キャンセル</Button>
          </div>
        </form>
      );
    } else if (tab === "edit") {
      return (
        <form className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">編集する商品ID</label>
            <input className="w-full border rounded px-3 py-2" type="number" placeholder="商品ID" />
          </div>
          <div>
            <label className="block mb-1 font-medium">新しい商品名</label>
            <input className="w-full border rounded px-3 py-2" placeholder="新しい商品名" />
          </div>
          <div>
            <label className="block mb-1 font-medium">新しい在庫数</label>
            <input className="w-full border rounded px-3 py-2" type="number" placeholder="新しい在庫数" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="submit">編集</Button>
            <Button type="reset" variant="outline">キャンセル</Button>
          </div>
        </form>
      );
    }
    return null;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8 text-gray-800">在庫登録・削除・編集</h1>
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <Button
            key={t.key}
            variant={tab === t.key ? "default" : "outline"}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-2"
          >
            {t.icon}
            {t.label}
          </Button>
        ))}
      </div>
      <Card className="max-w-xl mx-auto shadow">
        <CardHeader>
          <CardTitle>{tabs.find(t => t.key === tab)?.label}</CardTitle>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
};

export default InventoryRegister; 