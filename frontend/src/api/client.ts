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
  supplier?: string;
  storing_place?: string;
  memo?: string;
  factory: number;
  factory_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SelectionOptions {
  categories: string[];
  suppliers: string[];
  units: string[];
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

export interface Warehouse {
  id: number;
  warehouse_name: string;
  factory: number;
  factory_name?: string;
  description?: string;
  width: number;
  height: number;
  status: 'active' | 'inactive' | 'maintenance';
  storage_locations?: StorageLocation[];
  total_locations?: number;
  occupied_locations?: number;
  available_locations?: number;
  created_at: string;
  updated_at: string;
}

export interface StorageLocation {
  id: number;
  location_name: string;
  warehouse: number;
  warehouse_name?: string;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  capacity: number;
  current_stock: number;
  location_type: 'entrance' | 'square' | 'circle' | 'l_shape' | 'u_shape';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  memo?: string;
  utilization_rate?: number;
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
  warehouses?: Warehouse[];
  manager_count?: number;
  warehouse_count?: number;
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

    console.log('API リクエスト:', { url, method: options.method || 'GET', headers, body: options.body });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('API レスポンス:', { status: response.status, statusText: response.statusText, ok: response.ok });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('APIエラーデータ:', errorData);
        return {
          error: errorData.error || errorData.message || `HTTP Error ${response.status}`,
        };
      }

      const data = await response.json();
      console.log('レスポンスデータ:', data);
      return { data };
    } catch (error) {
      console.error('Request failed:', error);
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

  async getFactory(id: number): Promise<ApiResponse<Factory>> {
    return this.request<Factory>(`/factories/${id}/`);
  }

  async createFactory(factoryData: Partial<Factory>): Promise<ApiResponse<Factory>> {
    return this.request<Factory>('/factories/', {
      method: 'POST',
      body: JSON.stringify(factoryData),
    });
  }

  async updateFactory(id: number, factoryData: Partial<Factory>): Promise<ApiResponse<Factory>> {
    return this.request<Factory>(`/factories/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(factoryData),
    });
  }

  async deleteFactory(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/factories/${id}/`, {
      method: 'DELETE',
    });
  }

  // 倉庫API
  async getWarehouses(): Promise<ApiResponse<Warehouse[]>> {
    return this.request<Warehouse[]>('/warehouses/');
  }

  async getWarehouse(id: number): Promise<ApiResponse<Warehouse>> {
    return this.request<Warehouse>(`/warehouses/${id}/`);
  }

  async createWarehouse(warehouseData: Partial<Warehouse>): Promise<ApiResponse<Warehouse>> {
    return this.request<Warehouse>('/warehouses/', {
      method: 'POST',
      body: JSON.stringify(warehouseData),
    });
  }

  async updateWarehouse(id: number, warehouseData: Partial<Warehouse>): Promise<ApiResponse<Warehouse>> {
    return this.request<Warehouse>(`/warehouses/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(warehouseData),
    });
  }

  async deleteWarehouse(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/warehouses/${id}/`, {
      method: 'DELETE',
    });
  }

  // 置き場API
  async getStorageLocations(warehouseId?: number): Promise<ApiResponse<StorageLocation[]>> {
    const params = warehouseId ? `?warehouse_id=${warehouseId}` : '';
    return this.request<StorageLocation[]>(`/storage-locations/${params}`);
  }

  async getStorageLocation(id: number): Promise<ApiResponse<StorageLocation>> {
    return this.request<StorageLocation>(`/storage-locations/${id}/`);
  }

  async createStorageLocation(storageLocationData: Partial<StorageLocation>): Promise<ApiResponse<StorageLocation>> {
    return this.request<StorageLocation>('/storage-locations/', {
      method: 'POST',
      body: JSON.stringify(storageLocationData),
    });
  }

  async updateStorageLocation(id: number, storageLocationData: Partial<StorageLocation>): Promise<ApiResponse<StorageLocation>> {
    console.log('updateStorageLocation リクエスト:', { id, data: storageLocationData });
    return this.request<StorageLocation>(`/storage-locations/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(storageLocationData),
    });
  }

  async deleteStorageLocation(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/storage-locations/${id}/`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(); 