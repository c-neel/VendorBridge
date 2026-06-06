const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, 'apps/web/src/lib/api.ts');
let apiContent = fs.readFileSync(apiPath, 'utf8');

const missingMethods = `
  // Missing Analytics
  async getAnalytics() {
    return this.request('/api/analytics/overview');
  }

  // Missing GRNs
  async getGoodsReceipt(id: string) {
    return this.request(\`/api/goods-receipts/\${id}\`);
  }
  async createGoodsReceipt(data: any) {
    return this.request('/api/goods-receipts', { method: 'POST', body: data });
  }

  // Missing Invoices
  async getInvoice(id: string) {
    return this.request(\`/api/invoices/\${id}\`);
  }
  async createInvoice(data: any) {
    return this.request('/api/invoices', { method: 'POST', body: data });
  }
  async runThreeWayMatch(id: string) {
    return this.request(\`/api/invoices/\${id}/match\`, { method: 'PATCH' });
  }

  // Missing Payments
  async getPayment(id: string) {
    return this.request(\`/api/payments/\${id}\`);
  }
  async createPayment(data: any) {
    return this.request('/api/payments', { method: 'POST', body: data });
  }

  // Missing Quotes
  async getQuotation(id: string) {
    return this.request(\`/api/quotations/\${id}\`);
  }
  async createQuotation(data: any) {
    return this.request('/api/quotations', { method: 'POST', body: data });
  }
  async updateQuotationStatus(id: string, status: string) {
    return this.request(\`/api/quotations/\${id}/status\`, { method: 'PATCH', body: { status } });
  }
  async acceptQuotation(id: string) {
    return this.request(\`/api/quotations/\${id}/accept\`, { method: 'PATCH' });
  }

  // Missing POs
  async createPurchaseOrder(data: any) {
    return this.request('/api/purchase-orders', { method: 'POST', body: data });
  }
  async updatePurchaseOrderStatus(id: string, status: string) {
    return this.request(\`/api/purchase-orders/\${id}/status\`, { method: 'PATCH', body: { status } });
  }

  // Missing RFQs
  async updateRFQStatus(id: string, status: string) {
    return this.request(\`/api/rfqs/\${id}/status\`, { method: 'PATCH', body: { status } });
  }
  async publishRfq(id: string) {
    return this.request(\`/api/rfqs/\${id}/publish\`, { method: 'PATCH' });
  }
  async requestRfqApproval(id: string) {
    return this.request(\`/api/rfqs/\${id}/request-approval\`, { method: 'POST' });
  }
`;

if (!apiContent.includes('async runThreeWayMatch')) {
  apiContent = apiContent.replace('// Users', missingMethods + '\n  // Users');
  fs.writeFileSync(apiPath, apiContent);
  console.log('Added missing API methods to api.ts');
}
