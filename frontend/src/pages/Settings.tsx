import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { UserModeSwitch } from "../components/common/UserModeSwitch";
import { useAuth } from "../hooks/useAuth";
import { 
  FaCog, 
  FaBell, 
  FaPalette, 
  FaDatabase, 
  FaLanguage, 
  FaDownload, 
  FaUpload,
  FaSave,
  FaCheck
} from "react-icons/fa";

interface SettingsState {
  // システム設定
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  
  // 通知設定
  emailNotifications: boolean;
  pushNotifications: boolean;
  stockAlerts: boolean;
  systemAlerts: boolean;
  
  // 表示設定
  theme: string;
  itemsPerPage: number;
  showAdvancedFeatures: boolean;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"system" | "notifications" | "appearance">("system");
  const [settings, setSettings] = useState<SettingsState>({
    language: "ja",
    timezone: "Asia/Tokyo",
    dateFormat: "YYYY/MM/DD",
    currency: "JPY",
    emailNotifications: true,
    pushNotifications: true,
    stockAlerts: true,
    systemAlerts: false,
    theme: "light",
    itemsPerPage: 20,
    showAdvancedFeatures: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // TODO: 実際の保存処理を実装
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-purple-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const tabs = [
    { id: "system", label: "システム", icon: <FaCog /> },
    { id: "notifications", label: "通知", icon: <FaBell /> },
    { id: "appearance", label: "表示", icon: <FaPalette /> },
  ];

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <Card className="shadow-lg bg-white border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
          <CardTitle className="text-purple-900 text-lg flex items-center gap-2">
            <FaLanguage />
            言語・地域設定
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">言語</label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange("language", e.target.value)}
                className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-700 bg-white"
              >
                <option value="ja" className="bg-white text-purple-700">日本語</option>
                <option value="en" className="bg-white text-purple-700">English</option>
                <option value="zh" className="bg-white text-purple-700">中文</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">タイムゾーン</label>
              <select
                value={settings.timezone}
                onChange={(e) => handleSettingChange("timezone", e.target.value)}
                className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-700 bg-white"
              >
                <option value="Asia/Tokyo" className="bg-white text-purple-700">Asia/Tokyo (JST)</option>
                <option value="UTC" className="bg-white text-purple-700">UTC</option>
                <option value="America/New_York" className="bg-white text-purple-700">America/New_York (EST)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">日付形式</label>
              <select
                value={settings.dateFormat}
                onChange={(e) => handleSettingChange("dateFormat", e.target.value)}
                className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-700 bg-white"
              >
                <option value="YYYY/MM/DD" className="bg-white text-purple-700">YYYY/MM/DD</option>
                <option value="MM/DD/YYYY" className="bg-white text-purple-700">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY" className="bg-white text-purple-700">DD/MM/YYYY</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">通貨</label>
              <select
                value={settings.currency}
                onChange={(e) => handleSettingChange("currency", e.target.value)}
                className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-700 bg-white"
              >
                <option value="JPY" className="bg-white text-purple-700">JPY (¥)</option>
                <option value="USD" className="bg-white text-purple-700">USD ($)</option>
                <option value="EUR" className="bg-white text-purple-700">EUR (€)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg bg-white border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
          <CardTitle className="text-purple-900 text-lg flex items-center gap-2">
            <FaDatabase />
            データ管理
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white flex items-center gap-2">
              <FaDownload />
              データエクスポート
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white flex items-center gap-2">
              <FaUpload />
              データインポート
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card className="shadow-lg bg-white border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
          <CardTitle className="text-purple-900 text-lg flex items-center gap-2">
            <FaBell />
            通知設定
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-purple-700">メール通知</h4>
              <p className="text-sm text-purple-500">重要な更新をメールで受信</p>
            </div>
            <ToggleSwitch
              enabled={settings.emailNotifications}
              onChange={() => handleSettingChange("emailNotifications", !settings.emailNotifications)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-purple-700">プッシュ通知</h4>
              <p className="text-sm text-purple-500">ブラウザでのプッシュ通知</p>
            </div>
            <ToggleSwitch
              enabled={settings.pushNotifications}
              onChange={() => handleSettingChange("pushNotifications", !settings.pushNotifications)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-purple-700">在庫アラート</h4>
              <p className="text-sm text-purple-500">在庫不足時の通知</p>
            </div>
            <ToggleSwitch
              enabled={settings.stockAlerts}
              onChange={() => handleSettingChange("stockAlerts", !settings.stockAlerts)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-purple-700">システムアラート</h4>
              <p className="text-sm text-purple-500">システムメンテナンス等の通知</p>
            </div>
            <ToggleSwitch
              enabled={settings.systemAlerts}
              onChange={() => handleSettingChange("systemAlerts", !settings.systemAlerts)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <Card className="shadow-lg bg-white border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
          <CardTitle className="text-purple-900 text-lg flex items-center gap-2">
            <FaPalette />
            表示設定
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">テーマ</label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange("theme", e.target.value)}
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-700 bg-white"
            >
              <option value="light" className="bg-white text-purple-700">ライト</option>
              <option value="dark" className="bg-white text-purple-700">ダーク</option>
              <option value="auto" className="bg-white text-purple-700">自動</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">1ページあたりの表示件数</label>
            <select
              value={settings.itemsPerPage}
              onChange={(e) => handleSettingChange("itemsPerPage", parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-700 bg-white"
            >
              <option value={10} className="bg-white text-purple-700">10件</option>
              <option value={20} className="bg-white text-purple-700">20件</option>
              <option value={50} className="bg-white text-purple-700">50件</option>
              <option value={100} className="bg-white text-purple-700">100件</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-purple-700">高度な機能を表示</h4>
              <p className="text-sm text-purple-500">上級者向けの機能を表示</p>
            </div>
            <ToggleSwitch
              enabled={settings.showAdvancedFeatures}
              onChange={() => handleSettingChange("showAdvancedFeatures", !settings.showAdvancedFeatures)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "system":
        return renderSystemSettings();
      case "notifications":
        return renderNotificationSettings();
      case "appearance":
        return renderAppearanceSettings();
      default:
        return renderSystemSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100">
      <div className="container mx-auto py-6 space-y-6">
        {/* 本番では削除: 開発用のユーザー切り替え機能 */}
        <UserModeSwitch />

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <FaCog className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  設定
                </h1>
                <p className="text-purple-600">System Settings</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              className={`px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 ${
                saved 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
              } text-white`}
            >
              {saved ? <FaCheck /> : <FaSave />}
              {saved ? '保存完了' : '設定を保存'}
            </Button>
          </div>

          {/* タブナビゲーション */}
          <div className="flex flex-wrap gap-2 mb-8 p-2 bg-purple-50 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                    : 'text-purple-700 hover:bg-purple-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* タブコンテンツ */}
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings; 