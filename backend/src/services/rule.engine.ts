import { PrismaClient } from '@prisma/client';
import { Conversation, Message } from '@prisma/client';

const prisma = new PrismaClient();

export interface RuleAction {
  type: 'send_message' | 'create_order' | 'trigger_payment' | 'schedule_followup' | 'escalate_to_agent';
  params: Record<string, any>;
  priority: number;
  ruleId: string;
}

export interface RuleEvaluationContext {
  conversation: Conversation;
  message: Message;
  intent: string;
  entities: any;
  products?: any[];
}

async function evaluateCondition(
  condition: { field: string; op: string; value: any },
  context: RuleEvaluationContext
): Promise<boolean> {
  const { field, op, value } = condition;

  // Parse field path (e.g., "product.stock", "message.text")
  const [entity, ...path] = field.split('.');

  let actualValue: any;

  if (entity === 'product' && path[0] === 'stock' && context.entities?.products?.[0]) {
    const product = await prisma.product.findUnique({
      where: { id: context.entities.products[0].productId },
    });
    actualValue = product?.stock || 0;
  } else if (entity === 'intent') {
    actualValue = context.intent;
  } else if (entity === 'message' && path[0] === 'text') {
    actualValue = context.message.text;
  } else {
    actualValue = (context.entities as any)?.[entity]?.[path.join('.')] || null;
  }

  // Evaluate operator
  switch (op) {
    case '>':
      return Number(actualValue) > Number(value);
    case '<':
      return Number(actualValue) < Number(value);
    case '>=':
      return Number(actualValue) >= Number(value);
    case '<=':
      return Number(actualValue) <= Number(value);
    case '==':
    case '=':
      return actualValue == value;
    case '!=':
      return actualValue != value;
    case 'contains':
      return String(actualValue || '').toLowerCase().includes(String(value).toLowerCase());
    case 'exists':
      return actualValue !== null && actualValue !== undefined;
    default:
      return false;
  }
}

export async function evaluateRules(context: RuleEvaluationContext): Promise<RuleAction[]> {
  const { conversation, intent } = context;

  // Get all enabled rules for the organization
  const rules = await prisma.conversationRule.findMany({
    where: {
      orgId: conversation.orgId,
      enabled: true,
    },
    orderBy: { priority: 'desc' },
  });

  const matchedActions: RuleAction[] = [];

  for (const rule of rules) {
    const ruleData = rule.value as any;

    // Check trigger
    const trigger = ruleData.trigger;
    if (!trigger) continue;

    let triggerMatches = false;

    if (trigger.type === 'intent' && trigger.value === intent) {
      triggerMatches = true;
    } else if (trigger.type === 'keyword') {
      const keywords = Array.isArray(trigger.value) ? trigger.value : [trigger.value];
      triggerMatches = keywords.some((kw: string) =>
        context.message.text.toLowerCase().includes(kw.toLowerCase())
      );
    } else if (trigger.type === 'event') {
      // Event-based triggers (for future use)
      triggerMatches = false;
    }

    if (!triggerMatches) continue;

    // Evaluate conditions
    const conditions = ruleData.conditions || [];
    let allConditionsMet = true;

    for (const condition of conditions) {
      const met = await evaluateCondition(condition, context);
      if (!met) {
        allConditionsMet = false;
        break;
      }
    }

    if (allConditionsMet) {
      // Add actions from this rule
      const actions = ruleData.actions || [];
      for (const action of actions) {
        matchedActions.push({
          ...action,
          priority: ruleData.priority || 100,
          ruleId: rule.id,
        });
      }
    }
  }

  // Sort by priority
  return matchedActions.sort((a, b) => b.priority - a.priority);
}

