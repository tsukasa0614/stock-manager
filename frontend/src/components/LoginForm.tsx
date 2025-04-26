import { useState } from 'react';

interface LoginFormProps {
  onSubmit: (userId: string, password: string) => void;
}

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(userId, password);
  };

  return (
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
      <button type="submit" className="login-button">
        ログイン
      </button>
    </form>
  );
}; 