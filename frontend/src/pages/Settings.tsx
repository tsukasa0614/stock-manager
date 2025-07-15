import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { 
  FaCog, 
  FaBell, 
  FaPalette, 
  FaLanguage, 
  FaSave,
  FaCheck,
  FaUser,
  FaShieldAlt
} from "react-icons/fa";

interface SettingsState {
  language: string;
  notifications: boolean;
  theme: string;
  itemsPerPage: number;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    language: "ja",
    notifications: true,
    theme: "light",
    itemsPerPage: 20,
  });
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
        enabled ? 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg' : 'bg-gray-400 shadow-md'
      }`}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-all duration-300 ease-in-out ${
          enabled ? 'translate-x-7' : 'translate-x-0.5'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200">
      <div className="container mx-auto py-6 space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <FaCog className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  設定
                </h1>
                <p className="text-gray-600">Settings</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              className={`bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 ${
                saved ? 'bg-green-500 hover:bg-green-600' : ''
              }`}
            >
              {saved ? <FaCheck /> : <FaSave />}
              {saved ? '保存しました' : '設定を保存'}
            </Button>
          </div>

          {/* ユーザー情報 */}
          <Card className="mb-8 shadow-lg bg-white border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
              <CardTitle className="text-purple-900 text-lg flex items-center gap-2">
                <FaUser />
                ユーザー情報
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {user?.id?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-800">{user?.id || 'ユーザー'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {user?.role === 'admin' ? (
                      <FaShieldAlt className="text-red-500" />
                    ) : (
                      <FaUser className="text-blue-500" />
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user?.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user?.role === 'admin' ? '管理者' : '現場担当者'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 基本設定 */}
          <Card className="shadow-lg bg-white border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
              <CardTitle className="text-purple-900 text-lg flex items-center gap-2">
                <FaCog />
                基本設定
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* 言語設定 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaLanguage className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">言語</p>
                      <p className="text-sm text-gray-600">表示言語を選択</p>
                    </div>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* 通知設定 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaBell className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">通知</p>
                      <p className="text-sm text-gray-600">システム通知を有効化</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={settings.notifications}
                    onChange={() => handleSettingChange('notifications', !settings.notifications)}
                  />
                </div>

                {/* テーマ設定 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaPalette className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">テーマ</p>
                      <p className="text-sm text-gray-600">表示テーマを選択</p>
                    </div>
                  </div>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="light">ライト</option>
                    <option value="dark">ダーク</option>
                  </select>
                </div>

                {/* 表示件数設定 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaCog className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">表示件数</p>
                      <p className="text-sm text-gray-600">1ページあたりの表示数</p>
                    </div>
                  </div>
                  <select
                    value={settings.itemsPerPage}
                    onChange={(e) => handleSettingChange('itemsPerPage', parseInt(e.target.value))}
                    className="px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value={10}>10件</option>
                    <option value={20}>20件</option>
                    <option value={50}>50件</option>
                    <option value={100}>100件</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings; 