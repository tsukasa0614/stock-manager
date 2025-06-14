import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { FaPlus, FaTrash, FaEdit, FaUpload, FaImage, FaArrowLeft, FaBoxOpen, FaSearch, FaEye } from "react-icons/fa";

const tabs = [
  { key: "add", label: "在庫登録", icon: <FaPlus />, color: "from-blue-500 to-blue-600" },
  { key: "edit", label: "在庫編集", icon: <FaEdit />, color: "from-emerald-500 to-emerald-600" },
  { key: "delete", label: "在庫削除", icon: <FaTrash />, color: "from-red-500 to-red-600" },
];

const categories = ["食品", "飲料", "日用品", "電化製品", "家具", "衣類", "文房具", "その他"];
const units = ["個", "箱", "袋", "本", "kg", "g", "L", "mL", "m", "cm", "セット"];
const locations = ["倉庫A-1", "倉庫A-2", "倉庫B-1", "倉庫B-2", "倉庫C-1", "倉庫C-2", "店舗前", "冷蔵庫"];

// ダミー商品データ
const dummyProducts = [
  { id: 1, code: "PROD-001", name: "商品A", spec: "500g", category: "食品", stock: 120, minStock: 20, unit: "個", price: 150, location: "倉庫A-1", memo: "人気商品", image: null },
  { id: 2, code: "PROD-002", name: "商品B", spec: "1L", category: "飲料", stock: 80, minStock: 15, unit: "本", price: 200, location: "倉庫A-2", memo: "", image: null },
  { id: 3, code: "PROD-003", name: "商品C", spec: "300g", category: "食品", stock: 15, minStock: 30, unit: "個", price: 180, location: "倉庫B-1", memo: "要補充", image: null },
  { id: 4, code: "PROD-004", name: "商品D", spec: "大サイズ", category: "日用品", stock: 0, minStock: 10, unit: "個", price: 300, location: "倉庫B-2", memo: "在庫切れ", image: null },
];

