export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'MANAGER' | 'LOGISTICS' | 'READONLY';
  is_active: boolean;
}

export interface Customer {
  id: string;
  code: string;
  company_name: string;
  ice?: string;
  if_number?: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  customer_name: string;
  order_date: string;
  status: 'DRAFT' | 'CONFIRMED' | 'PARTIALLY_DELIVERED' | 'DELIVERED' | 'CANCELLED';
  total_ht: number;
  total_ttc: number;
}

export interface DeliveryItem {
  designation: string;
  quantity: number;
  unit: string;
}

export interface DeliveryNote {
  id: string;
  bl_number: string;
  po_number: string;
  customer_name: string;
  customer_ice?: string;
  address: string;
  city: string;
  date: string;
  driver_name: string;
  status: 'EN_PREPARATION' | 'EN_COURS' | 'LIVRE';
  items: DeliveryItem[];
}