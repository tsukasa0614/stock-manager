// APIクライアントの型定義

export interface InventoryItem {
  id: number;
  image?: string;
  item_code: string;
  product_name: string;
  standard?: string;
  category: string;
  stock_quantity: number;
  lowest_stock: number;
  unit: string;
  unit_price: string;
  storing_place?: string;
  memo?: string;
  factory: number;
  factory_name?: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: number;
  item_id: number;
  item_name?: string;
  item_code?: string;
  movement_type: 'in' | 'out';
  quantity: number;
  reason?: string;
  user_id: string;
  user_name?: string;
  factory_id: number;
  factory_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Stocktaking {
  id: number;
  item_id: number;
  item_name?: string;
  item_code?: string;
  theoretical_stock: number;
  actual_stock: number;
  difference: number;
  user_id: string;
  user_name?: string;
  status: string;
  memo?: string;
  created_at: string;
  updated_at: string;
}

export interface Factory {
  id: number;
  factory_name: string;
  address: string;
  phone: string;
  status: 'active' | 'inactive';
  capacity: number;
  memo?: string;
  created_at: string;
  updated_at: string;
  managers?: Manager[];
  manager_count?: number;
}

export interface Manager {
  id: number;
  user: string;
  user_id: string;
  user_name: string;
  factory: number;
  factory_name: string;
  role: 'primary' | 'assistant' | 'supervisor';
  role_display: string;
  permissions: {
    inventory?: boolean;
    stocktaking?: boolean;
    reports?: boolean;
    admin?: boolean;
  };
  assigned_at: string;
  is_active: boolean;
  memo?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  role: 'admin' | 'user';
  managed_factories: {
    id: number;
    name: string;
    role: 'primary' | 'assistant' | 'supervisor';
    permissions: {
      inventory?: boolean;
      stocktaking?: boolean;
      reports?: boolean;
      admin?: boolean;
    };
  }[];
}

export interface LoginResponse {
  token: string;
  user: User;
  admin_features?: {
    can_manage_users: boolean;
    can_manage_factories: boolean;
    can_manage_inventory: boolean;
    can_view_reports: boolean;
  };
  user_features?: {
    can_manage_inventory: boolean;
    can_do_stocktaking: boolean;
    can_view_reports: boolean;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:8000/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.error || errorData.message || `HTTP Error ${response.status}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // 認証API
  async login(id: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/login/', {
      method: 'POST',
      body: JSON.stringify({ id, password }),
    });
  }

  async adminLogin(id: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/admin/login/', {
      method: 'POST',
      body: JSON.stringify({ id, password }),
    });
  }

  async userLogin(id: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/user/login/', {
      method: 'POST',
      body: JSON.stringify({ id, password }),
    });
  }

  // 工場管理者API
  async getManagers(): Promise<ApiResponse<Manager[]>> {
    return this.request<Manager[]>('/managers/');
  }

  async createManager(managerData: Partial<Manager>): Promise<ApiResponse<Manager>> {
    return this.request<Manager>('/managers/', {
      method: 'POST',
      body: JSON.stringify(managerData),
    });
  }

  async getManager(id: number): Promise<ApiResponse<Manager>> {
    return this.request<Manager>(`/managers/${id}/`);
  }

  async updateManager(id: number, managerData: Partial<Manager>): Promise<ApiResponse<Manager>> {
    return this.request<Manager>(`/managers/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(managerData),
    });
  }

  async deleteManager(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/managers/${id}/`, {
      method: 'DELETE',
    });
  }

  // 在庫API
  async getInventories(): Promise<ApiResponse<InventoryItem[]>> {
    return this.request<InventoryItem[]>('/inventories/');
  }

  async createInventory(inventoryData: FormData): Promise<ApiResponse<InventoryItem>> {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }

    return this.request<InventoryItem>('/inventories/', {
      method: 'POST',
      body: inventoryData,
      headers,
    });
  }

  async getInventory(itemCode: string): Promise<ApiResponse<InventoryItem>> {
    return this.request<InventoryItem>(`/inventories/${itemCode}/`);
  }

  async updateInventory(itemCode: string, inventoryData: FormData): Promise<ApiResponse<InventoryItem>> {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }

    return this.request<InventoryItem>(`/inventories/${itemCode}/`, {
      method: 'PUT',
      body: inventoryData,
      headers,
    });
  }

  async deleteInventory(itemCode: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/inventories/${itemCode}/`, {
      method: 'DELETE',
    });
  }

  // 在庫移動API
  async getStockMovements(): Promise<ApiResponse<StockMovement[]>> {
    return this.request<StockMovement[]>('/stock-movements/');
  }

  async createStockMovement(movementData: Partial<StockMovement>): Promise<ApiResponse<StockMovement>> {
    return this.request<StockMovement>('/stock-movements/', {
      method: 'POST',
      body: JSON.stringify(movementData),
    });
  }

  // 棚卸API
  async getStocktakings(): Promise<ApiResponse<Stocktaking[]>> {
    return this.request<Stocktaking[]>('/stocktakings/');
  }

  async createStocktaking(stocktakingData: Partial<Stocktaking>): Promise<ApiResponse<Stocktaking>> {
    return this.request<Stocktaking>('/stocktakings/', {
      method: 'POST',
      body: JSON.stringify(stocktakingData),
    });
  }

  // 工場API
  async getFactories(): Promise<ApiResponse<Factory[]>> {
    return this.request<Factory[]>('/factories/');
  }
}

export const apiClient = new ApiClient(); 