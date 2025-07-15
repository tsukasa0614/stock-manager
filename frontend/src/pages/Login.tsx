import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaWarehouse, FaBoxOpen, FaChartLine } from 'react-icons/fa';
import '../styles/Login.css';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, token, isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login) return;

    setLoading(true);
    setError('');
    
    try {
      console.log('Login attempt:', { userId, password: '***' });
      await login(userId, password);
      console.log('Login successful');
      // ログイン成功時は useEffect でナビゲーションを処理
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Login component - Auth state:', { token: !!token, isAuthenticated });
    if (token && isAuthenticated) {
      console.log('Navigating to /home');
      navigate('/home');
    }
  }, [token, isAuthenticated, navigate]);

  return (
    <div className="inventory-login-container">
      <div className="inventory-login-card">
        {/* システムヘッダー */}
        <div className="system-header">
          <div className="system-logo">
            <FaWarehouse className="logo-icon" />
          </div>
          <div className="system-info">
            <h1 className="system-title">在庫管理システム</h1>
            <p className="system-subtitle">Inventory Management System</p>
            <div className="system-version">v2.0</div>
          </div>
        </div>

        {/* 機能紹介 */}
        <div className="features-section">
          <div className="feature-item">
            <FaBoxOpen className="feature-icon" />
            <span>商品管理</span>
          </div>
          <div className="feature-item">
            <FaChartLine className="feature-icon" />
            <span>入出庫</span>
          </div>
          <div className="feature-item">
            <FaWarehouse className="feature-icon" />
            <span>在庫確認</span>
          </div>
        </div>

        {/* ログインフォーム */}
        <div className="login-form-section">
          <h2 className="form-title">システムログイン</h2>
          
          {/* エラーメッセージ */}
          {error && (
            <div className="error-alert">
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* ログインフォーム */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  placeholder="ユーザーID"
                  disabled={loading}
                  className="form-input"
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="パスワード"
                  disabled={loading}
                  className="form-input"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="login-submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  ログイン中...
                </>
              ) : (
                'ログイン'
              )}
            </Button>
          </form>

          {/* テストアカウント情報 */}
          <div className="test-credentials">
            <div className="test-header">テスト用アカウント</div>
            <div className="test-accounts">
              <div className="test-account">
                <strong>管理者:</strong> test_admin / test123
              </div>
              <div className="test-account">
                <strong>現場担当者:</strong> test_user / test123
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="login-footer">
          <p>&copy; 2024 在庫管理システム</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 