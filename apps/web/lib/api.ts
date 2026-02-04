const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...rest,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || error.error || 'An error occurred');
  }

  return response.json();
}

// Products API
export const productsApi = {
  getAll: (params?: {
    region?: string;
    category?: string;
    brand?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return fetchApi(`/api/products?${searchParams}`);
  },

  getBySlug: (slug: string, region?: string) => {
    const params = region ? `?region=${region}` : '';
    return fetchApi(`/api/products/${slug}${params}`);
  },

  getByCategory: (category: string, params?: { region?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return fetchApi(`/api/products/category/${category}?${searchParams}`);
  },

  getPriceHistory: (slug: string, days?: number) => {
    const params = days ? `?days=${days}` : '';
    return fetchApi(`/api/products/${slug}/history${params}`);
  },
};

// Search API
export const searchApi = {
  search: (params: {
    q: string;
    category?: string;
    brand?: string;
    region?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return fetchApi(`/api/search?${searchParams}`);
  },

  getSuggestions: (q: string) => {
    return fetchApi(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
  },

  getTrending: (region?: string) => {
    const params = region ? `?region=${region}` : '';
    return fetchApi(`/api/search/trending${params}`);
  },
};

// Retailers API
export const retailersApi = {
  getAll: (region?: string) => {
    const params = region ? `?region=${region}` : '';
    return fetchApi(`/api/retailers${params}`);
  },

  getBySlug: (slug: string) => {
    return fetchApi(`/api/retailers/${slug}`);
  },
};

// User API
export const userApi = {
  register: (data: { email: string; password: string; name?: string; region?: string }) => {
    return fetchApi('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: (data: { email: string; password: string }) => {
    return fetchApi('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProfile: (token: string) => {
    return fetchApi('/api/users/me', { token });
  },

  updatePreferences: (token: string, data: any) => {
    return fetchApi('/api/users/me/preferences', {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  },

  getFavorites: (token: string, params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return fetchApi(`/api/users/me/favorites?${searchParams}`, { token });
  },

  addFavorite: (token: string, productId: string) => {
    return fetchApi('/api/users/me/favorites', {
      method: 'POST',
      token,
      body: JSON.stringify({ productId }),
    });
  },

  removeFavorite: (token: string, productId: string) => {
    return fetchApi(`/api/users/me/favorites/${productId}`, {
      method: 'DELETE',
      token,
    });
  },
};

// Alerts API
export const alertsApi = {
  getAll: (token: string, params?: { isActive?: boolean; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return fetchApi(`/api/alerts?${searchParams}`, { token });
  },

  create: (token: string, data: {
    productId: string;
    alertType: string;
    targetPrice?: number;
    channels: string[];
  }) => {
    return fetchApi('/api/alerts', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },

  update: (token: string, alertId: string, data: any) => {
    return fetchApi(`/api/alerts/${alertId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  },

  delete: (token: string, alertId: string) => {
    return fetchApi(`/api/alerts/${alertId}`, {
      method: 'DELETE',
      token,
    });
  },
};
