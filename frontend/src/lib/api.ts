import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  User,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  VerifyOtpResponse,
  PlatformStats,
  Tenant,
  TenantStats,
  TenantAdminStats,
  Service,
  Staff,
  Customer,
  Appointment,
  Booking,
  PublicService,
  PaymentStartResponse,
  PaymentVerifyResponse,
  TenantProvisionResult,
  BillingPlan,
  Subscription,
  Invoice,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001';
const TOKEN_KEY = 'token';
const ROLE_KEY = 'auth_role';

type ApiEnvelope<T> = {
  data: T;
  message?: string;
};

const unwrap = <T>(payload: T | ApiEnvelope<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as ApiEnvelope<T>)) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
};

const clearClientSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ROLE_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
  document.cookie = `${ROLE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = getCookieValue(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 (exclude auth/login to allow error handling there)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only redirect if it's NOT the login endpoint
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest && typeof window !== 'undefined') {
        clearClientSession();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse | ApiEnvelope<LoginResponse>>('/api/v1/auth/login', {
      email,
      password,
    });
    return unwrap(response.data);
  },

  me: async (): Promise<User> => {
    const response = await api.get<User | ApiEnvelope<User>>('/api/v1/auth/me');
    return unwrap(response.data);
  },

  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await api.post<SignupResponse | ApiEnvelope<SignupResponse>>('/api/v1/auth/signup', data);
    return unwrap(response.data);
  },

  verifyOtp: async (email: string, otp: string): Promise<VerifyOtpResponse> => {
    const response = await api.post<VerifyOtpResponse | ApiEnvelope<VerifyOtpResponse>>('/api/v1/auth/verify-otp', {
      email,
      otp,
    });
    return unwrap(response.data);
  },

  resendOtp: async (email: string): Promise<{ message?: string }> => {
    const response = await api.post<{ message?: string } | ApiEnvelope<{ message?: string }>>('/api/v1/auth/resend-otp', {
      email,
    });
    return unwrap(response.data);
  },

  forgotPassword: async (email: string): Promise<{ message?: string }> => {
    const response = await api.post<{ message?: string } | ApiEnvelope<{ message?: string }>>('/api/v1/auth/forgot-password', {
      email,
    });
    return unwrap(response.data);
  },
};

// Super Admin API
export const saasApi = {
  getPlatformStats: async (): Promise<PlatformStats> => {
    const response = await api.get<PlatformStats | ApiEnvelope<PlatformStats>>('/api/v1/saas/platform/stats');
    return unwrap(response.data);
  },

  getTenants: async (): Promise<Tenant[]> => {
    const response = await api.get<Tenant[] | ApiEnvelope<Tenant[]>>('/api/v1/saas/tenants');
    return unwrap(response.data);
  },

  getTenant: async (tenantId: string): Promise<Tenant> => {
    const response = await api.get<Tenant | ApiEnvelope<Tenant>>(`/api/v1/saas/tenants/${tenantId}`);
    return unwrap(response.data);
  },

  createTenant: async (data: {
    name: string;
    slug: string;
    plan: string;
    admin_email: string;
    admin_password: string;
  }): Promise<TenantProvisionResult> => {
    const response = await api.post<TenantProvisionResult | ApiEnvelope<TenantProvisionResult>>('/api/v1/saas/tenants', data);
    return unwrap(response.data);
  },

  updateTenant: async (tenantId: string, data: { is_active?: boolean; name?: string }): Promise<Tenant> => {
    const response = await api.patch<Tenant | ApiEnvelope<Tenant>>(`/api/v1/saas/tenants/${tenantId}`, data);
    return unwrap(response.data);
  },

  getTenantStats: async (tenantId: string): Promise<TenantStats> => {
    const response = await api.get<TenantStats | ApiEnvelope<TenantStats>>(`/api/v1/saas/tenants/${tenantId}/stats`);
    return unwrap(response.data);
  },
};

// Tenant Admin API
export const tenantApi = {
  // Stats
  getStats: async (): Promise<TenantAdminStats> => {
    const response = await api.get<TenantAdminStats | ApiEnvelope<TenantAdminStats>>('/api/v1/tenant/stats');
    return unwrap(response.data);
  },

  // Services
  getServices: async (): Promise<Service[]> => {
    const response = await api.get<Service[] | ApiEnvelope<Service[]>>('/api/v1/services');
    return unwrap(response.data);
  },

  getService: async (serviceId: string): Promise<Service> => {
    const response = await api.get<Service | ApiEnvelope<Service>>(`/api/v1/services/${serviceId}`);
    return unwrap(response.data);
  },

  createService: async (data: {
    name: string;
    price: number;
    duration_min: number;
  }): Promise<Service> => {
    const response = await api.post<Service | ApiEnvelope<Service>>('/api/v1/services', data);
    return unwrap(response.data);
  },

  updateService: async (serviceId: string, data: {
    name?: string;
    price?: number;
    duration_min?: number;
    is_active?: boolean;
  }): Promise<Service> => {
    const response = await api.put<Service | ApiEnvelope<Service>>(`/api/v1/services/${serviceId}`, data);
    return unwrap(response.data);
  },

  deleteService: async (serviceId: string): Promise<void> => {
    await api.delete(`/api/v1/services/${serviceId}`);
  },

  // Staff
  getStaff: async (): Promise<Staff[]> => {
    const response = await api.get<Staff[] | ApiEnvelope<Staff[]>>('/api/v1/staff');
    return unwrap(response.data);
  },

  getStaffMember: async (staffId: string): Promise<Staff> => {
    const response = await api.get<Staff | ApiEnvelope<Staff>>(`/api/v1/staff/${staffId}`);
    return unwrap(response.data);
  },

  createStaff: async (data: {
    name: string;
  }): Promise<Staff> => {
    const response = await api.post<Staff | ApiEnvelope<Staff>>('/api/v1/staff', data);
    return unwrap(response.data);
  },

  updateStaff: async (staffId: string, data: {
    name?: string;
    is_active?: boolean;
  }): Promise<Staff> => {
    const response = await api.put<Staff | ApiEnvelope<Staff>>(`/api/v1/staff/${staffId}`, data);
    return unwrap(response.data);
  },

  deleteStaff: async (staffId: string): Promise<void> => {
    await api.delete(`/api/v1/staff/${staffId}`);
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    const response = await api.get<Customer[] | ApiEnvelope<Customer[]>>('/api/v1/customers');
    return unwrap(response.data);
  },

  getCustomer: async (customerId: string): Promise<Customer> => {
    const response = await api.get<Customer | ApiEnvelope<Customer>>(`/api/v1/customers/${customerId}`);
    return unwrap(response.data);
  },

  createCustomer: async (data: {
    name: string;
    email: string;
    phone?: string;
  }): Promise<Customer> => {
    const response = await api.post<Customer | ApiEnvelope<Customer>>('/api/v1/customers', data);
    return unwrap(response.data);
  },

  updateCustomer: async (customerId: string, data: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<Customer> => {
    const response = await api.put<Customer | ApiEnvelope<Customer>>(`/api/v1/customers/${customerId}`, data);
    return unwrap(response.data);
  },

  deleteCustomer: async (customerId: string): Promise<void> => {
    await api.delete(`/api/v1/customers/${customerId}`);
  },

  // Appointments
  getAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[] | ApiEnvelope<Appointment[]>>('/api/v1/appointments');
    return unwrap(response.data);
  },

  getAppointment: async (appointmentId: string): Promise<Appointment> => {
    const response = await api.get<Appointment | ApiEnvelope<Appointment>>(`/api/v1/appointments/${appointmentId}`);
    return unwrap(response.data);
  },

  updateAppointmentStatus: async (appointmentId: string, status: string): Promise<Appointment> => {
    const response = await api.patch<Appointment | ApiEnvelope<Appointment>>(`/api/v1/appointments/${appointmentId}/status`, { status });
    return unwrap(response.data);
  },
};

// Customer/Booking API
export const bookingApi = {
  // Public endpoints
  getPublicServices: async (tenantId?: string): Promise<PublicService[]> => {
    const response = await api.get<PublicService[] | ApiEnvelope<PublicService[]>>('/api/v1/public/services', {
      params: tenantId ? { tenant_id: tenantId } : undefined,
    });
    return unwrap(response.data);
  },

  // Create booking
  createBooking: async (data: {
    service_id: string;
    start_at: string;
    staff_id?: string;
    notes?: string;
  }): Promise<Booking> => {
    const response = await api.post<Booking | ApiEnvelope<Booking>>('/api/v1/bookings', data);
    return unwrap(response.data);
  },

  // Get my bookings
  getMyBookings: async (): Promise<Booking[]> => {
    const response = await api.get<Booking[] | ApiEnvelope<Booking[]>>('/api/v1/bookings/my');
    return unwrap(response.data);
  },

  // Get single booking
  getBooking: async (bookingId: string): Promise<Booking> => {
    const response = await api.get<Booking | ApiEnvelope<Booking>>(`/api/v1/bookings/${bookingId}`);
    return unwrap(response.data);
  },

  // Reschedule booking (PATCH)
  rescheduleBooking: async (bookingId: string, data: { start_at: string }): Promise<Booking> => {
    const response = await api.patch<Booking | ApiEnvelope<Booking>>(`/api/v1/bookings/${bookingId}`, data);
    return unwrap(response.data);
  },

  // Cancel booking (DELETE)
  cancelBooking: async (bookingId: string): Promise<void> => {
    await api.delete(`/api/v1/bookings/${bookingId}`);
  },
};

// Payment API
export const paymentApi = {
  startPayment: async (appointmentId: string): Promise<PaymentStartResponse> => {
    const response = await api.post<PaymentStartResponse | ApiEnvelope<PaymentStartResponse>>('/api/v1/payments/start', {
      appointment_id: appointmentId,
    });
    return unwrap(response.data);
  },

  verifyPayment: async (paymentId: string, otp: string): Promise<PaymentVerifyResponse> => {
    const response = await api.post<PaymentVerifyResponse | ApiEnvelope<PaymentVerifyResponse>>('/api/v1/payments/verify', {
      payment_id: paymentId,
      otp,
    });
    return unwrap(response.data);
  },
};

export const billingApi = {
  getPlans: async (): Promise<BillingPlan[]> => {
    const response = await api.get<BillingPlan[] | ApiEnvelope<BillingPlan[]>>('/api/v1/billing/plans');
    return unwrap(response.data);
  },

  getSubscription: async (): Promise<Subscription> => {
    const response = await api.get<Subscription | ApiEnvelope<Subscription>>('/api/v1/billing/subscription');
    return unwrap(response.data);
  },

  changePlan: async (planId: string, billingCycle: "monthly" | "yearly"): Promise<Subscription> => {
    const response = await api.post<Subscription | ApiEnvelope<Subscription>>('/api/v1/billing/subscription/change-plan', {
      plan_id: planId,
      billing_cycle: billingCycle,
    });
    return unwrap(response.data);
  },

  getInvoices: async (): Promise<Invoice[]> => {
    const response = await api.get<Invoice[] | ApiEnvelope<Invoice[]>>('/api/v1/billing/invoices');
    return unwrap(response.data);
  },

  openPortal: async (): Promise<{ url: string }> => {
    const response = await api.post<{ url: string } | ApiEnvelope<{ url: string }>>('/api/v1/billing/portal');
    return unwrap(response.data);
  },
};
