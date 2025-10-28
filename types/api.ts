export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  popular: boolean
  available: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  createdAt: string
  updatedAt: string
}

export interface Restaurant {
  id: string
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED'
  customerName?: string
  customerPhone?: string
  createdAt: string
  updatedAt: string
}

export interface ExportData {
  products: Product[]
  categories: Category[]
  restaurantInfo: Restaurant
  orders: Order[]
  exportDate: string
}

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  category: string
  image?: string
  popular?: boolean
  available?: boolean
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface CreateCategoryRequest {
  name: string
  description?: string
  icon?: string
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface UpdateRestaurantRequest {
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  logo?: string
  theme?: {
    primaryColor: string
    secondaryColor: string
  }
}

export interface CreateOrderRequest {
  items: OrderItem[]
  total: number
  customerName?: string
  customerPhone?: string
}

export interface UpdateOrderStatusRequest {
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED'
}
