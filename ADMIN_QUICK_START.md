# Zyra Admin Quick-Start Guide

Quick guide for business owners and administrators.

## 🚀 Getting Started

### 1. Login
- Go to `http://localhost:3000`
- Login with: `owner@acme.com` / `password123`

### 2. Dashboard Overview
The dashboard shows:
- Recent conversations
- Order status
- System metrics
- Quick actions

---

## 📝 Templates

### Creating a Template

1. Go to **Templates** page
2. Click **Create Template**
3. Fill in:
   - **Name**: e.g., "payment_request"
   - **Content**: Use `{{variable}}` for placeholders
     ```
     Hi {{customer_name}}, pay KES {{amount}} for order #{{order_id}}
     ```
   - **Tone**: friendly, formal, salesy
   - **Sensitive**: Check if contains payment/account info

4. **Status**:
   - If marked "Sensitive" or you're STAFF → requires admin approval
   - Otherwise → draft status

### Approving Templates

1. Go to **Moderation** page
2. View pending templates
3. **Approve** or **Reject** with notes
4. Approved templates can be used in rules

---

## ⚙️ Rules

### Creating Automation Rules

1. Go to **Rules** page
2. Click **Create Rule**
3. Configure:
   ```json
   {
     "key": "order_rule_v1",
     "value": {
       "name": "Handle Order Requests",
       "enabled": true,
       "priority": 100,
       "trigger": {
         "type": "intent",
         "value": "order_request"
       },
       "conditions": [
         {
           "field": "product.stock",
           "op": ">",
           "value": 0
         }
       ],
       "actions": [
         {
           "type": "create_order"
         },
         {
           "type": "send_message",
           "params": {
             "template": "payment_request"
           }
         }
       ]
     }
   }
   ```

### Testing Rules

1. Go to **Simulate** page
2. Enter test message: "I want to buy black shoes"
3. Check **Conversations** to see:
   - Detected intent
   - Entities extracted
   - Rules matched
   - Actions executed

---

## 💬 Conversations

### Viewing Conversations

1. Go to **Conversations** page
2. Click any conversation to see:
   - Message history
   - Processing timeline (traces)
   - Intent & entities detected
   - Orders created

### Escalating to Human

1. In conversation view, click **Escalate**
2. Conversation appears in **Moderation > Escalations**
3. Staff can **Claim** and respond manually

---

## 💰 Payments

### Checking Payment Status

1. Go to **Orders** page
2. View order details
3. Check payment attempts and status

### Manual Payment Confirmation

If customer paid but system didn't detect:

1. Go to **Orders** > Select order
2. Find payment attempt ID
3. Use **Reconciliation** page or API:
   ```
   POST /api/admin/payments/:attemptId/manual-success
   {
     "providerRef": "MPESA_RECEIPT_NUMBER",
     "notes": "Customer confirmed payment"
   }
   ```

### Reconciliation

1. Go to **Reconciliation** page
2. Click **Run Reconciliation**
3. Review unmatched payments
4. Manually reconcile if needed

---

## 📊 Usage & Billing

### Viewing Usage

1. Go to **Usage** page
2. See:
   - Messages sent/received
   - LLM calls used
   - Orders created
   - Estimated costs

### Managing LLM Budget

1. Contact admin to adjust daily budget
2. Budget enforced automatically (returns to rule-based when exceeded)
3. View usage trends in dashboard

---

## 🛡️ Moderation

### Template Approval

1. **Moderation** > **Templates** tab
2. Review pending templates
3. Check for:
   - Sensitive information
   - Proper variable usage
   - Appropriate tone
4. **Approve** or **Reject**

### Handling Escalations

1. **Moderation** > **Escalations** tab
2. Review conversations requiring attention
3. **Claim** conversation
4. Respond manually via Conversations page
5. **Unclaim** when done

---

## ⚠️ Troubleshooting

### Messages Not Processing

1. Check **Monitoring** dashboard for queue status
2. Review **DLQ** for failed jobs
3. Check organization automation is enabled

### Payment Issues

1. Verify organization KYC status (`verified` required)
2. Check payment attempt status in Orders
3. Run reconciliation
4. Contact support if persistent

### Template Not Sending

1. Verify template is **approved**
2. Check template status in Templates page
3. For WhatsApp templates, ensure registered with provider

---

## 🔐 Security Notes

- Sensitive templates require admin approval
- LLM-generated messages are sanitized for safety
- Payment operations require OWNER/ADMIN role
- All actions are logged in audit trail

---

## 📞 Support

For technical issues:
- Check logs in Monitoring dashboard
- Review DLQ for error details
- Contact technical support with error details

For business questions:
- Review templates and rules configuration
- Check Usage page for quotas
- Contact admin for budget adjustments

