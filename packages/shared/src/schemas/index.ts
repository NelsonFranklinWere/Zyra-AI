import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createOrgSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
});

export const addMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['OWNER', 'ADMIN', 'STAFF']).default('STAFF'),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.number().positive('Price must be positive'),
  description: z.string().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const createRuleSchema = z.object({
  key: z.string().min(1, 'Rule key is required'),
  value: z.record(z.any()),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateRuleInput = z.infer<typeof createRuleSchema>;

