import { LoginCredentials, AuthResponse } from '../types/auth';

// モックユーザーデータ
const MOCK_USER = {
  id: 'user-1',
  name: '在庫 太郎',
  role: 'admin'
};

// モックトークン生成
const generateToken = () => {
  const now = Date.now();
  const exp = now + 60 * 60 * 1000; // 1時間後
  return btoa(JSON.stringify({
    sub: MOCK_USER.id,
    role: MOCK_USER.role,
    exp: Math.floor(exp / 1000)
  }));
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // モックの認証処理
    if (credentials.userId === 'mi' && credentials.password === 'tsu') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            accessToken: generateToken(),
            refreshToken: 'mock-refresh-token',
            user: MOCK_USER
          });
        }, 1000); // 1秒の遅延を追加してローディング状態を確認
      });
    }
    return Promise.reject(new Error('Invalid credentials'));
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          accessToken: generateToken(),
          refreshToken: 'new-mock-refresh-token',
          user: MOCK_USER
        });
      }, 500);
    });
  },

  async logout(refreshToken: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  }
}; 