import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { FaPlus, FaTrash, FaEdit, FaUpload, FaImage, FaArrowLeft, FaBoxOpen, FaSearch, FaExclamationTriangle } from "react-icons/fa";
import { apiClient, type InventoryItem, type Factory } from "../api/client";
import { useAuth } from "../contexts/AuthContext";

const tabs = [
  { key: "add", label: "在庫登録", icon: <FaPlus />, color: "from-blue-500 to-blue-600" },
  { key: "edit", label: "在庫編集", icon: <FaEdit />, color: "from-emerald-500 to-emerald-600" },
  { key: "delete", label: "在庫削除", icon: <FaTrash />, color: "from-red-500 to-red-600" },
];

const categories = ["食品", "飲料", "日用品", "電化製品", "家具", "衣類", "文房具", "その他", "消耗品"];
const units = ["個", "箱", "袋", "本", "kg", "g", "L", "mL", "m", "cm", "セット"];
const locations = ["倉庫A-1", "倉庫A-2", "倉庫B-1", "倉庫B-2", "倉庫C-1", "倉庫C-2", "店舗前", "冷蔵庫"];

const InventoryRegister: React.FC = () => {
  const [tab, setTab] = useState("add");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // デバッグ: ユーザー情報をログ出力
  console.log('InventoryRegister - User Info:', user);
  console.log('InventoryRegister - User Role:', user?.role);
  console.log('InventoryRegister - Is Admin Check:', user?.role === "admin");

  // 管理者権限チェック
  const isAdmin = user?.role === "admin";

  // 管理者権限がない場合のアクセス制御
  if (!isAdmin) {
    console.log('InventoryRegister - Access Denied. User:', user, 'IsAdmin:', isAdmin);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">アクセス権限がありません</h2>
            <p className="text-gray-600 mb-6">
              この機能は管理者のみが利用できます。<br />
              現在のアカウント: {user?.id} (役割: {user?.role || '未設定'})
              <br />
              <small className="text-xs text-gray-400">
                Debug: isAdmin={String(isAdmin)}, user.role={user?.role}
              </small>
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/inventory")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <FaArrowLeft className="mr-2" />
                在庫管理画面に戻る
              </Button>
              <Button
                onClick={() => navigate("/home")}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white"
              >
                ホーム画面に戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('InventoryRegister - Access Granted. User is Admin.');

  // フォーム状態
  const [formData, setFormData] = useState({
    item_code: "",
    product_name: "",
    standard: "",
    category: "",
    stock_quantity: "",
    lowest_stock: "",
    unit: "",
    unit_price: "",
    storing_place: "",
    memo: "",
    factory: "",
    image: null as File | null
  });

  // データ読み込み
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // 在庫データと工場データを並行取得
      const [inventoriesRes, factoriesRes] = await Promise.all([
        apiClient.getInventories(),
        apiClient.getFactories()
      ]);

      if (inventoriesRes.data) {
        setInventories(inventoriesRes.data);
      } else {
        alert(inventoriesRes.error || "在庫データの取得に失敗しました");
      }

      if (factoriesRes.data) {
        setFactories(factoriesRes.data);
      } else {
        alert(factoriesRes.error || "工場データの取得に失敗しました");
      }
    } catch (err) {
      alert("データの読み込み中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

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
      item_code: "",
      product_name: "",
      standard: "",
      category: "",
      stock_quantity: "",
      lowest_stock: "",
      unit: "",
      unit_price: "",
      storing_place: "",
      memo: "",
      factory: "",
      image: null
    });
    setPreviewImage(null);
    setSelectedProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // 基本データを準備
      const data = {
        item_code: formData.item_code,
        product_name: formData.product_name,
        standard: formData.standard,
        category: formData.category,
        stock_quantity: parseInt(formData.stock_quantity),
        lowest_stock: parseInt(formData.lowest_stock),
        unit: formData.unit,
        unit_price: formData.unit_price,
        storing_place: formData.storing_place,
        memo: formData.memo,
        factory: parseInt(formData.factory),
      };

      // 画像ファイルを取得（FormDataから）
      const imageFile = formData.image || undefined;
      
      let response;
      
      if (tab === "add") {
        // 新規作成：画像ファイルの有無に応じて適切なメソッドを使用
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value.toString());
          }
        });
        if (imageFile) {
          formData.append('image', imageFile);
        }
        response = await apiClient.createInventory(formData);
        if (response.data) {
          alert("✅ 商品を登録しました！");
          resetForm();
          loadInitialData(); // データを再読み込み
          setTimeout(() => {
            navigate("/inventory"); // 在庫管理画面に戻る
          }, 1000);
        } else {
          alert(`❌ 登録に失敗しました: ${response.error}`);
        }
      } else if (tab === "edit" && selectedProduct) {
        // 更新：画像ファイルの有無に応じて適切なメソッドを使用
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value.toString());
          }
        });
        if (imageFile) {
          formData.append('image', imageFile);
        }
        response = await apiClient.updateInventory(selectedProduct.item_code, formData);
        if (response.data) {
          alert("✅ 商品を更新しました！");
          resetForm();
          loadInitialData(); // データを再読み込み
          setTimeout(() => {
            navigate("/inventory"); // 在庫管理画面に戻る
          }, 1000);
        } else {
          alert(`❌ 更新に失敗しました: ${response.error}`);
        }
      }
    } catch (err) {
      alert("❌ 処理中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (inventory: InventoryItem) => {
    if (!confirm(`【削除確認】\n\n商品名: ${inventory.product_name}\n商品コード: ${inventory.item_code}\n\nこの商品を完全に削除しますか？\nこの操作は取り消せません。`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.deleteInventory(inventory.item_code);
      
      if (!response.error) {
        alert(`✅ ${inventory.product_name} を削除しました`);
        loadInitialData(); // データを再読み込み
        setTimeout(() => {
          navigate("/inventory"); // 在庫管理画面に戻る
        }, 1000);
    } else {
      alert(`❌ 削除に失敗しました: ${response.error}`);
    }
    } catch (err) {
      alert("❌ 削除中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = inventories.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.item_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadProductForEdit = (product: InventoryItem) => {
    setSelectedProduct(product);
    setFormData({
      item_code: product.item_code,
      product_name: product.product_name,
      standard: product.standard || "",
      category: product.category,
      stock_quantity: product.stock_quantity.toString(),
      lowest_stock: product.lowest_stock.toString(),
      unit: product.unit,
      unit_price: product.unit_price,
      storing_place: product.storing_place || "",
      memo: product.memo || "",
      factory: product.factory.toString(),
      image: null
    });
    setPreviewImage(product.image || null);
  };

  const renderProductSearch = () => (
    <div className="mb-4 md:mb-6">
      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="商品名または商品コードで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 md:py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 text-sm md:text-base"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-h-60 md:max-h-80 overflow-y-auto">
        {filteredProducts.map(product => (
          <Card key={product.item_code} className="cursor-pointer hover:shadow-lg transition-all duration-200 border-blue-100 touch-manipulation">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {product.image ? (
                    <img src={product.image} alt={product.product_name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <FaBoxOpen className="text-blue-400 text-lg md:text-xl" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate text-sm md:text-base">{product.product_name}</p>
                  <p className="text-xs md:text-sm text-gray-500">{product.item_code}</p>
                  <div className="flex items-center gap-1 md:gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{product.category}</Badge>
                    <span className="text-xs text-gray-500">在庫: {product.stock_quantity}{product.unit}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {tab === "edit" && (
                    <Button
                      size="sm"
                      onClick={() => loadProductForEdit(product)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
                    >
                      <FaEdit className="mr-1" />
                      <span className="hidden sm:inline">編集</span>
                    </Button>
                  )}
                  {tab === "delete" && (
                    <Button
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white shadow-lg text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
                      onClick={() => handleDelete(product)}
                    >
                      <FaTrash className="mr-1" />
                      <span className="hidden sm:inline">削除</span>
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
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {/* 商品画像 */}
      <div>
        <label className="block mb-3 font-semibold text-gray-700">商品画像</label>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative aspect-square h-24 w-24 md:h-32 md:w-32 overflow-hidden rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 flex items-center justify-center">
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="h-full w-full object-cover rounded-xl" />
            ) : (
              <FaImage className="text-2xl md:text-4xl text-blue-300" />
            )}
          </div>
          <div className="flex flex-col gap-2 md:gap-3 w-full md:w-auto">
            <label className="flex items-center justify-center gap-2 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 md:py-3 rounded-lg transition-colors text-sm md:text-base">
              <FaUpload />
              <span>画像を選択</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {previewImage && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setPreviewImage(null)}
                className="text-sm md:text-base py-2 md:py-3"
              >
                画像をクリア
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <div>
          <label className="block mb-2 font-semibold text-gray-700 text-sm md:text-base">商品コード *</label>
          <input
            required
            value={formData.item_code}
            onChange={(e) => handleInputChange("item_code", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 text-sm md:text-base"
            placeholder="例: PROD-001"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700 text-sm md:text-base">商品名 *</label>
          <input
            required
            value={formData.product_name}
            onChange={(e) => handleInputChange("product_name", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 text-sm md:text-base"
            placeholder="商品名を入力"
          />
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <div>
          <label className="block mb-2 font-semibold text-gray-700 text-sm md:text-base">規格</label>
          <input
            value={formData.standard}
            onChange={(e) => handleInputChange("standard", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 text-sm md:text-base"
            placeholder="例: 500g, 1L, 大サイズ"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700 text-sm md:text-base">カテゴリー *</label>
          <select
            required
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base"
          >
            <option value="">カテゴリーを選択</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* 在庫情報 */}
      <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-3">
        <div>
          <label className="block mb-2 font-semibold text-gray-700 text-sm md:text-base">在庫数 *</label>
          <input
            required
            type="number"
            min="0"
            value={formData.stock_quantity}
            onChange={(e) => handleInputChange("stock_quantity", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 text-sm md:text-base"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700 text-sm md:text-base">最低在庫 *</label>
          <input
            required
            type="number"
            min="0"
            value={formData.lowest_stock}
            onChange={(e) => handleInputChange("lowest_stock", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 text-sm md:text-base"
            placeholder="0"
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="block mb-2 font-semibold text-gray-700 text-sm md:text-base">単位 *</label>
          <select
            required
            value={formData.unit}
            onChange={(e) => handleInputChange("unit", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base"
          >
            <option value="">単位を選択</option>
            {units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <div>
          <label className="block mb-2 font-semibold text-gray-700 text-sm md:text-base">単価（円） *</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={formData.unit_price}
            onChange={(e) => handleInputChange("unit_price", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 text-sm md:text-base"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700 text-sm md:text-base">保管場所</label>
          <select
            value={formData.storing_place}
            onChange={(e) => handleInputChange("storing_place", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base"
          >
            <option value="">保管場所を選択</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-1">
        <div>
          <label className="block mb-2 font-semibold text-gray-700 text-sm md:text-base">工場 *</label>
          <select
            required
            value={formData.factory}
            onChange={(e) => handleInputChange("factory", e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm md:text-base"
          >
            <option value="">工場を選択</option>
            {factories.map(f => <option key={f.id} value={f.id}>{f.factory_name}</option>)}
          </select>
        </div>
      </div>

      {/* メモ */}
      <div>
        <label className="block mb-2 font-semibold text-gray-700 text-sm md:text-base">メモ</label>
        <textarea
          value={formData.memo}
          onChange={(e) => handleInputChange("memo", e.target.value)}
          className="w-full border border-blue-200 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder-gray-500 text-sm md:text-base"
          placeholder="商品に関するメモや注意事項を入力"
          rows={4}
        />
      </div>

      {/* ボタン */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-4 md:pt-6">
        <Button
          type="submit"
          className={`flex-1 bg-gradient-to-r ${tabs.find(t => t.key === tab)?.color} hover:opacity-90 text-white py-3 md:py-4 text-base md:text-lg font-semibold touch-manipulation`}
          disabled={loading}
        >
          {loading ? "処理中..." : (
            <>
              {tab === "add" && <FaPlus className="mr-2" />}
              {tab === "edit" && <FaEdit className="mr-2" />}
              {tab === "delete" && <FaTrash className="mr-2" />}
              {tabs.find(t => t.key === tab)?.label}
            </>
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={resetForm} 
          className="flex-1 py-3 md:py-4 text-base md:text-lg touch-manipulation" 
          disabled={loading}
        >
          {loading ? "リセット中..." : "リセット"}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <div className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-4 md:p-8">
          {/* ヘッダー */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <Button
                onClick={() => navigate("/inventory")}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 text-sm md:text-base px-3 md:px-4 py-2"
              >
                <FaArrowLeft className="mr-1 md:mr-2" />
                在庫管理に戻る
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <FaBoxOpen className="text-lg md:text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    商品管理システム
                  </h1>
                  <p className="text-xs md:text-base text-gray-600 hidden md:block">Product Management System</p>
                </div>
              </div>
            </div>
          </div>

          {/* タブ */}
          <div className="flex flex-col md:flex-row gap-2 mb-6 md:mb-8">
            {tabs.map(t => (
              <Button
                key={t.key}
                variant={tab === t.key ? "default" : "outline"}
                onClick={() => {
                  setTab(t.key);
                  resetForm();
                }}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 text-sm md:text-lg font-semibold transition-all duration-200 ${
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
              <CardTitle className="text-blue-900 text-lg md:text-xl flex items-center gap-2 md:gap-3">
                {tabs.find(t => t.key === tab)?.icon}
                {tabs.find(t => t.key === tab)?.label}
                {selectedProduct && tab === "edit" && (
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs md:text-sm">
                    編集中: {selectedProduct.product_name}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-8">
              {(tab === "edit" || tab === "delete") && renderProductSearch()}
              {(tab === "add" || (tab === "edit" && selectedProduct)) && renderForm()}
              
              {tab === "edit" && !selectedProduct && (
                <div className="text-center py-8 md:py-12 text-gray-500">
                  <FaSearch className="text-3xl md:text-4xl mx-auto mb-4 text-gray-300" />
                  <p className="text-base md:text-lg">編集する商品を検索して選択してください</p>
                </div>
              )}
              
              {tab === "delete" && (
                <div className="text-center py-8 md:py-12 text-gray-500">
                  <FaTrash className="text-3xl md:text-4xl mx-auto mb-4 text-red-300" />
                  <p className="text-base md:text-lg">削除する商品を検索して選択してください</p>
                  <p className="text-sm mt-2">商品カードの削除ボタンをクリックすると削除されます</p>
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