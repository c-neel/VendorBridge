const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('vendorbridge_token');
  }

  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (res.status === 401) {
      // Try refresh
      const refreshed = await this.refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.getToken()}`;
        const retryRes = await fetch(`${this.baseUrl}${endpoint}`, {
          method: options.method || 'GET',
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
        });
        if (!retryRes.ok) throw new Error('Request failed after token refresh');
        return retryRes.json();
      }
      // Redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vendorbridge_token');
        localStorage.removeItem('vendorbridge_refresh_token');
        localStorage.removeItem('vendorbridge_user');
        window.location.href = '/login';
      }
      throw new Error('Session expired');
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return res.json();
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('vendorbridge_refresh_token') 
      : null;
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      localStorage.setItem('vendorbridge_token', data.accessToken);
      localStorage.setItem('vendorbridge_refresh_token', data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/api/auth/login', { method: 'POST', body: { email, password } });
  }

  async register(data: any) {
    return this.request('/api/auth/register', { method: 'POST', body: data });
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  async logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  // Dashboard
  async getDashboard() {
    return this.request('/api/dashboard');
  }

  // Purchase Requests
  async getPurchaseRequests(params?: string) {
    return this.request(`/api/purchase-requests${params ? `?${params}` : ''}`);
  }

  async getPurchaseRequest(id: string) {
    return this.request(`/api/purchase-requests/${id}`);
  }

  async createPurchaseRequest(data: any) {
    return this.request('/api/purchase-requests', { method: 'POST', body: data });
  }

  // Approvals
  async getApprovals(params?: string) {
    return this.request(`/api/approvals${params ? `?${params}` : ''}`);
  }

  async getApproval(id: string) {
    return this.request(`/api/approvals/${id}`);
  }

  async getPendingCount() {
    return this.request('/api/approvals/pending/count');
  }

  async approveRequest(id: string, remarks: string) {
    return this.request(`/api/approvals/${id}/approve`, { method: 'PATCH', body: { remarks } });
  }

  async rejectRequest(id: string, remarks: string) {
    return this.request(`/api/approvals/${id}/reject`, { method: 'PATCH', body: { remarks } });
  }

  // Vendors
  async getVendors(params?: string) {
    return this.request(`/api/vendors${params ? `?${params}` : ''}`);
  }

  async getVendor(id: string) {
    return this.request(`/api/vendors/${id}`);
  }

  async getVendorLeaderboard(limit = 10) {
    return this.request(`/api/vendors/leaderboard/top?limit=${limit}`);
  }

  async createVendor(data: any) {
    return this.request('/api/vendors', { method: 'POST', body: data });
  }

  async updateVendor(id: string, data: any) {
    return this.request(`/api/vendors/${id}`, { method: 'PUT', body: data });
  }

  async deactivateVendor(id: string) {
    return this.request(`/api/vendors/${id}/deactivate`, { method: 'PATCH' });
  }

  // RFQs
  async getRFQs(params?: string) {
    return this.request(`/api/rfqs${params ? `?${params}` : ''}`);
  }

  async getRFQ(id: string) {
    return this.request(`/api/rfqs/${id}`);
  }

  async createRFQ(data: any) {
    return this.request('/api/rfqs', { method: 'POST', body: data });
  }

  // Quotations
  async getQuotations(params?: string) {
    return this.request(`/api/quotations${params ? `?${params}` : ''}`);
  }

  async compareQuotations(rfqId: string) {
    return this.request(`/api/quotations/compare/${rfqId}`);
  }

  // Purchase Orders
  async getPurchaseOrders(params?: string) {
    return this.request(`/api/purchase-orders${params ? `?${params}` : ''}`);
  }

  async getPurchaseOrder(id: string) {
    return this.request(`/api/purchase-orders/${id}`);
  }

  // Invoices
  async getInvoices(params?: string) {
    return this.request(`/api/invoices${params ? `?${params}` : ''}`);
  }

  // Payments
  async getPayments(params?: string) {
    return this.request(`/api/payments${params ? `?${params}` : ''}`);
  }

  // Goods Receipts
  async getGoodsReceipts(params?: string) {
    return this.request(`/api/goods-receipts${params ? `?${params}` : ''}`);
  }

  // Notifications
  async getNotifications(params?: string) {
    return this.request(`/api/notifications${params ? `?${params}` : ''}`);
  }

  async markNotificationRead(id: string) {
    return this.request(`/api/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsRead() {
    return this.request('/api/notifications/read-all', { method: 'PATCH' });
  }

  // Activity Logs
  async getActivityLogs(params?: string) {
    return this.request(`/api/activity-logs${params ? `?${params}` : ''}`);
  }

  // Analytics
  async getAnalyticsOverview() {
    return this.request('/api/analytics/overview');
  }

  async getSpendAnalytics() {
    return this.request('/api/analytics/spend');
  }

  async getVendorPerformance() {
    return this.request('/api/analytics/vendor-performance');
  }

  async getRiskAlerts() {
    return this.request('/api/analytics/risk-alerts');
  }

  async getHealthScore() {
    return this.request('/api/analytics/health-score');
  }

  // AI
  async aiChat(message: string, context?: any) {
    return this.request('/api/ai/chat', { method: 'POST', body: { message, context } });
  }

  async aiRecommendVendor(rfqId: string) {
    return this.request('/api/ai/recommend-vendor', { method: 'POST', body: { rfqId } });
  }

  async aiGenerateRFQ(description: string) {
    return this.request('/api/ai/generate-rfq', { method: 'POST', body: { description } });
  }

  async aiApprovalSummary(prId: string) {
    return this.request(`/api/ai/approval-summary/${prId}`);
  }

  
  // Missing Analytics
  async getAnalytics() {
    return this.request('/api/analytics/overview');
  }

  // Missing GRNs
  async getGoodsReceipt(id: string) {
    return this.request(`/api/goods-receipts/${id}`);
  }
  async createGoodsReceipt(data: any) {
    return this.request('/api/goods-receipts', { method: 'POST', body: data });
  }

  // Missing Invoices
  async getInvoice(id: string) {
    return this.request(`/api/invoices/${id}`);
  }
  async createInvoice(data: any) {
    return this.request('/api/invoices', { method: 'POST', body: data });
  }
  async runThreeWayMatch(id: string) {
    return this.request(`/api/invoices/${id}/match`, { method: 'PATCH' });
  }

  // Missing Payments
  async getPayment(id: string) {
    return this.request(`/api/payments/${id}`);
  }
  async createPayment(data: any) {
    return this.request('/api/payments', { method: 'POST', body: data });
  }

  // Missing Quotes
  async getQuotation(id: string) {
    return this.request(`/api/quotations/${id}`);
  }
  async createQuotation(data: any) {
    return this.request('/api/quotations', { method: 'POST', body: data });
  }
  async updateQuotationStatus(id: string, status: string) {
    return this.request(`/api/quotations/${id}/status`, { method: 'PATCH', body: { status } });
  }
  async acceptQuotation(id: string) {
    return this.request(`/api/quotations/${id}/accept`, { method: 'PATCH' });
  }
  async rejectQuotation(id: string) {
    return this.request(`/api/quotations/${id}/reject`, { method: 'PATCH' });
  }

  // Missing POs
  async createPurchaseOrder(data: any) {
    return this.request('/api/purchase-orders', { method: 'POST', body: data });
  }
  async updatePurchaseOrderStatus(id: string, status: string) {
    return this.request(`/api/purchase-orders/${id}/status`, { method: 'PATCH', body: { status } });
  }

  // Missing RFQs
  async updateRFQStatus(id: string, status: string) {
    return this.request(`/api/rfqs/${id}/status`, { method: 'PATCH', body: { status } });
  }
  async publishRfq(id: string) {
    return this.request(`/api/rfqs/${id}/publish`, { method: 'PATCH' });
  }
  async requestRfqApproval(id: string) {
    return this.request(`/api/rfqs/${id}/request-approval`, { method: 'POST' });
  }

  // Users & Admin
  async getUsers(params?: string) {
    return this.request(`/api/users${params ? `?${params}` : ''}`);
  }

  
  async createUser(data: any) { return this.request('/api/users', { method: 'POST', body: JSON.stringify(data) }); }
  async updateUser(id: string, data: any) { return this.request(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteUser(id: string) { return this.request(`/api/users/${id}`, { method: 'DELETE' }); }
  
  async createDepartment(data: any) { return this.request('/api/departments', { method: 'POST', body: JSON.stringify(data) }); }
  async updateDepartment(id: string, data: any) { return this.request(`/api/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteDepartment(id: string) { return this.request(`/api/departments/${id}`, { method: 'DELETE' }); }

  async getDepartments() {
    return this.request('/api/departments');
  }
}

export const api = new ApiClient(API_URL);
