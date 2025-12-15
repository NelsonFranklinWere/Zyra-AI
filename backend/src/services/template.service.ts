import { PrismaClient } from '@prisma/client';
import { LLMClient } from '../providers/llm/LLMClient';
import { env } from '../env';
import { sanitizeLLMOutput } from './llmSafety.service';
import { validateTemplateContent } from './templateApproval.service';

const prisma = new PrismaClient();

export interface RenderTemplateOptions {
  useLLM?: boolean; // Use LLM to paraphrase tone (optional)
  tone?: string; // Override template tone
}

export async function renderTemplate(
  templateName: string,
  orgId: string,
  variables: Record<string, string | number>,
  options?: RenderTemplateOptions
): Promise<string> {
  const template = await prisma.template.findUnique({
    where: {
      orgId_name: {
        orgId,
        name: templateName,
      },
    },
  });

  if (!template) {
    throw new Error(`Template "${templateName}" not found for organization`);
  }

  let content = template.content;

  // Simple Mustache-like replacement: {{variable}}
  // This is the deterministic, safe method - never let LLM alter these
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    content = content.replace(regex, String(value));
  }

  // Check for missing variables (safety check)
  const missingVars = content.match(/\{\{(\w+)\}\}/g);
  if (missingVars) {
    console.warn(`Template "${templateName}" has unmatched variables: ${missingVars.join(', ')}`);
    // Remove unmatched variables rather than leaving placeholders
    content = content.replace(/\{\{[\w]+\}\}/g, '');
  }

  // Optional: Use LLM to paraphrase for tone (if enabled and requested)
  if (options?.useLLM && env.LLM_PROVIDER !== 'none' && template.tone) {
    try {
      const paraphrased = await paraphraseTemplateWithLLM(content, template.tone, variables);
      
      // Sanitize LLM output
      const sanitized = sanitizeLLMOutput(paraphrased, variables as Record<string, string>);
      
      if (sanitized.allowed) {
        content = paraphrased;
      } else {
        console.warn('LLM output blocked due to violations:', sanitized.violations);
        // Use original content if LLM output contains disallowed content
      }
    } catch (error) {
      console.error('LLM template paraphrasing failed, using original:', error);
      // Continue with original content on error
    }
  }

  return content;
}

async function paraphraseTemplateWithLLM(
  renderedContent: string,
  tone: string,
  variables: Record<string, string | number>
): Promise<string> {
  const llmClient = new LLMClient();

  const prompt = `SYSTEM:
You are Zyra, a conversational sales assistant. The business tone is: "${tone}" (e.g., friendly, formal, salesy). You will produce a short reply (maximum 2 sentences) that follows the provided TEMPLATE exactly by replacing only the natural language parts (do NOT change placeholder names in double curly braces). Output ONLY the rendered message text (plain). Do not include any JSON or additional commentary.

TEMPLATE:
"${renderedContent}"

VARIABLES:
${JSON.stringify(variables)}

CONSTRAINTS:
- Do not invent numbers, prices, paybills or account numbers — those must match the variables supplied.
- Keep the result short, polite, and action-oriented.
- If the template requires a variable that is missing, return the string: "TEMPLATE_ERROR: missing variable <name>"

TASK:
Render the template in the requested tone and produce ONLY the final message text.

END.`;

  try {
    const response = await llmClient.generateReply(prompt, {
      maxTokens: 200,
      temperature: 0.7,
    });

    // Safety check: Verify no URLs, phone numbers, or financial instructions that weren't in template
    const checkResult = sanitizeLLMOutput(response, variables as Record<string, string>);
    if (!checkResult.allowed) {
      console.warn('LLM output contains violations, using original template:', checkResult.violations);
      throw new Error('LLM output validation failed');
    }
    return response.trim();
  } catch (error: any) {
    // If sanitization fails, throw to trigger fallback to original
    throw error;
  }
}

export async function getTemplate(orgId: string, name: string) {
  return prisma.template.findUnique({
    where: {
      orgId_name: {
        orgId,
        name,
      },
    },
  });
}

export async function listTemplates(orgId: string) {
  return prisma.template.findMany({
    where: { orgId },
    orderBy: { name: 'asc' },
  });
}

export async function createTemplate(
  orgId: string,
  data: { name: string; content: string; variables?: any; tone?: string }
) {
  return prisma.template.create({
    data: {
      orgId,
      ...data,
    },
  });
}

export async function updateTemplate(
  orgId: string,
  name: string,
  data: { content?: string; variables?: any; tone?: string }
) {
  return prisma.template.update({
    where: {
      orgId_name: {
        orgId,
        name,
      },
    },
    data,
  });
}

export async function deleteTemplate(orgId: string, name: string) {
  return prisma.template.delete({
    where: {
      orgId_name: {
        orgId,
        name,
      },
    },
  });
}

