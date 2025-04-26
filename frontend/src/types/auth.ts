export interface LoginCredentials {
  userId: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export interface TokenPayload {
  sub: string;
  role: string;
  exp: number;
} 