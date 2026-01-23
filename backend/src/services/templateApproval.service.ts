import { PrismaClient } from '@prisma/client';
import { getWhatsAppProvider } from '../providers/whatsapp';
import { createAuditLog } from './auditLog';

const prisma = new PrismaClient();

export interface TemplateApprovalInput {
  templateId: string;
  action: 'approve' | 'reject';
  notes?: string;
  userId: string;
}

export async function approveTemplate(input: TemplateApprovalInput): Promise<void> {
  const template = await prisma.template.findUnique({
    where: { id: input.templateId },
  });

  if (!template) {
    throw new Error('Template not found');
  }

  if (input.action === 'approve') {
    // Update template status
    await prisma.template.update({
      where: { id: input.templateId },
      data: {
        status: 'approved',
        approvedBy: input.userId,
        approvedAt: new Date(),
      },
    });

    // If it's a WhatsApp template, register with provider
    if (template.isWhatsappTemplate) {
      const provider = getWhatsAppProvider();
      if (provider.name() === 'meta' && 'registerTemplate' in provider) {
        try {
          const providerTemplateId = await (provider as any).registerTemplate(
            template.orgId,
            template.name
          );
          
          await prisma.template.update({
            where: { id: input.templateId },
            data: {
              providerTemplateId,
              status: 'pending_approval', // Meta requires their approval
            },
          });
        } catch (error: any) {
          console.error('Failed to register template with provider:', error);
          // Template approved but provider registration failed
        }
      }
    }

    await createAuditLog({
      userId: input.userId,
      orgId: template.orgId,
      action: 'TEMPLATE_APPROVED',
      resource: 'template',
      resourceId: input.templateId,
      metadata: { templateName: template.name, notes: input.notes },
    });
  } else {
    // Reject
    await prisma.template.update({
      where: { id: input.templateId },
      data: {
        status: 'rejected',
      },
    });

    await createAuditLog({
      userId: input.userId,
      orgId: template.orgId,
      action: 'TEMPLATE_REJECTED',
      resource: 'template',
      resourceId: input.templateId,
      metadata: { templateName: template.name, notes: input.notes },
    });
  }
}

export async function validateTemplateContent(content: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  // Check for unescaped variables (should be {{variable}})
  // First replace all valid {{variable}} patterns, then check for remaining single braces
  const withoutValidVars = content.replace(/\{\{[^}]+\}\}/g, '');
  const unescapedVars = withoutValidVars.match(/[{}]/g) || [];
  if (unescapedVars.length > 0) {
    errors.push('Template contains unescaped variables. Use {{variable}} format.');
  }

  // Check for sensitive patterns
  const sensitivePatterns = [
    /\b\d{4,}\b/g, // Long numbers (could be account numbers)
    /\b[A-Z0-9]{10,}\b/g, // Long alphanumeric (could be account codes)
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(content)) {
      errors.push('Template may contain sensitive information. Mark as sensitive and require approval.');
    }
  }

  // Check for URLs (should be in variables only)
  const urlPattern = /https?:\/\/[^\s]+/g;
  if (urlPattern.test(content) && !content.includes('{{')) {
    errors.push('URLs in templates must be passed as variables for security.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function getPendingTemplates(orgId?: string) {
  return prisma.template.findMany({
    where: {
      status: 'pending_approval',
      ...(orgId && { orgId }),
    },
    orderBy: { createdAt: 'asc' },
  });
}