const InventoryRegister: React.FC = () => {
  const [tab, setTab] = useState("add");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const navigate = useNavigate();

  // フォーム状態
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    spec: "",
    category: "",
    stock: "",
    minStock: "",
    unit: "",
    price: "",
    location: "",
    memo: "",
    image: null as File | null
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      spec: "",
      category: "",
      stock: "",
      minStock: "",
      unit: "",
      price: "",
      location: "",
      memo: "",
      image: null
    });
    setPreviewImage(null);
    setSelectedProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ここで実際の登録・編集・削除処理を行う
    console.log("Form submitted:", formData);
    alert(`${tabs.find(t => t.key === tab)?.label}が完了しました！`);
    resetForm();
  };

  const filteredProducts = dummyProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadProductForEdit = (product: any) => {
    setSelectedProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      spec: product.spec,
      category: product.category,
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      unit: product.unit,
      price: product.price.toString(),
      location: product.location,
      memo: product.memo,
      image: null
    });
    setPreviewImage(product.image);
  };

  const renderProductSearch = () => (
    <div className="mb-6">
      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="商品名または商品コードで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
        {filteredProducts.map(product => (
          <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <FaBoxOpen className="text-blue-400 text-xl" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.code}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{product.category}</Badge>
                    <span className="text-xs text-gray-500">在庫: {product.stock}{product.unit}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {tab === "edit" && (
                    <Button
                      size="sm"
                      onClick={() => loadProductForEdit(product)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <FaEdit className="mr-1" />
                      編集
                    </Button>
                  )}
                  {tab === "delete" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`${product.name}を削除しますか？`)) {
                          alert(`${product.name}を削除しました`);
                        }
                      }}
                    >
                      <FaTrash className="mr-1" />
                      削除
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 商品画像 */}
      <div>
        <label className="block mb-3 font-semibold text-gray-700">商品画像</label>
        <div className="flex items-center gap-6">
          <div className="relative aspect-square h-32 w-32 overflow-hidden rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 flex items-center justify-center">
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="h-full w-full object-cover rounded-xl" />
            ) : (
              <FaImage className="text-4xl text-blue-300" />
            )}
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              <FaUpload />
              <span>画像を選択</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {previewImage && (
              <Button type="button" variant="outline" onClick={() => setPreviewImage(null)}>
                画像をクリア
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block mb-2 font-semibold text-gray-700">商品コード *</label>
          <input
            required
            value={formData.code}
            onChange={(e) => handleInputChange("code", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例: PROD-001"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700">商品名 *</label>
          <input
            required
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="商品名を入力"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block mb-2 font-semibold text-gray-700">規格</label>
          <input
            value={formData.spec}
            onChange={(e) => handleInputChange("spec", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例: 500g, 1L, 大サイズ"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700">カテゴリー *</label>
          <select
            required
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">カテゴリーを選択</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* 在庫情報 */}
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <label className="block mb-2 font-semibold text-gray-700">在庫数 *</label>
          <input
            required
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => handleInputChange("stock", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700">最低在庫 *</label>
          <input
            required
            type="number"
            min="0"
            value={formData.minStock}
            onChange={(e) => handleInputChange("minStock", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700">単位 *</label>
          <select
            required
            value={formData.unit}
            onChange={(e) => handleInputChange("unit", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">単位を選択</option>
            {units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block mb-2 font-semibold text-gray-700">単価（円） *</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700">保管場所 *</label>
          <select
            required
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">保管場所を選択</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* メモ */}
      <div>
        <label className="block mb-2 font-semibold text-gray-700">メモ</label>
        <textarea
          value={formData.memo}
          onChange={(e) => handleInputChange("memo", e.target.value)}
          className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="商品に関するメモや注意事項を入力"
          rows={4}
        />
      </div>

      {/* ボタン */}
      <div className="flex gap-4 pt-6">
        <Button
          type="submit"
          className={`flex-1 bg-gradient-to-r ${tabs.find(t => t.key === tab)?.color} hover:opacity-90 text-white py-3 text-lg font-semibold`}
        >
          {tab === "add" && <FaPlus className="mr-2" />}
          {tab === "edit" && <FaEdit className="mr-2" />}
          {tab === "delete" && <FaTrash className="mr-2" />}
          {tabs.find(t => t.key === tab)?.label}
        </Button>
        <Button type="button" variant="outline" onClick={resetForm} className="flex-1 py-3 text-lg">
          リセット
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <div className="container mx-auto py-6 space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate("/inventory")}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <FaArrowLeft className="mr-2" />
                在庫管理に戻る
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <FaBoxOpen className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    商品管理システム
                  </h1>
                  <p className="text-gray-600">Product Management System</p>
                </div>
              </div>
            </div>
          </div>

          {/* タブ */}
          <div className="flex gap-2 mb-8">
            {tabs.map(t => (
              <Button
                key={t.key}
                variant={tab === t.key ? "default" : "outline"}
                onClick={() => {
                  setTab(t.key);
                  resetForm();
                }}
                className={`flex items-center gap-2 px-6 py-3 text-lg font-semibold transition-all duration-200 ${
                  tab === t.key 
                    ? `bg-gradient-to-r ${t.color} text-white shadow-lg` 
                    : "border-blue-200 text-blue-700 hover:bg-blue-50"
                }`}
              >
                {t.icon}
                {t.label}
              </Button>
            ))}
          </div>

          {/* メインコンテンツ */}
          <Card className="shadow-xl bg-white border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
              <CardTitle className="text-blue-900 text-xl flex items-center gap-3">
                {tabs.find(t => t.key === tab)?.icon}
                {tabs.find(t => t.key === tab)?.label}
                {selectedProduct && tab === "edit" && (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    編集中: {selectedProduct.name}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {(tab === "edit" || tab === "delete") && renderProductSearch()}
              {(tab === "add" || (tab === "edit" && selectedProduct) || tab === "delete") && renderForm()}
              
              {tab === "edit" && !selectedProduct && (
                <div className="text-center py-12 text-gray-500">
                  <FaSearch className="text-4xl mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">編集する商品を検索して選択してください</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InventoryRegister; 