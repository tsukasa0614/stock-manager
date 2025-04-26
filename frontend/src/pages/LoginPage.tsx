//rafc
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/LoginPage.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 指定のID/パスワードでの認証
    if (userId === 'mi' && password === 'tsu') {
      // ログイン成功
      login('dummy-token');  // 仮のトークン
      navigate('/home');
    } else {
      // ログイン失敗
      setError('ユーザーIDまたはパスワードが間違っています');
    }
  };

  return (
    <div className="login-container">
      <h1>在庫管理システム</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="ユーザーID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="login-button">
          ログイン
        </button>
      </form>
    </div>
  );
};
