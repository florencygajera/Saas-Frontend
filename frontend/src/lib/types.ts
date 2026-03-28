// User roles
export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'CUSTOMER';

// User type
export interface User {
  id: string;
  email: string;
  role: UserRole;
  tenant_id?: string;
  name?: string;
}

// Login response
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Top tenant item (Platform stats)
export interface TopTenantItem {
  tenant_id: string;
  tenant_name: string;
  revenue: number;
}

// Platform stats (Super Admin)
export interface PlatformStats {
  platform_revenue: number;
  total_bookings: number;
  active_tenants: number;
  new_tenants_last_30d: number;
  top_tenants_by_revenue: TopTenantItem[];
}

// Tenant type
export interface Tenant {
  id: string;
  name: string;
  plan: string;
  is_active: boolean;
  created_at: string;
}

// Top service item (Tenant stats)
export interface TopServiceItem {
  service_id: string;
  service_name: string;
  bookings: number;
  revenue: number;
}

// Tenant stats
export interface TenantStats {
  revenue: number;
  total_bookings: number;
  completed_count: number;
  cancelled_count: number;
  top_services: TopServiceItem[];
  heatmap_7x24: number[][];
}

// Tenant admin stats (same as TenantStats)
export type TenantAdminStats = TenantStats;

// Service type
export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  duration_min: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

// Staff type
export interface Staff {
  id: string;
  tenant_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

// Customer type
export interface Customer {
  id: string;
  tenant_id: string;
  user_id?: string;
  name: string;
  phone?: string;
  email?: string;
  created_at: string;
}

// Appointment type
export interface Appointment {
  id: string;
  tenant_id: string;
  customer_id: string;
  staff_id?: string;
  service_id: string;
  start_at: string;
  end_at: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Appointment statuses
export type AppointmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

// Booking type (same as Appointment from customer perspective)
export type Booking = Appointment;

// Public service (same as Service)
export type PublicService = Service;

// Payment types
export interface PaymentStartResponse {
  id: string;
  tenant_id: string;
  appointment_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface PaymentVerifyRequest {
  appointment_id: string;
  otp: string;
}

export interface PaymentVerifyResponse {
  payment_id: string;
  appointment_id: string;
  amount: number;
  currency: string;
  status: string;
  paid_at: string;
  message: string;
}

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded';

// API Error
export interface ApiError {
  detail: string;
}
