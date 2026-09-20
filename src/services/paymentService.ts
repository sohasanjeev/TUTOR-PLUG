import { Payment } from '@/lib/types';

class PaymentService {
  private payments: Payment[] = [];

  async getStudentPayments(studentId: string): Promise<Payment[]> {
    await new Promise((res) => setTimeout(res, 120));
    return this.payments.filter((p) => p.student_id === studentId);
  }

  async getTutorPayments(tutorUserId: string): Promise<Payment[]> {
    await new Promise((res) => setTimeout(res, 120));
    return this.payments.filter((p) => p.tutor_id === tutorUserId);
  }

  async getAllPayments(): Promise<Payment[]> {
    await new Promise((res) => setTimeout(res, 100));
    return this.payments;
  }
}

export const paymentService = new PaymentService();
