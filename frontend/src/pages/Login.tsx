import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import '../styles/Login.css';
import { Button } from '../components/ui/button';
const Login: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 実際のログイン処理を実装
    navigate('/home');
  };

  return (
    <div className="login-container">
      <div className="login-box glass-effect">
        <h1>在庫管理システム</h1>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group modern">
            <FaUser className="input-icon" />
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              placeholder=" "
            />
            <label htmlFor="userId">ユーザーID</label>
          </div>
          <div className="form-group modern">
            <FaLock className="input-icon" />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
            />
            <label htmlFor="password">パスワード</label>
          </div>
          <Button type="submit" className="login-button modern">
            ログイン
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login; 