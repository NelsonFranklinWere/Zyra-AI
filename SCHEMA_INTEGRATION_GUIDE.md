# Schema Integration Guide

## Overview

You've provided new Prisma schema models that differ from the existing schema. This guide explains the differences and how to integrate them.

## Current Schema vs. New Schema

### Current Models
- `ConversationRule` - Key/value JSON structure for automation rules
- `Template` - String status field
- `Order` - Uses `items` JSONB (supports multiple products per order)
- `PaymentAttempt` - Detailed payment tracking with callbacks
- `ProcessingTrace` - Detailed processing traces

### New Models
- `Rule` - Structured with type/trigger/action enums
- `Template` - Enhanced with TemplateStatus enum
- `OrderSimple` - Single product per order structure
- `Payment` - Simplified payment model
- `Trace` - Simplified trace with status enum

## Integration Options

### Option 1: Keep Both (Recommended)
Add the new models alongside existing ones with different names/table names. This allows gradual migration.

**Pros:**
- No breaking changes
- Can test new models
- Gradual migration path

**Cons:**
- Two models to maintain
- More complexity

### Option 2: Replace Existing
Replace existing models with new ones. Requires migration script.

**Pros:**
- Single model set
- Cleaner schema

**Cons:**
- Breaking changes
- Requires data migration
- Risk of data loss

### Option 3: Enhance Existing
Update existing models to include new fields/enums while keeping backward compatibility.

**Pros:**
- Maintains existing structure
- Adds new capabilities

**Cons:**
- Models become more complex
- Some fields may be redundant

## Recommended Approach

**Use Option 1 for now:**
1. Add new enums to schema
2. Add new models with different table names
3. Use both models in parallel
4. Migrate data gradually
5. Deprecate old models after migration

## Implementation Steps

### Step 1: Add New Enums
```prisma
// Add to schema.prisma
enum RuleType {
  KEYWORD
  INTENT
  FALLBACK
}

enum RuleTrigger {
  MESSAGE_RECEIVED
  ORDER_PLACED
  PAYMENT_CONFIRMED
}

// ... (all other enums)
```

### Step 2: Add New Models
Use the models from `ALTERNATIVE_SCHEMA_MODELS.prisma` file.

### Step 3: Update Relations
Add relations to Organization model:
```prisma
model Organization {
  // ... existing fields
  rules Rule[]
  orderSimples OrderSimple[]
  payments Payment[]
  traces Trace[]
}
```

### Step 4: Generate Migration
```bash
cd apps/backend
npx prisma migrate dev --name add_alternative_models
npx prisma generate
```

### Step 5: Update Code
Update service files to use new models where appropriate.

## LLM Service Code Fixes

The provided LLM service code examples had incorrect API calls:
- ❌ `client.responses.create()` - Doesn't exist
- ✅ `openai.chat.completions.create()` - Correct

See `apps/backend/src/services/llm/enhanced-services.ts` for corrected implementations.

## Files Created

1. **`ALTERNATIVE_SCHEMA_MODELS.prisma`** - New models with explanations
2. **`enhanced-services.ts`** - Corrected LLM service implementations
3. **`SCHEMA_INTEGRATION_GUIDE.md`** - This guide

## Next Steps

1. Review the alternative models
2. Decide on integration approach
3. Run migration if adding new models
4. Update service code to use new models
5. Test thoroughly before deprecating old models

