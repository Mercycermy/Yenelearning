import { apiClient } from './apiClient';

export interface PaymentItem {
  id: string;
  txRef: string;
  amount: number;
  currency: string;
  purpose: 'grade_upgrade' | 'subscription' | 'school_license';
  status: 'pending' | 'success' | 'failed';
  childId?: string;
  targetGrade?: string;
  checkoutUrl?: string;
  createdAt: string;
}

export const paymentsRepository = {
  async initialize(data: {
    amount: number;
    purpose: 'grade_upgrade' | 'subscription' | 'school_license';
    childId?: string;
    targetGrade?: string;
    schoolId?: string;
    licenseQuantity?: number;
    returnUrl?: string;
  }): Promise<{ checkoutUrl: string; txRef: string; payment: PaymentItem }> {
    const res = await apiClient.postJson('/payments/initialize', data as Record<string, unknown>);
    return res as unknown as { checkoutUrl: string; txRef: string; payment: PaymentItem };
  },

  async verify(txRef: string): Promise<{ status: string; message: string; payment: PaymentItem }> {
    const res = await apiClient.getJson(`/payments/verify/${txRef}`);
    return res as unknown as { status: string; message: string; payment: PaymentItem };
  },

  async getMyHistory(): Promise<PaymentItem[]> {
    const list = await apiClient.getJsonList('/payments/my-history');
    return list as unknown as PaymentItem[];
  },
};
