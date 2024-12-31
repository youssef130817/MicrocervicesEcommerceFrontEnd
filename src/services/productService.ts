import { api } from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    description: string;
  };
  images: Array<{
    id: string;
    productId: string;
    imageUrl: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount?: number;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export interface ProductFilters {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const createQueryString = (filters: ProductFilters): string => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
  if (filters.category) params.append('category', filters.category);
  if (filters.search) params.append('search', filters.search);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export const productService = {
  // Product endpoints
  getAllProducts: (filters: ProductFilters = {}) => 
    api.get<ProductsResponse>(`/products${createQueryString(filters)}`),
  
  getProduct: (id: string) => 
    api.get<Product>(`/products/${id}`),
  
  // Category endpoints
  getCategories: () => 
    api.get<Category[]>('/categories'),
  
  getCategory: (id: string) => 
    api.get<Category>(`/categories/${id}`),
  
  getCategoryWithProducts: (id: string) => 
    api.get<Category & { products: Product[] }>(`/categories/${id}`),
};
