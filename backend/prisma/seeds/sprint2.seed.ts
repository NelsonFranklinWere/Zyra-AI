import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedSprint2() {
  console.log('🌱 Seeding Sprint 2 data...');

  // Create organization
  const org = await prisma.organization.upsert({
    where: { id: 'seed-org-1' },
    update: {},
    create: {
      id: 'seed-org-1',
      name: 'Acme Shoes',
      ownerId: 'seed-owner-1',
    },
  });

  // Create owner user
  const ownerPasswordHash = await bcrypt.hash('password123', 10);
  const owner = await prisma.user.upsert({
    where: { id: 'seed-owner-1' },
    update: {},
    create: {
      id: 'seed-owner-1',
      name: 'John Owner',
      email: 'owner@acme.com',
      passwordHash: ownerPasswordHash,
      role: 'OWNER',
      orgId: org.id,
    },
  });

  // Create staff members
  const sellerPasswordHash = await bcrypt.hash('password123', 10);
  const seller = await prisma.user.upsert({
    where: { id: 'seed-seller-1' },
    update: {},
    create: {
      id: 'seed-seller-1',
      name: 'Jane Seller',
      email: 'seller@acme.com',
      passwordHash: sellerPasswordHash,
      role: 'STAFF',
      orgId: org.id,
    },
  });

  const riderPasswordHash = await bcrypt.hash('password123', 10);
  const rider = await prisma.user.upsert({
    where: { id: 'seed-rider-1' },
    update: {},
    create: {
      id: 'seed-rider-1',
      name: 'Bob Rider',
      email: 'rider@acme.com',
      passwordHash: riderPasswordHash,
      role: 'STAFF',
      orgId: org.id,
    },
  });

  // Create products
  const products = [
    {
      name: 'Black Sneakers Size 40',
      price: 4500,
      description: 'Comfortable black sneakers',
      sku: 'SNEAK-BLK-40',
      stock: 10,
      tags: ['sneakers', 'black', 'size-40'],
    },
    {
      name: 'Black Sneakers Size 42',
      price: 4500,
      description: 'Comfortable black sneakers',
      sku: 'SNEAK-BLK-42',
      stock: 15,
      tags: ['sneakers', 'black', 'size-42'],
    },
    {
      name: 'White Running Shoes Size 41',
      price: 5500,
      description: 'Lightweight white running shoes',
      sku: 'RUN-WHT-41',
      stock: 8,
      tags: ['running', 'white', 'size-41'],
    },
    {
      name: 'Brown Leather Boots Size 42',
      price: 8500,
      description: 'Premium brown leather boots',
      sku: 'BOOT-BRN-42',
      stock: 5,
      tags: ['boots', 'brown', 'leather', 'size-42'],
    },
    {
      name: 'Red Casual Shoes Size 40',
      price: 4000,
      description: 'Stylish red casual shoes',
      sku: 'CAS-RED-40',
      stock: 12,
      tags: ['casual', 'red', 'size-40'],
    },
    {
      name: 'Blue Sports Shoes Size 43',
      price: 6000,
      description: 'Durable blue sports shoes',
      sku: 'SPRT-BLU-43',
      stock: 7,
      tags: ['sports', 'blue', 'size-43'],
    },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: {
        orgId_sku: {
          orgId: org.id,
          sku: productData.sku,
        },
      },
      update: {},
      create: {
        orgId: org.id,
        ...productData,
        price: productData.price.toString(),
      },
    });
  }

  // Create templates
  const templates = [
    {
      name: 'greeting',
      content: 'Hello {{customer_name}}! 👋 Welcome to {{business_name}}. How can I help you today?',
      variables: ['customer_name', 'business_name'],
      tone: 'friendly',
    },
    {
      name: 'payment_request',
      content: 'Hi {{customer_name}}. To complete order #{{order_id}} for {{product_name}} ({{qty}}x), please pay KES {{amount}} via MPESA Paybill {{paybill}} or press the STK button.',
      variables: ['customer_name', 'order_id', 'product_name', 'qty', 'amount', 'paybill'],
      tone: 'professional',
    },
    {
      name: 'payment_confirm',
      content: 'Thank you! Payment for order #{{order_id}} has been confirmed. Your order will be delivered to {{address}} within 24 hours.',
      variables: ['order_id', 'address'],
      tone: 'friendly',
    },
    {
      name: 'rider_notify',
      content: '🚴 New order! Order #{{order_id}} from {{customer_phone}}. Items: {{items}}. Total: KES {{total}}. Delivery address: {{address}}',
      variables: ['order_id', 'customer_phone', 'items', 'total', 'address'],
      tone: 'professional',
    },
  ];

  for (const templateData of templates) {
    await prisma.template.upsert({
      where: {
        orgId_name: {
          orgId: org.id,
          name: templateData.name,
        },
      },
      update: {},
      create: {
        orgId: org.id,
        ...templateData,
        variables: templateData.variables,
      },
    });
  }

  // Create default rules
  const rules = [
    {
      key: 'product_inquiry_rule',
      value: {
        name: 'Product Inquiry Response',
        enabled: true,
        priority: 100,
        trigger: {
          type: 'intent',
          value: 'product_inquiry',
        },
        conditions: [],
        actions: [
          {
            type: 'send_message',
            params: {
              template: 'greeting',
              variables: {
                customer_name: 'Customer',
                business_name: 'Acme Shoes',
              },
            },
          },
        ],
      },
    },
    {
      key: 'order_request_rule',
      value: {
        name: 'Order Request Handler',
        enabled: true,
        priority: 200,
        trigger: {
          type: 'intent',
          value: 'order_request',
        },
        conditions: [
          {
            field: 'product.stock',
            op: '>',
            value: 0,
          },
        ],
        actions: [
          {
            type: 'create_order',
            params: {
              holdSeconds: 300,
            },
          },
          {
            type: 'send_message',
            params: {
              template: 'payment_request',
              variables: {
                paybill: '123456',
              },
            },
          },
        ],
      },
    },
    {
      key: 'payment_confirm_rule',
      value: {
        name: 'Payment Confirmation',
        enabled: true,
        priority: 150,
        trigger: {
          type: 'intent',
          value: 'payment_confirm',
        },
        conditions: [],
        actions: [
          {
            type: 'send_message',
            params: {
              template: 'payment_confirm',
            },
          },
          {
            type: 'escalate_to_agent',
            params: {},
          },
        ],
      },
    },
  ];

  for (const ruleData of rules) {
    await prisma.conversationRule.upsert({
      where: {
        orgId_key: {
          orgId: org.id,
          key: ruleData.key,
        },
      },
      update: {},
      create: {
        orgId: org.id,
        ...ruleData,
        value: ruleData.value as any,
      },
    });
  }

  console.log('✅ Sprint 2 seed data created');
  console.log('   Owner: owner@acme.com / password123');
  console.log('   Seller: seller@acme.com / password123');
  console.log('   Rider: rider@acme.com / password123');
}

