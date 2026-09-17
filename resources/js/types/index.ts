export type * from './auth';

export interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: 'admin' | 'user';
    avatar: string | null;
    status: 'active' | 'inactive';
    email_verified_at: string | null;
    created_at: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    is_active: boolean;
    products_count?: number;
    created_at: string;
}

export interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
    is_active: boolean;
    products_count?: number;
    created_at: string;
}

export interface ProductImage {
    id: number;
    image: string;
    sort_order: number;
}

export interface Product {
    id: number;
    category?: Category;
    brand?: Brand;
    category_id: number;
    brand_id: number;
    sku: string;
    name: string;
    slug: string;
    gender: 'male' | 'female' | 'unisex';
    description: string | null;
    price: number;
    discount_price: number | null;
    effective_price: number;
    stock: number;
    min_stock: number;
    weight: number | null;
    volume: number | null;
    top_notes: string | null;
    middle_notes: string | null;
    base_notes: string | null;
    thumbnail: string | null;
    is_active: boolean;
    images?: ProductImage[];
    reviews?: Review[];
    avg_rating?: number;
    reviews_count?: number;
    created_at: string;
}

export interface Address {
    id: number;
    label: string;
    recipient_name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    postal_code: string;
    address: string;
    is_default: boolean;
}

export interface CartItem {
    id: number;
    product?: Product;
    product_id: number;
    quantity: number;
    price?: number;
    subtotal?: number;
}

export interface Cart {
    id: number;
    items: CartItem[];
    total: number;
}

export interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    product_sku: string;
    price: number;
    discount: number;
    quantity: number;
    subtotal: number;
}

export interface Payment {
    id: number;
    payment_method: string;
    amount: number;
    proof: string | null;
    status: 'pending' | 'waiting_verification' | 'approved' | 'rejected';
    notes: string | null;
    paid_at: string | null;
    verified_at: string | null;
    created_at: string;
}

export interface Order {
    id: number;
    order_number: string;
    address?: Address;
    items: OrderItem[];
    payment: Payment[];
    user?: { id: number; name: string; email: string };
    subtotal: number;
    discount: number;
    shipping_cost: number;
    total: number;
    payment_method: string;
    payment_status: 'pending' | 'waiting_verification' | 'paid' | 'rejected' | 'expired';
    order_status: 'pending_payment' | 'waiting_verification' | 'processing' | 'packed' | 'shipped' | 'completed' | 'cancelled';
    notes: string | null;
    paid_at: string | null;
    completed_at: string | null;
    cancelled_at: string | null;
    created_at: string;
}

export interface Review {
    id: number;
    user?: User;
    rating: number;
    comment: string | null;
    image: string | null;
    is_visible: boolean;
    created_at: string;
}

export interface Voucher {
    id: number;
    code: string;
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_purchase: number;
    max_discount: number | null;
    quota: number | null;
    used_count: number;
    start_at: string;
    end_at: string;
    is_active: boolean;
}

export interface Banner {
    id: number;
    title: string | null;
    subtitle: string | null;
    image: string | null;
    link: string | null;
    sort_order: number;
    is_active: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
