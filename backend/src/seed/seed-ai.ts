import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed AI-related data for Sprint 3
 */
export async function seedAI() {
  console.log('🌱 Seeding AI data...');

  // Get or create test organization
  let org = await prisma.organization.findFirst({
    where: { name: 'Acme Shoes' },
  });

  if (!org) {
    // Create owner first
    const owner = await prisma.user.create({
      data: {
        name: 'Acme Owner',
        email: 'owner@acme.com',
        passwordHash: '$2b$10$dummyhash', // Dummy hash for seed
        role: 'OWNER',
      },
    });

    org = await prisma.organization.create({
      data: {
        name: 'Acme Shoes',
        ownerId: owner.id,
        automationEnabled: true,
      },
    });
  }

  // Seed products
  const products = [
    { name: 'Black Sneakers', price: 3500, description: 'Comfortable black sneakers', stock: 50 },
    { name: 'White Running Shoes', price: 4200, description: 'Lightweight running shoes', stock: 30 },
    { name: 'Red Canvas', price: 2800, description: 'Classic red canvas shoes', stock: 40 },
    { name: 'Blue Sports Shoes', price: 4500, description: 'High-performance sports shoes', stock: 25 },
    { name: 'Brown Leather', price: 5500, description: 'Premium brown leather shoes', stock: 20 },
    { name: 'Grey Casual', price: 3200, description: 'Casual grey shoes', stock: 35 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        orgId_name: {
          orgId: org.id,
          name: product.name,
        },
      },
      update: {},
      create: {
        orgId: org.id,
        name: product.name,
        price: product.price,
        description: product.description,
        stock: product.stock,
        isActive: true,
      },
    });
  }

  // Seed business memory
  await prisma.businessMemory.upsert({
    where: { orgId: org.id },
    update: {},
    create: {
      orgId: org.id,
      faqs: [
        { q: 'Do you deliver?', a: 'Yes, we deliver within Nairobi for KES 200. Free delivery for orders above KES 5000.' },
        { q: 'What payment methods do you accept?', a: 'We accept M-Pesa payments. You will receive an STK push when placing an order.' },
        { q: 'How long does delivery take?', a: 'Delivery typically takes 1-2 business days within Nairobi.' },
      ],
      instructions: {
        tone: 'friendly',
        style: 'casual',
        language: 'English and Swahili',
      },
      negotiationRules: {
        minPriceDropPercent: 5,
        allowNegotiation: true,
        maxDiscountPercent: 15,
      },
      deliveryRules: {
        minOrderForFreeDelivery: 5000,
        deliveryFee: 200,
        deliveryAreas: ['Nairobi', 'Westlands', 'Kilimani', 'Karen'],
      },
    },
  });

  // Seed templates
  const templates = [
    {
      name: 'greeting',
      content: 'Hello {{customer_name}}! 👋 How can I help you today?',
      tone: 'friendly',
    },
    {
      name: 'product_inquiry',
      content: 'Great choice! {{product_name}} is available at KES {{price}}. Would you like to place an order?',
      tone: 'friendly',
    },
    {
      name: 'price_request',
      content: '{{product_name}} costs KES {{price}}. Would you like more details?',
      tone: 'informative',
    },
    {
      name: 'order_placement',
      content: 'Perfect! Your order for {{product_name}} (Size: {{size}}, Color: {{color}}) has been created. Total: KES {{total}}. You will receive an M-Pesa prompt shortly.',
      tone: 'confirmation',
    },
    {
      name: 'payment_request',
      content: 'Please complete your payment of KES {{amount}} via M-Pesa. You should receive a prompt on your phone shortly.',
      tone: 'professional',
    },
    {
      name: 'payment_confirm',
      content: 'Thank you! Your payment of KES {{amount}} has been confirmed. Your order #{{order_id}} is being processed and will be delivered soon!',
      tone: 'gratitude',
    },
    {
      name: 'rider_notify',
      content: 'New delivery request: Order #{{order_id}} to {{location}}. Customer: {{customer_phone}}',
      tone: 'instructional',
    },
  ];

  for (const template of templates) {
    await prisma.template.upsert({
      where: {
        orgId_name: {
          orgId: org.id,
          name: template.name,
        },
      },
      update: {},
      create: {
        orgId: org.id,
        name: template.name,
        content: template.content,
        tone: template.tone,
        status: 'approved',
      },
    });
  }

  console.log('✅ AI data seeded successfully');
}

// Run if called directly
if (require.main === module) {
  seedAI()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

