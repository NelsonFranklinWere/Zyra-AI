export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  orgId: string;
  name: string;
  price: number;
  description: string | null;
  sku: string | null;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationRule {
  id: string;
  orgId: string;
  key: string;
  value: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  orgId: string | null;
  action: string;
  resource: string | null;
  resourceId: string | null;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

