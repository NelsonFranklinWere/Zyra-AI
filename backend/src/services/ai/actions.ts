/**
 * Action definitions for Sprint 3
 * Allowed actions enum
 */
export enum ActionType {
  SEND_PRODUCT_CATALOG = 'SEND_PRODUCT_CATALOG',
  ASK_FOR_SIZE = 'ASK_FOR_SIZE',
  ASK_FOR_COLOR = 'ASK_FOR_COLOR',
  ASK_FOR_LOCATION = 'ASK_FOR_LOCATION',
  START_ORDER = 'START_ORDER',
  CONFIRM_ORDER = 'CONFIRM_ORDER',
  INIT_STK_PUSH = 'INIT_STK_PUSH',
  REQUEST_PAYMENT_PROOF = 'REQUEST_PAYMENT_PROOF',
  SEND_DELIVERY_INSTRUCTIONS = 'SEND_DELIVERY_INSTRUCTIONS',
  SEND_FOLLOWUP = 'SEND_FOLLOWUP',
  ALERT_OWNER = 'ALERT_OWNER',
  SAVE_FAQ = 'SAVE_FAQ',
  UPDATE_MEMORY = 'UPDATE_MEMORY',
}

export interface ActionContext {
  orgId: string;
  conversationId: string;
  messageId?: string;
  userId?: string;
  parsedFields?: any;
  intent?: string;
  orderId?: string;
  metadata?: Record<string, any>;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

