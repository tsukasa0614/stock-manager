const API_BASE_URL = 'http://localhost:8000/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

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
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // FormDataの場合はContent-Typeを設定しない（ブラウザが自動設定）
    // JSONの場合のみContent-Typeを設定
    const headers: Record<string, string> = {
      ...(this.token && { Authorization: `Token ${this.token}` }),
      ...(options.headers as Record<string, string>),
    };
    
    // bodyがFormDataでない場合のみContent-Typeを設定
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'API エラーが発生しました',
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: 'ネットワークエラーが発生しました',
        status: 0,
      };
    }
  }

  // 在庫管理 API
  async getInventories(): Promise<ApiResponse<InventoryItem[]>> {
    return this.request<InventoryItem[]>('/inventories/');
  }

  async getInventory(itemCode: string): Promise<ApiResponse<InventoryItem>> {
    return this.request<InventoryItem>(`/inventories/${itemCode}/`);
  }

  async createInventory(data: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'factory_name'>): Promise<ApiResponse<InventoryItem>> {
    return this.request<InventoryItem>('/inventories/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 画像アップロード対応の商品作成メソッド
  async createInventoryWithImage(data: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'factory_name'>, imageFile?: File): Promise<ApiResponse<InventoryItem>> {
    if (imageFile) {
      // 画像ファイルがある場合はFormDataを使用
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      formData.append('image', imageFile);
      
      return this.request<InventoryItem>('/inventories/', {
        method: 'POST',
        body: formData,
      });
    } else {
      // 画像ファイルがない場合は従来のJSONリクエスト
      return this.createInventory(data);
    }
  }

  async updateInventory(itemCode: string, data: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    return this.request<InventoryItem>(`/inventories/${itemCode}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // 画像アップロード対応の商品更新メソッド
  async updateInventoryWithImage(itemCode: string, data: Partial<InventoryItem>, imageFile?: File): Promise<ApiResponse<InventoryItem>> {
    if (imageFile) {
      // 画像ファイルがある場合はFormDataを使用
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      formData.append('image', imageFile);
      
      return this.request<InventoryItem>(`/inventories/${itemCode}/`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      // 画像ファイルがない場合は従来のJSONリクエスト
      return this.updateInventory(itemCode, data);
    }
  }

  async deleteInventory(itemCode: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/inventories/${itemCode}/`, {
      method: 'DELETE',
    });
  }

  // 在庫移動 API
  async getStockMovements(params?: { item_code?: string; movement_type?: 'in' | 'out' }): Promise<ApiResponse<StockMovement[]>> {
    const queryParams = new URLSearchParams();
    if (params?.item_code) queryParams.append('item_code', params.item_code);
    if (params?.movement_type) queryParams.append('movement_type', params.movement_type);
    
    const endpoint = `/stock-movements/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<StockMovement[]>(endpoint);
  }

  async createStockMovement(data: Omit<StockMovement, 'id' | 'created_at' | 'updated_at' | 'item_name' | 'item_code' | 'user_name' | 'factory_name'>): Promise<ApiResponse<StockMovement>> {
    return this.request<StockMovement>('/stock-movements/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 棚卸 API
  async getStocktakings(): Promise<ApiResponse<Stocktaking[]>> {
    return this.request<Stocktaking[]>('/stocktakings/');
  }

  async createStocktaking(data: Omit<Stocktaking, 'id' | 'created_at' | 'updated_at' | 'item_name' | 'item_code' | 'user_name' | 'difference'>): Promise<ApiResponse<Stocktaking>> {
    return this.request<Stocktaking>('/stocktakings/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 工場 API
  async getFactories(): Promise<ApiResponse<Factory[]>> {
    return this.request<Factory[]>('/factories/');
  }

  // ヘルスチェック API
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/health/');
  }
}

export const apiClient = new ApiClient(API_BASE_URL); 