// User roles
export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'CUSTOMER';

// User type
export interface User {
  id: string;
  email: string;
  role: UserRole;
  tenant_id?: string;
  tenant_name?: string;
  name?: string;
}

// Login response
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

// Platform stats (Super Admin)
export interface PlatformStats {
  total_tenants: number;
  active_tenants: number;
  total_bookings: number;
  total_revenue: number;
  tenants_by_plan: Record<string, number>;
}

// Tenant type
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  plan: string;
  created_at: string;
  tenant_admin_email?: string;
}

// Tenant stats
export interface TenantStats {
  total_customers: number;
  total_bookings: number;
  total_revenue: number;
  active_services: number;
  active_staff: number;
  bookings_by_status: Record<string, number>;
}

// Tenant admin stats
export interface TenantAdminStats {
  total_customers: number;
  total_bookings: number;
  total_revenue: number;
  today_appointments: number;
  pending_appointments: number;
}

// Service type
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  tenant_id: string;
}

// Staff type
export interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  tenant_id: string;
  services?: string[];
}

// Customer type
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tenant_id: string;
  created_at: string;
}

// Appointment type
export interface Appointment {
  id: string;
  customer_id: string;
  customer_name?: string;
  service_id: string;
  service_name?: string;
  staff_id: string;
  staff_name?: string;
  tenant_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes?: string;
  total_price: number;
  payment_status?: PaymentStatus;
}

export type AppointmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded';

// Booking type (Customer view)
export interface Booking {
  id: string;
  service_id: string;
  service_name: string;
  service_price: number;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  tenant_name: string;
  tenant_id: string;
}

// Public service (Customer view)
export interface PublicService {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  tenant_name: string;
  tenant_id: string;
}

// Payment types
export interface PaymentStartResponse {
  appointment_id: string;
  amount: number;
  status: string;
}

export interface PaymentVerifyRequest {
  appointment_id: string;
  otp: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  message: string;
  transaction_id?: string;
}

// API Error
export interface ApiError {
  detail: string;
}
