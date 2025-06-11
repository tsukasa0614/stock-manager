import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FaDownload, FaRedo, FaBolt, FaExclamationTriangle, FaBox, FaLink, FaTimes } from "react-icons/fa";
import { UserModeSwitch } from "../components/common/UserModeSwitch";

const dummyOrders = [
  { id: 1, product: "商品A", quantity: 100, supplier: "サプライヤーA", status: "発注済", date: "2024-03-15", type: "リピート" },
  { id: 2, product: "商品B", quantity: 50, supplier: "サプライヤーB", status: "入荷待ち", date: "2024-03-14", type: "スポット" },
  { id: 3, product: "商品C", quantity: 200, supplier: "サプライヤーC", status: "入荷完了", date: "2024-03-13", type: "リピート" },
];

const dummyAlertItems = [
  { id: 1, product: "商品D", currentStock: 5, minStock: 20, supplier: "サプライヤーA", lastOrder: "2024-03-10" },
  { id: 2, product: "商品E", currentStock: 3, minStock: 15, supplier: "サプライヤーB", lastOrder: "2024-03-12" },
  { id: 3, product: "商品F", currentStock: 8, minStock: 30, supplier: "サプライヤーC", lastOrder: "2024-03-08" },
];

const dummySets = [
  { id: 1, name: "セットA", items: ["商品A", "商品B", "商品C"], price: 5000 },
  { id: 2, name: "セットB", items: ["商品D", "商品E"], price: 3000 },
];

const dummyProducts = [
  { id: 1, name: "商品A", price: 1000, unit: "個", stock: 100, supplier: "サプライヤーA", category: "食品" },
  { id: 2, name: "商品B", price: 2000, unit: "箱", stock: 0, supplier: "サプライヤーA", category: "飲料" },
  { id: 3, name: "商品C", price: 1500, unit: "個", stock: 200, supplier: "サプライヤーA", category: "食品" },
  { id: 4, name: "商品D", price: 3000, unit: "セット", stock: 0, supplier: "サプライヤーB", category: "日用品" },
  { id: 5, name: "商品E", price: 2500, unit: "箱", stock: 80, supplier: "サプライヤーB", category: "飲料" },
  { id: 6, name: "商品F", price: 1800, unit: "個", stock: 150, supplier: "サプライヤーB", category: "日用品" },
];

const categories = ["すべて", "食品", "飲料", "日用品"];

const OrderStatus = {
  "発注済": "bg-yellow-100 text-yellow-800",
  "入荷待ち": "bg-blue-100 text-blue-800",
  "入荷完了": "bg-green-100 text-green-800",
};

const OrderType = {
  "リピート": "bg-purple-100 text-purple-800",
  "スポット": "bg-orange-100 text-orange-800",
};

type ViewType = "main" | "alert" | "set" | "repeatA" | "repeatB" | "spotA" | "spotB";

