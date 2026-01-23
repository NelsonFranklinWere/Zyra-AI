import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function processMessage(orgId: string, message: string, from: string) {
  // Simple intent detection
  const intent = detectIntent(message);
  
  // Get business rules
  const rules = await prisma.conversationRule.findMany({
    where: { orgId, enabled: true },
    orderBy: { priority: 'desc' },
  });

  // Find matching rule
  const matchedRule = rules.find(rule => {
    const trigger = rule.value as any;
    return trigger.trigger?.type === 'intent' && trigger.trigger?.value === intent;
  });

  // Generate response
  let response = "Thank you for your message. How can I help you today?";
  let actions = [];

  if (matchedRule) {
    const ruleValue = matchedRule.value as any;
    if (ruleValue.actions) {
      actions = ruleValue.actions;
      // Simple template response
      if (actions.find(a => a.type === 'send_message')) {
        response = generateResponse(intent, orgId);
      }
    }
  }

  return {
    intent,
    response,
    actions,
    matchedRule: matchedRule?.key || null,
  };
}

function detectIntent(message: string): string {
  const text = message.toLowerCase();
  
  if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
    return 'greeting';
  }
  if (text.includes('price') || text.includes('cost') || text.includes('how much')) {
    return 'price_inquiry';
  }
  if (text.includes('buy') || text.includes('order') || text.includes('purchase')) {
    return 'order_intent';
  }
  if (text.includes('delivery') || text.includes('shipping')) {
    return 'delivery_query';
  }
  if (text.includes('yes') || text.includes('confirm')) {
    return 'confirmation';
  }
  
  return 'general_inquiry';
}

function generateResponse(intent: string, orgId: string): string {
  const responses = {
    greeting: "Hello! Welcome to our store. How can I help you today?",
    price_inquiry: "I'd be happy to help with pricing. Which product are you interested in?",
    order_intent: "Great! I can help you place an order. What would you like to buy?",
    delivery_query: "We deliver within 24 hours in most areas. What's your location?",
    confirmation: "Perfect! Let me process that for you right away.",
    general_inquiry: "Thank you for reaching out. How can I assist you today?",
  };
  
  return responses[intent] || responses.general_inquiry;
}