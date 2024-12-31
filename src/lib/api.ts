import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5188/api',
});

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
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  return response.data.products;
};

export const getProduct = async (id: string): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories');
  return response.data;
};

export default api;