const Orders: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>("main");
  const [spotForm, setSpotForm] = useState({
    productName: "",
    unitPrice: "",
    unit: "",
    deliveryDate: "",
    note: "",
  });
  const [cart, setCart] = useState<Array<{ product: typeof dummyProducts[0], quantity: number }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("すべて");

  const handleSpotFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSpotForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderMainView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card 
        className="cursor-pointer hover:scale-105 transition-all duration-200 bg-gradient-to-br from-red-50 to-red-100 border-red-200"
        onClick={() => setCurrentView("alert")}
      >
        <CardHeader className="bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500" />
            <CardTitle className="text-red-900">アラート品</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-red-700">在庫が少ない商品の一覧を確認</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:scale-105 transition-all duration-200 bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        onClick={() => setCurrentView("set")}
      >
        <CardHeader className="bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-2">
            <FaLink className="text-green-500" />
            <CardTitle className="text-green-900">セット品登録</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-green-700">セット商品の登録と管理</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:scale-105 transition-all duration-200 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        onClick={() => setCurrentView("repeatA")}
      >
        <CardHeader className="bg-purple-50 border-b border-purple-200">
          <div className="flex items-center gap-2">
            <FaRedo className="text-purple-500" />
            <CardTitle className="text-purple-900">リピート発注A</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-purple-700">サプライヤーAへの定期発注</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:scale-105 transition-all duration-200 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        onClick={() => setCurrentView("repeatB")}
      >
        <CardHeader className="bg-purple-50 border-b border-purple-200">
          <div className="flex items-center gap-2">
            <FaRedo className="text-purple-500" />
            <CardTitle className="text-purple-900">リピート発注B</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-purple-700">サプライヤーBへの定期発注</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:scale-105 transition-all duration-200 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
        onClick={() => setCurrentView("spotA")}
      >
        <CardHeader className="bg-orange-50 border-b border-orange-200">
          <div className="flex items-center gap-2">
            <FaBolt className="text-orange-500" />
            <CardTitle className="text-orange-900">スポット発注A</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-orange-700">サプライヤーAへの単発発注</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:scale-105 transition-all duration-200 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
        onClick={() => setCurrentView("spotB")}
      >
        <CardHeader className="bg-orange-50 border-b border-orange-200">
          <div className="flex items-center gap-2">
            <FaBolt className="text-orange-500" />
            <CardTitle className="text-orange-900">スポット発注B</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-orange-700">サプライヤーBへの単発発注</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderAlertView = () => (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-red-200">
      <CardHeader className="bg-red-50 border-b border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500" />
            <CardTitle className="text-red-900">アラート品</CardTitle>
          </div>
          <Button 
            variant="outline" 
            className="border-red-300 text-red-700 hover:bg-red-50"
            onClick={() => setCurrentView("main")}
          >
            戻る
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-red-50">
              <tr>
                <th className="px-4 py-2 border border-red-200">商品名</th>
                <th className="px-4 py-2 border border-red-200">現在の在庫</th>
                <th className="px-4 py-2 border border-red-200">最低在庫数</th>
                <th className="px-4 py-2 border border-red-200">発注先</th>
                <th className="px-4 py-2 border border-red-200">最終発注日</th>
                <th className="px-4 py-2 border border-red-200">操作</th>
              </tr>
            </thead>
            <tbody>
              {dummyAlertItems.map(item => (
                <tr key={item.id} className="even:bg-red-50/50">
                  <td className="px-4 py-2 border border-red-200">{item.product}</td>
                  <td className="px-4 py-2 border border-red-200 text-right text-red-600 font-medium">{item.currentStock}</td>
                  <td className="px-4 py-2 border border-red-200 text-right">{item.minStock}</td>
                  <td className="px-4 py-2 border border-red-200">{item.supplier}</td>
                  <td className="px-4 py-2 border border-red-200">{item.lastOrder}</td>
                  <td className="px-4 py-2 border border-red-200 text-center">
                    <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                      発注
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderSetView = () => (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-green-200">
      <CardHeader className="bg-green-50 border-b border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaLink className="text-green-500" />
            <CardTitle className="text-green-900">セット品登録</CardTitle>
          </div>
          <Button 
            variant="outline" 
            className="border-green-300 text-green-700 hover:bg-green-50"
            onClick={() => setCurrentView("main")}
          >
            戻る
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-green-50">
              <tr>
                <th className="px-4 py-2 border border-green-200">セット名</th>
                <th className="px-4 py-2 border border-green-200">構成商品</th>
                <th className="px-4 py-2 border border-green-200">価格</th>
                <th className="px-4 py-2 border border-green-200">操作</th>
              </tr>
            </thead>
            <tbody>
              {dummySets.map(set => (
                <tr key={set.id} className="even:bg-green-50/50">
                  <td className="px-4 py-2 border border-green-200">{set.name}</td>
                  <td className="px-4 py-2 border border-green-200">
                    <div className="flex flex-wrap gap-1">
                      {set.items.map((item, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2 border border-green-200 text-right">¥{set.price.toLocaleString()}</td>
                  <td className="px-4 py-2 border border-green-200 text-center">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                      発注
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderRepeatAView = () => {
    const filteredProducts = dummyProducts.filter(product => 
      product.supplier === "サプライヤーA" && 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === "すべて" || product.category === selectedCategory)
    );

    const addToCart = (product: typeof dummyProducts[0]) => {
      setCart(prev => {
        const existingItem = prev.find(item => item.product.id === product.id);
        if (existingItem) {
          return prev.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
    };

    const removeFromCart = (productId: number) => {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: number, quantity: number) => {
      if (quantity < 1) return;
      setCart(prev =>
        prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 商品一覧 */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-purple-200">
            <CardHeader className="bg-purple-50 border-b border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaRedo className="text-purple-500" />
                  <CardTitle className="text-purple-900">リピート発注A</CardTitle>
                </div>
                <Button 
                  variant="outline" 
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={() => setCurrentView("main")}
                >
                  戻る
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4 space-y-4">
                <input
                  type="text"
                  placeholder="商品を検索..."
                  className="w-full p-2 border rounded-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className={`${
                        selectedCategory === category
                          ? "bg-purple-500 text-white hover:bg-purple-600"
                          : "border-purple-200 text-purple-700 hover:bg-purple-50"
                      } whitespace-nowrap`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map(product => (
                  <Card key={product.id} className={`border-purple-100 hover:shadow-md transition-shadow ${
                    product.stock === 0 ? "opacity-75" : ""
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{product.name}</h3>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm ${
                              product.stock === 0 ? "text-red-500" : "text-gray-500"
                            }`}>
                              {product.stock === 0 ? "在庫なし" : `在庫: ${product.stock}${product.unit}`}
                            </p>
                            {product.stock === 0 && (
                              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                                発注可能
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-purple-500 mb-1">{product.category}</p>
                          <p className="text-purple-600 font-medium">¥{product.price.toLocaleString()}</p>
                        </div>
                        <Button
                          size="sm"
                          className={`${
                            product.stock === 0
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-purple-500 hover:bg-purple-600"
                          } text-white`}
                          onClick={() => addToCart(product)}
                        >
                          {product.stock === 0 ? "発注" : "カートに追加"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* カート */}
        <div>
          <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-purple-200 sticky top-6">
            <CardHeader className="bg-purple-50 border-b border-purple-200">
              <CardTitle className="text-purple-900">発注カート</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">カートは空です</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex items-center gap-4 p-2 bg-purple-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-gray-500">¥{item.product.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <FaTimes className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-purple-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">合計金額</span>
                      <span className="text-xl font-bold text-purple-600">¥{totalAmount.toLocaleString()}</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-200">
                      発注する
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderRepeatBView = () => {
    const filteredProducts = dummyProducts.filter(product => 
      product.supplier === "サプライヤーB" && 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === "すべて" || product.category === selectedCategory)
    );

    const addToCart = (product: typeof dummyProducts[0]) => {
      setCart(prev => {
        const existingItem = prev.find(item => item.product.id === product.id);
        if (existingItem) {
          return prev.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
    };

    const removeFromCart = (productId: number) => {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: number, quantity: number) => {
      if (quantity < 1) return;
      setCart(prev =>
        prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 商品一覧 */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-purple-200">
            <CardHeader className="bg-purple-50 border-b border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaRedo className="text-purple-500" />
                  <CardTitle className="text-purple-900">リピート発注B</CardTitle>
                </div>
                <Button 
                  variant="outline" 
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={() => setCurrentView("main")}
                >
                  戻る
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4 space-y-4">
                <input
                  type="text"
                  placeholder="商品を検索..."
                  className="w-full p-2 border rounded-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className={`${
                        selectedCategory === category
                          ? "bg-purple-500 text-white hover:bg-purple-600"
                          : "border-purple-200 text-purple-700 hover:bg-purple-50"
                      } whitespace-nowrap`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map(product => (
                  <Card key={product.id} className={`border-purple-100 hover:shadow-md transition-shadow ${
                    product.stock === 0 ? "opacity-75" : ""
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{product.name}</h3>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm ${
                              product.stock === 0 ? "text-red-500" : "text-gray-500"
                            }`}>
                              {product.stock === 0 ? "在庫なし" : `在庫: ${product.stock}${product.unit}`}
                            </p>
                            {product.stock === 0 && (
                              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                                発注可能
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-purple-500 mb-1">{product.category}</p>
                          <p className="text-purple-600 font-medium">¥{product.price.toLocaleString()}</p>
                        </div>
                        <Button
                          size="sm"
                          className={`${
                            product.stock === 0
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-purple-500 hover:bg-purple-600"
                          } text-white`}
                          onClick={() => addToCart(product)}
                        >
                          {product.stock === 0 ? "発注" : "カートに追加"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* カート */}
        <div>
          <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-purple-200 sticky top-6">
            <CardHeader className="bg-purple-50 border-b border-purple-200">
              <CardTitle className="text-purple-900">発注カート</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">カートは空です</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex items-center gap-4 p-2 bg-purple-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-gray-500">¥{item.product.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <FaTimes className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-purple-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">合計金額</span>
                      <span className="text-xl font-bold text-purple-600">¥{totalAmount.toLocaleString()}</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-200">
                      発注する
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderSpotAView = () => (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-orange-200">
      <CardHeader className="bg-orange-50 border-b border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaBolt className="text-orange-500" />
            <CardTitle className="text-orange-900">スポット発注A</CardTitle>
          </div>
          <Button 
            variant="outline" 
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
            onClick={() => setCurrentView("main")}
          >
            戻る
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">品名</label>
              <input
                type="text"
                name="productName"
                value={spotForm.productName}
                onChange={handleSpotFormChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">単価</label>
              <input
                type="number"
                name="unitPrice"
                value={spotForm.unitPrice}
                onChange={handleSpotFormChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">単位</label>
              <input
                type="text"
                name="unit"
                value={spotForm.unit}
                onChange={handleSpotFormChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">納期</label>
              <input
                type="date"
                name="deliveryDate"
                value={spotForm.deliveryDate}
                onChange={handleSpotFormChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">備考</label>
            <textarea
              name="note"
              value={spotForm.note}
              onChange={handleSpotFormChange}
              className="w-full p-2 border rounded-md"
              rows={3}
            />
          </div>
          <div className="flex justify-end">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-200">
              発注
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSpotBView = () => (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-orange-200">
      <CardHeader className="bg-orange-50 border-b border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaBolt className="text-orange-500" />
            <CardTitle className="text-orange-900">スポット発注B</CardTitle>
          </div>
          <Button 
            variant="outline" 
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
            onClick={() => setCurrentView("main")}
          >
            戻る
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">品名</label>
              <input
                type="text"
                name="productName"
                value={spotForm.productName}
                onChange={handleSpotFormChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">単価</label>
              <input
                type="number"
                name="unitPrice"
                value={spotForm.unitPrice}
                onChange={handleSpotFormChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">単位</label>
              <input
                type="text"
                name="unit"
                value={spotForm.unit}
                onChange={handleSpotFormChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">納期</label>
              <input
                type="date"
                name="deliveryDate"
                value={spotForm.deliveryDate}
                onChange={handleSpotFormChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">備考</label>
            <textarea
              name="note"
              value={spotForm.note}
              onChange={handleSpotFormChange}
              className="w-full p-2 border rounded-md"
              rows={3}
            />
          </div>
          <div className="flex justify-end">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-200">
              発注
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 本番では削除: 開発用のユーザー切り替え機能 */}
      <UserModeSwitch />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">商品発注</h1>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50 hover:scale-105 transition-transform duration-200 shadow-md">
              <FaBox className="mr-2" />
              商品一覧
            </Button>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50 hover:scale-105 transition-transform duration-200 shadow-md">
              <FaDownload className="mr-2" />
              発注書ダウンロード
            </Button>
          </div>
        </div>

        {currentView === "main" && renderMainView()}
        {currentView === "alert" && renderAlertView()}
        {currentView === "set" && renderSetView()}
        {currentView === "repeatA" && renderRepeatAView()}
        {currentView === "repeatB" && renderRepeatBView()}
        {currentView === "spotA" && renderSpotAView()}
        {currentView === "spotB" && renderSpotBView()}
      </div>
    </div>
  );
};

export default Orders; 