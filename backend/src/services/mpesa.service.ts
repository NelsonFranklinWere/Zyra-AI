import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { env } from '../env';
import { handlePaymentSuccess } from './order.service';
import { createAnalyticsEvent } from './analytics.service';

const prisma = new PrismaClient();

interface DarajaSTKRequest {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: number;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

export class MpesaService {
  private apiClient: AxiosInstance;
  private consumerKey: string;
  private consumerSecret: string;
  private shortcode: string;
  private passkey: string;
  private callbackUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.consumerKey = env.MPESA_CONSUMER_KEY || '';
    this.consumerSecret = env.MPESA_CONSUMER_SECRET || '';
    this.shortcode = env.MPESA_SHORTCODE || '';
    this.passkey = env.MPESA_PASSKEY || '';
    this.callbackUrl = process.env.MPESA_CALLBACK_URL || `${process.env.BASE_URL}/api/webhooks/mpesa`;

    const baseUrl =
      env.MPESA_ENV === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

    this.apiClient = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
    });
  }

  async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.post(
        `${this.apiClient.defaults.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
        {},
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Token expires in 3600 seconds
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 60) * 1000);

      return this.accessToken;
    } catch (error: any) {
      console.error('MPESA OAuth error:', error.response?.data || error.message);
      throw new Error('Failed to get MPESA access token');
    }
  }

  async initiateSTKPush(
    phoneNumber: string,
    amount: number,
    accountReference: string,
    orderId: string
  ): Promise<{ checkoutRequestId: string; responseCode: string; responseDescription: string }> {
    try {
      const token = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = this.generatePassword(timestamp);

      const request: DarajaSTKRequest = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber.replace(/^\+/, ''),
        PartyB: this.shortcode,
        PhoneNumber: phoneNumber.replace(/^\+/, ''),
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: `Order ${orderId}`,
      };

      const response = await this.apiClient.post(
        '/mpesa/stkpush/v1/processrequest',
        request,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data;

      // Log callback
      await prisma.mpesaCallback.create({
        data: {
          payload: result,
          eventType: 'stk_push',
          providerRef: result.CheckoutRequestID,
        },
      });

      return {
        checkoutRequestId: result.CheckoutRequestID,
        responseCode: result.ResponseCode,
        responseDescription: result.ResponseDescription || result.CustomerMessage,
      };
    } catch (error: any) {
      console.error('MPESA STK error:', error.response?.data || error.message);
      throw error;
    }
  }

  async handleSTKCallback(payload: any): Promise<void> {
    try {
      const body = payload.Body?.stkCallback || payload;

      // Log callback
      await prisma.mpesaCallback.create({
        data: {
          payload,
          eventType: 'stk_result',
          providerRef: body.CheckoutRequestID,
          processed: false,
        },
      });

      const resultCode = body.ResultCode;
      const checkoutRequestId = body.CheckoutRequestID;

      if (resultCode === 0) {
        // Success
        const callbackMetadata = body.CallbackMetadata?.Item || [];
        const mpesaReceiptNumber = callbackMetadata.find(
          (item: any) => item.Name === 'MpesaReceiptNumber'
        )?.Value;

        // Find payment attempt by checkout request ID
        const paymentAttempt = await prisma.paymentAttempt.findFirst({
          where: {
            externalRef: checkoutRequestId,
          },
          include: { order: true },
        });

        if (paymentAttempt) {
          // Update payment attempt
          await prisma.paymentAttempt.update({
            where: { id: paymentAttempt.id },
            data: {
              status: 'SUCCESS',
              providerRef: mpesaReceiptNumber,
              callbackPayload: payload,
            },
          });

          // Handle payment success
          await handlePaymentSuccess(paymentAttempt.orderId);

          await createAnalyticsEvent({
            orgId: paymentAttempt.order.orgId,
            eventType: 'payment_success',
            payload: {
              orderId: paymentAttempt.orderId,
              attemptId: paymentAttempt.id,
              mpesaReceipt: mpesaReceiptNumber,
            },
          });
        }

        // Mark callback as processed
        await prisma.mpesaCallback.updateMany({
          where: { providerRef: checkoutRequestId, processed: false },
          data: { processed: true, processedAt: new Date() },
        });
      } else {
        // Failed
        const paymentAttempt = await prisma.paymentAttempt.findFirst({
          where: { externalRef: checkoutRequestId },
        });

        if (paymentAttempt) {
          await prisma.paymentAttempt.update({
            where: { id: paymentAttempt.id },
            data: {
              status: 'FAILED',
              callbackPayload: payload,
              metadata: {
                ...(paymentAttempt.metadata as any),
                error: body.ResultDesc,
              },
            },
          });
        }

        await prisma.mpesaCallback.updateMany({
          where: { providerRef: checkoutRequestId, processed: false },
          data: { processed: true, processedAt: new Date() },
        });
      }
    } catch (error: any) {
      console.error('STK callback handling error:', error);
      throw error;
    }
  }

  async queryTransactionStatus(checkoutRequestId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = this.generatePassword(timestamp);

      const response = await this.apiClient.post(
        '/mpesa/stkpushquery/v1/query',
        {
          BusinessShortCode: this.shortcode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Transaction query error:', error.response?.data || error.message);
      throw error;
    }
  }

  private generatePassword(timestamp: string): string {
    const data = `${this.shortcode}${this.passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
  }

  async reconcilePayments(since: Date): Promise<{
    unmatched: Array<{ attempt: any; reason: string }>;
    reconciled: number;
  }> {
    // Find payment attempts that need reconciliation
    const attempts = await prisma.paymentAttempt.findMany({
      where: {
        status: { in: ['INITIATED', 'PENDING'] },
        createdAt: { gte: since },
        externalRef: { not: null },
      },
      include: { order: true },
    });

    const unmatched: Array<{ attempt: any; reason: string }> = [];
    let reconciled = 0;

    for (const attempt of attempts) {
      try {
        // Query transaction status
        const status = await this.queryTransactionStatus(attempt.externalRef!);

        if (status.ResultCode === 0) {
          // Transaction successful - update
          await prisma.paymentAttempt.update({
            where: { id: attempt.id },
            data: {
              status: 'SUCCESS',
              providerRef: status.MpesaReceiptNumber,
            },
          });

          await handlePaymentSuccess(attempt.orderId);
          reconciled++;
        } else {
          // Failed or still pending
          if (status.ResultCode !== 1032) {
            // Not still pending
            await prisma.paymentAttempt.update({
              where: { id: attempt.id },
              data: {
                status: 'FAILED',
                metadata: {
                  ...(attempt.metadata as any),
                  reconciliationError: status.ResultDesc,
                },
              },
            });
          } else {
            unmatched.push({
              attempt,
              reason: 'Still pending',
            });
          }
        }
      } catch (error: any) {
        unmatched.push({
          attempt,
          reason: error.message,
        });
      }
    }

    return { unmatched, reconciled };
  }
}

export const mpesaService = new MpesaService();

