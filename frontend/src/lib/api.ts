import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { User, LoginResponse, PlatformStats, Tenant, TenantStats, TenantAdminStats, Service, Staff, Customer, Appointment, Booking, PublicService, PaymentStartResponse, PaymentVerifyResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
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
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/v1/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await api.get<User>('/api/v1/auth/me');
    return response.data;
  },
};

// Super Admin API
export const saasApi = {
  getPlatformStats: async (): Promise<PlatformStats> => {
    const response = await api.get<PlatformStats>('/api/v1/saas/platform/stats');
    return response.data;
  },

  getTenants: async (): Promise<Tenant[]> => {
    const response = await api.get<Tenant[]>('/api/v1/saas/tenants');
    return response.data;
  },

  getTenant: async (tenantId: string): Promise<Tenant> => {
    const response = await api.get<Tenant>(`/api/v1/saas/tenants/${tenantId}`);
    return response.data;
  },

  createTenant: async (data: {
    name: string;
    slug: string;
    plan: string;
    admin_email: string;
    admin_password: string;
  }): Promise<Tenant> => {
    const response = await api.post<Tenant>('/api/v1/saas/tenants', data);
    return response.data;
  },

  updateTenant: async (tenantId: string, data: { is_active?: boolean; name?: string }): Promise<Tenant> => {
    const response = await api.patch<Tenant>(`/api/v1/saas/tenants/${tenantId}`, data);
    return response.data;
  },

  getTenantStats: async (tenantId: string): Promise<TenantStats> => {
    const response = await api.get<TenantStats>(`/api/v1/saas/tenants/${tenantId}/stats`);
    return response.data;
  },
};

// Tenant Admin API
export const tenantApi = {
  // Stats
  getStats: async (): Promise<TenantAdminStats> => {
    const response = await api.get<TenantAdminStats>('/api/v1/tenant/stats');
    return response.data;
  },

  // Services
  getServices: async (): Promise<Service[]> => {
    const response = await api.get<Service[]>('/api/v1/services');
    return response.data;
  },

  getService: async (serviceId: string): Promise<Service> => {
    const response = await api.get<Service>(`/api/v1/services/${serviceId}`);
    return response.data;
  },

  createService: async (data: {
    name: string;
    description?: string;
    price: number;
    duration_minutes: number;
  }): Promise<Service> => {
    const response = await api.post<Service>('/api/v1/services', data);
    return response.data;
  },

  updateService: async (serviceId: string, data: {
    name: string;
    description?: string;
    price: number;
    duration_minutes: number;
    is_active?: boolean;
  }): Promise<Service> => {
    const response = await api.put<Service>(`/api/v1/services/${serviceId}`, data);
    return response.data;
  },

  deleteService: async (serviceId: string): Promise<void> => {
    await api.delete(`/api/v1/services/${serviceId}`);
  },

  // Staff
  getStaff: async (): Promise<Staff[]> => {
    const response = await api.get<Staff[]>('/api/v1/staff');
    return response.data;
  },

  getStaffMember: async (staffId: string): Promise<Staff> => {
    const response = await api.get<Staff>(`/api/v1/staff/${staffId}`);
    return response.data;
  },

  createStaff: async (data: {
    name: string;
    email: string;
    phone?: string;
    services?: string[];
  }): Promise<Staff> => {
    const response = await api.post<Staff>('/api/v1/staff', data);
    return response.data;
  },

  updateStaff: async (staffId: string, data: {
    name: string;
    email: string;
    phone?: string;
    is_active?: boolean;
    services?: string[];
  }): Promise<Staff> => {
    const response = await api.put<Staff>(`/api/v1/staff/${staffId}`, data);
    return response.data;
  },

  deleteStaff: async (staffId: string): Promise<void> => {
    await api.delete(`/api/v1/staff/${staffId}`);
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    const response = await api.get<Customer[]>('/api/v1/customers');
    return response.data;
  },

  getCustomer: async (customerId: string): Promise<Customer> => {
    const response = await api.get<Customer>(`/api/v1/customers/${customerId}`);
    return response.data;
  },

  createCustomer: async (data: {
    name: string;
    email: string;
    phone?: string;
  }): Promise<Customer> => {
    const response = await api.post<Customer>('/api/v1/customers', data);
    return response.data;
  },

  updateCustomer: async (customerId: string, data: {
    name: string;
    email: string;
    phone?: string;
  }): Promise<Customer> => {
    const response = await api.put<Customer>(`/api/v1/customers/${customerId}`, data);
    return response.data;
  },

  deleteCustomer: async (customerId: string): Promise<void> => {
    await api.delete(`/api/v1/customers/${customerId}`);
  },


  // Appointments
  getAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/api/v1/appointments');
    return response.data;
  },

  getAppointment: async (appointmentId: string): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/api/v1/appointments/${appointmentId}`);
    return response.data;
  },

  updateAppointmentStatus: async (appointmentId: string, status: string): Promise<Appointment> => {
    const response = await api.patch<Appointment>(`/api/v1/appointments/${appointmentId}/status`, { status });
    return response.data;
  },
};

// Customer/Booking API
export const bookingApi = {
  // Public endpoints
  getPublicServices: async (tenantId: string): Promise<PublicService[]> => {
    const response = await api.get<PublicService[]>(`/api/v1/bookings/public/services?tenant_id=${tenantId}`);
    return response.data;
  },

  // Create booking
  createBooking: async (data: {
    service_id: string;
    start_time: string;
    staff_id?: string;
    notes?: string;
  }): Promise<Booking> => {
    const response = await api.post<Booking>('/api/v1/bookings', data);
    return response.data;
  },

  // Get my bookings
  getMyBookings: async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/api/v1/bookings/my');
    return response.data;
  },

  // Get single booking
  getBooking: async (bookingId: string): Promise<Booking> => {
    const response = await api.get<Booking>(`/api/v1/bookings/${bookingId}`);
    return response.data;
  },

  // Reschedule booking (PATCH)
  rescheduleBooking: async (bookingId: string, data: { start_time: string }): Promise<Booking> => {
    const response = await api.patch<Booking>(`/api/v1/bookings/${bookingId}`, data);
    return response.data;
  },

  // Cancel booking (DELETE)
  cancelBooking: async (bookingId: string): Promise<void> => {
    await api.delete(`/api/v1/bookings/${bookingId}`);
  },
};

// Payment API
export const paymentApi = {
  startPayment: async (appointmentId: string): Promise<PaymentStartResponse> => {
    const response = await api.post<PaymentStartResponse>('/api/v1/payments/start', {
      appointment_id: appointmentId,
    });
    return response.data;
  },

  verifyPayment: async (appointmentId: string, otp: string): Promise<PaymentVerifyResponse> => {
    const response = await api.post<PaymentVerifyResponse>('/api/v1/payments/verify', {
      appointment_id: appointmentId,
      otp,
    });
    return response.data;
  },
};
