# Email Configuration Guide for OTP Service

## Quick Setup

To enable email OTP verification, you need to configure SMTP settings in `backend/.env`:

### For Gmail:

1. **Enable 2-Step Verification** on your Google account
2. **Generate an App Password**:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Copy the 16-character password

3. **Update `backend/.env`**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
SMTP_FROM=Zyra Platform <your_email@gmail.com>
```

### For Other Email Providers:

#### Outlook/Hotmail:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
```

#### SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM=Zyra Platform <noreply@zyra.com>
```

#### Mailgun:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_smtp_username
SMTP_PASS=your_mailgun_smtp_password
```

## OTP Configuration

- **Expiration Time**: 3 minutes (180 seconds)
- **Code Length**: 6 digits
- **Max Attempts**: 3 per OTP code

## Development Mode

In development mode (`NODE_ENV !== 'production'`), if email is not configured:
- OTP codes are logged to console for testing
- OTP is still stored in database
- You can find the code in backend logs

## Testing Email Configuration

After configuring SMTP, restart the backend and try sending an OTP. Check backend logs for:
- `OTP email sent successfully to: email@example.com` ✅
- `Failed to send OTP email:` ❌ (check credentials)

## Troubleshooting

### "Email service not configured"
- Set `SMTP_USER` and `SMTP_PASS` in `backend/.env`
- Restart backend server

### "Authentication failed"
- For Gmail: Use App Password, not regular password
- Check 2-Step Verification is enabled
- Verify SMTP credentials are correct

### "Email not received"
- Check spam/junk folder
- Verify email address is correct
- Check backend logs for send errors
- In development, check console logs for OTP code

## Current Status

Check your configuration:
```bash
cd backend
grep "^SMTP_" .env
```

If you see `your_email@gmail.com`, update it with your actual email credentials.

